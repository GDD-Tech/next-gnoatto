'use client'
// ─────────────────────────────────────────────────────────────────────────────
// Armazenamento persistente da lista de veículos contados.
//
// Antes a lista inteira era salva em localStorage ('vehicleList'), que tem um
// limite de ~5 MiB por origem. Com ~7–8 mil registros esse limite era atingido,
// o localStorage.setItem lançava QuotaExceededError e:
//   - os novos registros deixavam de ser salvos (perdidos ao recarregar);
//   - o handler de clique era interrompido (toast não aparecia, modal de eixos
//     não fechava, o frame não avançava).
//
// Agora os dados ficam no IndexedDB (capacidade de centenas de MB/GB), com um
// cache em memória para leitura síncrona. As escritas são assíncronas,
// serializadas e coalescidas (sempre grava o estado mais recente) e NUNCA
// lançam exceção para quem chama — falhas são notificadas via onStorageError.
// ─────────────────────────────────────────────────────────────────────────────

const DB_NAME = 'gnoatto-contador';
const DB_VERSION = 1;
const STORE_NAME = 'kv';
const VEHICLES_KEY = 'vehicleList';
const LEGACY_LS_KEY = 'vehicleList';

let cache = [];
let initPromise = null;
let dbPromise = null;
let useLocalStorageFallback = false;

let writeInFlight = null; // Promise da escrita atual
let pendingList = null;   // Última lista aguardando gravação
let hasPending = false;

const errorListeners = new Set();

function notifyError(error) {
  console.error('[vehicleStore] Falha ao salvar contagem:', error);
  errorListeners.forEach((cb) => {
    try { cb(error); } catch (_) { /* noop */ }
  });
}

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB indisponível'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB bloqueado por outra aba'));
  });
  return dbPromise;
}

function idbGet(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(db, key, value) {
  return new Promise((resolve, reject) => {
    // durability 'strict' força flush em disco antes de concluir (proteção contra queda de energia).
    // Navegadores que não suportam a opção simplesmente a ignoram.
    const tx = db.transaction(STORE_NAME, 'readwrite', { durability: 'strict' });
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('Transação abortada'));
  });
}

function readLegacyLocalStorage() {
  try {
    const raw = localStorage.getItem(LEGACY_LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (_) {
    return null;
  }
}

/**
 * Carrega a lista do IndexedDB para o cache em memória. Migra automaticamente
 * dados antigos do localStorage. Deve ser chamado (e aguardado) antes de usar
 * getVehicles(). Chamadas repetidas reutilizam a mesma Promise.
 */
export function initVehicleStore() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Pede ao navegador para não descartar os dados em caso de pouco espaço em disco
    try { await navigator.storage?.persist?.(); } catch (_) { /* noop */ }

    try {
      const db = await openDb();
      const stored = await idbGet(db, VEHICLES_KEY);
      const legacy = readLegacyLocalStorage();

      if (Array.isArray(stored) && stored.length > 0) {
        cache = stored;
      } else if (legacy && legacy.length > 0) {
        // Migração: dados antigos do localStorage → IndexedDB
        await idbPut(db, VEHICLES_KEY, legacy);
        cache = legacy;
      } else {
        cache = [];
      }
      // Libera o espaço do localStorage (só após o IndexedDB estar consistente)
      try { localStorage.removeItem(LEGACY_LS_KEY); } catch (_) { /* noop */ }
    } catch (error) {
      console.warn('[vehicleStore] IndexedDB indisponível, usando localStorage como fallback.', error);
      useLocalStorageFallback = true;
      cache = readLegacyLocalStorage() ?? [];
    }
  })();

  return initPromise;
}

/** Leitura síncrona da lista atual (cache em memória). */
export function getVehicles() {
  return cache;
}

export function hasVehicles() {
  return cache.length > 0;
}

async function flushWrites() {
  while (hasPending) {
    const list = pendingList;
    hasPending = false;
    pendingList = null;
    try {
      if (useLocalStorageFallback) {
        localStorage.setItem(LEGACY_LS_KEY, JSON.stringify(list));
      } else {
        const db = await openDb();
        await idbPut(db, VEHICLES_KEY, list);
      }
    } catch (error) {
      notifyError(error);
    }
  }
}

/**
 * Substitui a lista salva. Atualiza o cache imediatamente e grava em segundo
 * plano. Nunca lança exceção. Retorna uma Promise resolvida quando a gravação
 * (incluindo escritas anteriores pendentes) termina.
 */
export function saveVehicles(list) {
  cache = Array.isArray(list) ? list : [];
  if (typeof window === 'undefined') return Promise.resolve();

  pendingList = cache;
  hasPending = true;

  if (!writeInFlight) {
    writeInFlight = flushWrites().finally(() => { writeInFlight = null; });
  }
  return writeInFlight;
}

export function clearVehicles() {
  return saveVehicles([]);
}

/** Registra um callback para falhas de gravação. Retorna função de unsubscribe. */
export function onStorageError(callback) {
  errorListeners.add(callback);
  return () => errorListeners.delete(callback);
}

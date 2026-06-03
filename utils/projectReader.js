
function parseConfig(content) {
  const result = {};
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.slice(0, colonIndex).trim().toLowerCase();
      const value = line.slice(colonIndex + 1).trim();
      if (key) result[key] = value;
    }
  }
  return result;
}

function isConfigFile(filename) {
  // Accept "config.txt" or "config.txt.txt" (Windows may double extension)
  return /^config\.txt(\.txt)?$/i.test(filename);
}

function isVideoFile(filename) {
  return /\.(mp4|avi|mov|mkv|wmv|flv|m4v|webm)$/i.test(filename);
}

export async function readProjectFolder(files) {
  const allFiles = Array.from(files);

  if (allFiles.length === 0) {
    throw new Error('Nenhum arquivo encontrado na pasta selecionada.');
  }

  let rootConfigFile = null;
  let rootConfigDepth = Infinity;
  const subfolderFiles = {};

  for (const file of allFiles) {
    // Normalize path separators — Windows can use backslashes
    const path = (file.webkitRelativePath || file.name).replace(/\\/g, '/');
    const parts = path.split('/').filter(Boolean);

    const filename = parts[parts.length - 1];
    const depth = parts.length;

    if (depth === 1) {
      // File is at root with no folder prefix (shouldn't happen with webkitdirectory, but handle it)
      if (isConfigFile(filename)) {
        rootConfigFile = file;
        rootConfigDepth = 1;
      }
    } else if (depth === 2) {
      // parts[0] = project folder, parts[1] = file
      if (isConfigFile(filename) && depth < rootConfigDepth) {
        rootConfigFile = file;
        rootConfigDepth = depth;
      }
    } else if (depth >= 3) {
      // parts[0] = project folder, parts[1] = subfolder, parts[2+] = file
      const subfolderName = parts[1];
      if (!subfolderFiles[subfolderName]) subfolderFiles[subfolderName] = [];
      subfolderFiles[subfolderName].push({ file, relativeName: parts.slice(2).join('/') });
    }
  }

  if (!rootConfigFile) {
    const sample = allFiles.slice(0, 5).map(f => f.webkitRelativePath || f.name).join(', ');
    throw new Error(
      `Arquivo config.txt não encontrado na raiz do projeto.\n` +
      `Total de arquivos recebidos: ${allFiles.length}\n` +
      `Exemplos de caminhos: ${sample}`
    );
  }

  const rootConfigContent = await rootConfigFile.text();
  const rootConfig = parseConfig(rootConfigContent);

  const missingFields = [];
  if (!rootConfig.servico) missingFields.push('"servico"');
  if (!rootConfig.esquerda) missingFields.push('"esquerda"');
  if (!rootConfig.direita) missingFields.push('"direita"');

  if (missingFields.length > 0) {
    throw new Error(`Campos obrigatórios faltando no config.txt: ${missingFields.join(', ')}`);
  }

  const subfolderNames = Object.keys(subfolderFiles).sort((a, b) => {
    const aNum = parseInt(a.match(/^\d+/)?.[0] ?? '0', 10);
    const bNum = parseInt(b.match(/^\d+/)?.[0] ?? '0', 10);
    return aNum - bNum;
  });

  if (subfolderNames.length === 0) {
    throw new Error('Nenhuma subpasta encontrada no projeto.');
  }

  const folders = [];

  for (const subfolderName of subfolderNames) {
    const subFiles = subfolderFiles[subfolderName];
    const nameLower = subfolderName.toLowerCase();

    if (nameLower.includes('video')) {
      let videoFile = null;
      let startDateTime = null;

      for (const { file, relativeName } of subFiles) {
        const basename = relativeName.split('/').pop();
        if (isConfigFile(basename)) {
          const content = await file.text();
          // Normalize "YYYY-MM-DD HH:MM:SS" → "YYYY-MM-DDTHH:MM:SS" for safe dayjs parsing
          startDateTime = content.trim().replace(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}(:\d{2})?)$/, '$1T$2');
        } else if (isVideoFile(basename)) {
          videoFile = file;
        }
      }

      folders.push({ name: subfolderName, type: 'video', videoFile, startDateTime, records: [], images: {} });
    } else if (nameLower.includes('frames')) {
      let records = [];
      const images = {};

      await Promise.all(subFiles.map(async ({ file, relativeName }) => {
        const basename = relativeName.split('/').pop();
        if (basename.endsWith('.json')) {
          try {
            const content = await file.text();
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed.detections)) records = parsed.detections;
          } catch (e) {
            console.warn('Falha ao parsear JSON:', relativeName, e);
          }
        } else if (/\.(png|jpe?g|gif|webp)$/i.test(basename)) {
          images[relativeName] = URL.createObjectURL(file);
        }
      }));

      folders.push({ name: subfolderName, type: 'frames', videoFile: null, startDateTime: null, records, images });
    }
  }

  if (folders.length === 0) {
    throw new Error(
      'Nenhuma pasta de frames ou vídeo encontrada.\n' +
      'As pastas devem conter "frames" ou "video" no nome.\n' +
      `Subpastas encontradas: ${subfolderNames.join(', ')}`
    );
  }

  return {
    serviceTitle: rootConfig.servico,
    leftDirection: rootConfig.esquerda,
    rightDirection: rootConfig.direita,
    folders,
  };
}

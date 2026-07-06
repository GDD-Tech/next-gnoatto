const EXPORT_TYPE_REMAP = { '4S3': '4DI', '3T6': '3M6' };
const remapType = (type) => EXPORT_TYPE_REMAP[type] ?? type;

const VEHICLE_TYPES = ['2E', '3E', '4E', '2CB', '3CB', '4CB', '2C (16)', '2C (22)', '3C', '4C', '2S2', '2S3', '2I3', '2J3', '3S2', '3S3', '4DI', '3I3', '3J3', '3T4', '3M6', '2C2', '2C3', '3C2', '3C3', '3D4', '3D6', 'Moto'];

const AXLE_MAPPING = {
  '2E': 2, '3E': 1, '4E': 2, 'Moto': 2,
  '2CB': 2, '3CB': 3, '4CB': 4,
  '2C (16)': 2, '2C (22)': 2, '3C': 3, '4C': 4,
  '2S2': 4, '2S3': 5, '2I3': 5, '2J3': 5,
  '3S2': 5, '3S3': 6, '4S3': 7,
  '3I3': 6, '3J3': 6, '3T4': 7, '3T6': 9,
  '2C2': 4, '2C3': 5, '3C2': 5, '3C3': 6, '3D4': 7, '3D6': 9,
};

function buildTimeSlots() {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const nextM = (m + 15) % 60;
      const nextH = m + 15 >= 60 ? h + 1 : h;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} - ${String(nextH % 24).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`);
    }
  }
  return slots;
}

const ALL_TIME_SLOTS = buildTimeSlots();

function timeRangeFor(time) {
  const [hourStr, minStr] = (time ?? '00:00').split(':');
  const hour = parseInt(hourStr, 10) || 0;
  const min = parseInt(minStr, 10) || 0;
  const bucket = Math.floor(min / 15) * 15;
  const nextBucket = (bucket + 15) % 60;
  const nextHour = (bucket + 15 >= 60 ? hour + 1 : hour) % 24;
  return `${String(hour).padStart(2, '0')}:${String(bucket).padStart(2, '0')} - ${String(nextHour).padStart(2, '0')}:${String(nextBucket).padStart(2, '0')}`;
}

function toCsv(rows) {
  const csv = rows.map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  return '﻿' + csv;
}

function downloadBlob(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Export vehicle count data as CSV
 */
export function exportVehicles(vehicleList, serviceTitle = 'sem_titulo', downloadNow = true) {
  if (!vehicleList || vehicleList.length === 0) {
    throw new Error('Nenhum registro para exportar');
  }

  const grouped = {};
  vehicleList.forEach((v) => {
    const date = v.date ?? v.time?.split(' ')[0] ?? 'unknown';
    const type = remapType(v.type ?? 'Desconhecido');
    const dirKey = v.fromTo ?? v.from_to ?? '';
    const timeRange = timeRangeFor(v.time);

    if (!grouped[date]) grouped[date] = {};
    if (!grouped[date][dirKey]) grouped[date][dirKey] = {};
    if (!grouped[date][dirKey][timeRange]) grouped[date][dirKey][timeRange] = {};
    grouped[date][dirKey][timeRange][type] = (grouped[date][dirKey][timeRange][type] ?? 0) + 1;
  });

  const dates = Object.keys(grouped).sort();
  const allDirections = [...new Set(dates.flatMap(d => Object.keys(grouped[d])))].sort();

  const csvRows = [['Data', 'Hora', 'Direção', ...VEHICLE_TYPES]];
  allDirections.forEach((dir) => {
    dates.forEach((date) => {
      if (!grouped[date][dir]) return;
      ALL_TIME_SLOTS.forEach((timeRange) => {
        const counts = grouped[date][dir][timeRange] ?? {};
        csvRows.push([date, timeRange, dir, ...VEHICLE_TYPES.map(t => counts[t] ?? 0)]);
      });
    });
  });

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedTitle = serviceTitle.replace(/[^a-z0-9_\-]/gi, '_');
  const filename = `${sanitizedTitle}_contagem_veiculos_${ts}.csv`;
  const content = toCsv(csvRows);

  if (!downloadNow) return { content, filename };
  downloadBlob(content, filename);
  return filename;
}

/**
 * Export axle count data as CSV
 */
export function exportAxles(vehicleList, serviceTitle = 'sem_titulo', downloadNow = true) {
  if (!vehicleList || vehicleList.length === 0) {
    throw new Error('Nenhum registro para exportar');
  }

  const grouped = {};
  vehicleList.forEach((v) => {
    const date = v.date ?? v.time?.split(' ')[0] ?? 'unknown';
    const rawType = v.type ?? 'Desconhecido';
    const type = remapType(rawType);
    const dirKey = v.fromTo ?? v.from_to ?? '';
    const raisedAxles = parseInt(v.raisedAxles ?? 0, 10);
    const baseAxles = AXLE_MAPPING[rawType] ?? 0;
    const effectiveAxles = Math.max(0, baseAxles - raisedAxles);
    const timeRange = timeRangeFor(v.time);

    if (!grouped[date]) grouped[date] = {};
    if (!grouped[date][dirKey]) grouped[date][dirKey] = {};
    if (!grouped[date][dirKey][timeRange]) grouped[date][dirKey][timeRange] = {};
    grouped[date][dirKey][timeRange][type] = (grouped[date][dirKey][timeRange][type] ?? 0) + effectiveAxles;
  });

  const dates = Object.keys(grouped).sort();
  const allDirections = [...new Set(dates.flatMap(d => Object.keys(grouped[d])))].sort();

  const csvRows = [['Data', 'Hora', 'Direção', ...VEHICLE_TYPES]];
  allDirections.forEach((dir) => {
    dates.forEach((date) => {
      if (!grouped[date][dir]) return;
      ALL_TIME_SLOTS.forEach((timeRange) => {
        const axleCounts = grouped[date][dir][timeRange] ?? {};
        csvRows.push([date, timeRange, dir, ...VEHICLE_TYPES.map(t => axleCounts[t] ?? 0)]);
      });
    });
  });

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedTitle = serviceTitle.replace(/[^a-z0-9_\-]/gi, '_');
  const filename = `${sanitizedTitle}_contagem_eixos_${ts}.csv`;
  const content = toCsv(csvRows);

  if (!downloadNow) return { content, filename };
  downloadBlob(content, filename);
  return filename;
}

/**
 * Export vehicle and axle data as a ZIP file
 */
export async function exportAsZip(vehicleList, serviceTitle = 'sem_titulo', unclassifiedFrames = []) {
  if (!vehicleList || vehicleList.length === 0) {
    throw new Error('Nenhum registro para exportar');
  }

  const JSZip = (await import('jszip')).default;

  const vehicleData = exportVehicles(vehicleList, serviceTitle, false);
  const axleData = exportAxles(vehicleList, serviceTitle, false);

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedTitle = serviceTitle.replace(/[^a-z0-9_\-]/gi, '_');

  const jsonContent = JSON.stringify({ vehicleList, unclassifiedFrames }, null, 2);
  const jsonFilename = `${sanitizedTitle}_dados_${ts}.json`;

  const zip = new JSZip();
  zip.file(vehicleData.filename, vehicleData.content);
  zip.file(axleData.filename, axleData.content);
  zip.file(jsonFilename, jsonContent);

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  const zipFilename = `${sanitizedTitle}_export_${ts}.zip`;
  a.download = zipFilename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  return zipFilename;
}

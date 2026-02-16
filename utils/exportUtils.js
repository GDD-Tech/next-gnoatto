/**
 * Export vehicle count data as CSV
 * @param {Array} vehicleList - List of vehicles to export
 * @param {string} serviceTitle - Title of the service for filename
 * @param {boolean} downloadNow - If true, downloads immediately. If false, returns content
 * @returns {object|string} - If downloadNow=false, returns {content, filename}. If true, returns filename
 */
export function exportVehicles(vehicleList, serviceTitle = 'sem_titulo', downloadNow = true) {
  if (!vehicleList || vehicleList.length === 0) {
    throw new Error('Nenhum registro para exportar');
  }

  // Define vehicle types in the exact order you want
  const vehicleTypes = ['2E', '3E', '4E', '2CB', '3CB', '4CB', '2C (16)', '2C (22)', '3C', '4C', '2S2', '2S3', '2I3', '2J3', '3S2', '3S3', '4S3', '3I3', '3J3', '3T4', '3T6', '2C2', '2C3', '3C2', '3C3', '3D4', '3D6', 'Moto'];

  // Group by date -> fromTo (De Para) -> 15-minute time slots
  const grouped = {};

  vehicleList.forEach((v) => {
    const date = v.date ?? v.time?.split(' ')[0] ?? 'unknown';
    const time = v.time ?? '00:00';
    const type = v.type ?? 'Desconhecido';
    const fromTo = v.fromTo ?? v.from_to ?? '';

    // Extract hour and minute from time (format: "HH:MM")
    const [hourStr, minStr] = time.split(':');
    const hour = parseInt(hourStr, 10) || 0;
    const min = parseInt(minStr, 10) || 0;

    // Calculate 15-minute bucket
    const bucket = Math.floor(min / 15) * 15;
    const nextBucket = (bucket + 15) % 60;
    const nextHour = bucket + 15 >= 60 ? hour + 1 : hour;
    const timeRange = `${String(hour).padStart(2, '0')}:${String(bucket).padStart(2, '0')} - ${String(nextHour).padStart(2, '0')}:${String(nextBucket).padStart(2, '0')}`;

    if (!grouped[date]) grouped[date] = {};
    const dirKey = fromTo || '';
    if (!grouped[date][dirKey]) grouped[date][dirKey] = {};
    if (!grouped[date][dirKey][timeRange]) grouped[date][dirKey][timeRange] = { counts: {} };
    if (!grouped[date][dirKey][timeRange].counts[type]) grouped[date][dirKey][timeRange].counts[type] = 0;
    grouped[date][dirKey][timeRange].counts[type]++;
  });

  const dates = Object.keys(grouped).sort();

  // Generate all possible 15-minute time slots for a day
  const allTimeSlots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const nextM = (m + 15) % 60;
      const nextH = m + 15 >= 60 ? h + 1 : h;
      const slot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} - ${String(nextH % 24).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`;
      allTimeSlots.push(slot);
    }
  }

  // Build CSV rows
  const csvRows = [];

  // Add header row
  csvRows.push(['Data', 'Hora', 'Direção', ...vehicleTypes]);

  // Add data rows: for each date, for each direction (fromTo), for each time slot
  dates.forEach((date) => {
    const directions = Object.keys(grouped[date]).sort();
    directions.forEach((dir) => {
      allTimeSlots.forEach((timeRange) => {
        const row = [date, timeRange, dir];
        vehicleTypes.forEach((type) => {
          const count = (grouped[date] && grouped[date][dir] && grouped[date][dir][timeRange] && grouped[date][dir][timeRange].counts[type])
            ? grouped[date][dir][timeRange].counts[type]
            : 0;
          row.push(count);
        });
        csvRows.push(row);
      });
    });
  });

  // Convert to CSV string
  const csv = csvRows.map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  // Prepend UTF-8 BOM so Excel on Windows recognizes accents/cedilla correctly
  const csvWithBOM = '\uFEFF' + csv;

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedTitle = serviceTitle.replace(/[^a-z0-9_\-]/gi, '_');
  const filename = `${sanitizedTitle}_contagem_veiculos_${ts}.csv`;

  if (!downloadNow) {
    return { content: csvWithBOM, filename };
  }

  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  return filename;
}

/**
 * Export axle count data as CSV
 * @param {Array} vehicleList - List of vehicles to export
 * @param {string} serviceTitle - Title of the service for filename
 * @param {boolean} downloadNow - If true, downloads immediately. If false, returns content
 * @returns {object|string} - If downloadNow=false, returns {content, filename}. If true, returns filename
 */
export function exportAxles(vehicleList, serviceTitle = 'sem_titulo', downloadNow = true) {
  if (!vehicleList || vehicleList.length === 0) {
    throw new Error('Nenhum registro para exportar');
  }

  // Create mapping of vehicle type to axle count
  const axleMapping = {
    '2E': 2,
    '3E': 1,
    '4E': 2,
    'Moto': 2,
    '2CB': 2,
    '3CB': 3,
    '4CB': 4,
    '2C (16)': 2,
    '2C (22)': 2,
    '3C': 3,
    '4C': 4,
    '2S2': 4,
    '2S3': 5,
    '2I3': 5,
    '2J3': 5,
    '3S2': 5,
    '3S3': 6,
    '4S3': 7,
    '3I3': 6,
    '3J3': 6,
    '3T4': 7,
    '3T6': 9,
    '2C2': 4,
    '2C3': 5,
    '3C2': 5,
    '3C3': 6,
    '3D4': 7,
    '3D6': 9,
  };

  // Define vehicle types in the exact order
  const vehicleTypes = ['2E', '3E', '4E', '2CB', '3CB', '4CB', '2C (16)', '2C (22)', '3C', '4C', '2S2', '2S3', '2I3', '2J3', '3S2', '3S3', '4S3', '3I3', '3J3', '3T4', '3T6', '2C2', '2C3', '3C2', '3C3', '3D4', '3D6', 'Moto'];

  // Group by date -> fromTo (De Para) -> 15-minute time slots
  const grouped = {};

  vehicleList.forEach((v) => {
    const date = v.date ?? v.time?.split(' ')[0] ?? 'unknown';
    const time = v.time ?? '00:00';
    const type = v.type ?? 'Desconhecido';
    const fromTo = v.fromTo ?? v.from_to ?? '';
    const raisedAxles = parseInt(v.raisedAxles ?? 0, 10);

    // Get base axle count for this vehicle type
    const baseAxles = axleMapping[type] ?? 0;
    // Calculate effective axles: base axles - raised axles
    const effectiveAxles = Math.max(0, baseAxles - raisedAxles);

    // Extract hour and minute from time (format: "HH:MM")
    const [hourStr, minStr] = time.split(':');
    const hour = parseInt(hourStr, 10) || 0;
    const min = parseInt(minStr, 10) || 0;

    // Calculate 15-minute bucket
    const bucket = Math.floor(min / 15) * 15;
    const nextBucket = (bucket + 15) % 60;
    const nextHour = bucket + 15 >= 60 ? hour + 1 : hour;
    const timeRange = `${String(hour).padStart(2, '0')}:${String(bucket).padStart(2, '0')} - ${String(nextHour).padStart(2, '0')}:${String(nextBucket).padStart(2, '0')}`;

    if (!grouped[date]) grouped[date] = {};
    const dirKey = fromTo || '';
    if (!grouped[date][dirKey]) grouped[date][dirKey] = {};
    if (!grouped[date][dirKey][timeRange]) grouped[date][dirKey][timeRange] = { axleCounts: {} };
    if (!grouped[date][dirKey][timeRange].axleCounts[type]) grouped[date][dirKey][timeRange].axleCounts[type] = 0;
    grouped[date][dirKey][timeRange].axleCounts[type] += effectiveAxles;
  });

  const dates = Object.keys(grouped).sort();

  // Generate all possible 15-minute time slots for a day
  const allTimeSlots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const nextM = (m + 15) % 60;
      const nextH = m + 15 >= 60 ? h + 1 : h;
      const slot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} - ${String(nextH % 24).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`;
      allTimeSlots.push(slot);
    }
  }

  // Build CSV rows
  const csvRows = [];

  // Add header row
  csvRows.push(['Data', 'Hora', 'Direção', ...vehicleTypes]);

  // Add data rows: for each date, for each direction (fromTo), for each time slot
  dates.forEach((date) => {
    const directions = Object.keys(grouped[date]).sort();
    directions.forEach((dir) => {
      allTimeSlots.forEach((timeRange) => {
        const row = [date, timeRange, dir];
        vehicleTypes.forEach((type) => {
          const axleCount = (grouped[date] && grouped[date][dir] && grouped[date][dir][timeRange] && grouped[date][dir][timeRange].axleCounts[type])
            ? grouped[date][dir][timeRange].axleCounts[type]
            : 0;
          row.push(axleCount);
        });
        csvRows.push(row);
      });
    });
  });

  // Convert to CSV string
  const csv = csvRows.map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  // Prepend UTF-8 BOM so Excel on Windows recognizes accents/cedilla correctly
  const csvWithBOM = '\uFEFF' + csv;

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedTitle = serviceTitle.replace(/[^a-z0-9_\-]/gi, '_');
  const filename = `${sanitizedTitle}_contagem_eixos_${ts}.csv`;

  if (!downloadNow) {
    return { content: csvWithBOM, filename };
  }

  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  return filename;
}

/**
 * Export vehicle and axle data as a ZIP file containing both CSVs
 * @param {Array} vehicleList - List of vehicles to export
 * @param {string} serviceTitle - Title of the service for filename
 * @returns {Promise<string>} - Promise that resolves to the ZIP filename
 */
export async function exportAsZip(vehicleList, serviceTitle = 'sem_titulo') {
  if (!vehicleList || vehicleList.length === 0) {
    throw new Error('Nenhum registro para exportar');
  }

  // Dynamically import JSZip
  const JSZip = (await import('jszip')).default;

  // Get CSV contents without downloading
  const vehicleData = exportVehicles(vehicleList, serviceTitle, false);
  const axleData = exportAxles(vehicleList, serviceTitle, false);

  // Create ZIP file
  const zip = new JSZip();
  zip.file(vehicleData.filename, vehicleData.content);
  zip.file(axleData.filename, axleData.content);

  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // Download ZIP file
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedTitle = serviceTitle.replace(/[^a-z0-9_\-]/gi, '_');
  const zipFilename = `${sanitizedTitle}_export_${ts}.zip`;
  a.download = zipFilename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  return zipFilename;
}

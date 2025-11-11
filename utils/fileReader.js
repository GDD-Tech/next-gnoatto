import JSZip from "jszip";

export async function readFile(file) {
  if (!file) return;

  try {
    const zip = await JSZip.loadAsync(file);
    let tempRegistros = [];
    const tempImagens = {};

    // 🔹 Percorre todos os arquivos dentro do ZIP
    await Promise.all(
      Object.keys(zip.files).map(async (fileName) => {
        const fileEntry = zip.files[fileName];
        if (fileEntry.dir) return;

        // 📄 JSON
        if (fileName.endsWith(".json")) {
          const content = await fileEntry.async("string");
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed.detections)) {
            tempRegistros = parsed.detections;
          } else {
            console.warn("JSON não é um array.");
          }
        }

        // 🖼️ Imagens
        if (/\.(png|jpe?g|gif|webp)$/i.test(fileName)) {
          const blob = await fileEntry.async("blob");
          const url = URL.createObjectURL(blob);
          tempImagens[fileName] = url;
        }
      })
    );
    // Return both collected datasets so callers can use them
    return { tempRegistros, tempImagens };
  } catch (err) {
    console.error(err);
    alert("Erro ao ler o arquivo ZIP");
    return { tempRegistros: [], tempImagens: {} };
  }
}

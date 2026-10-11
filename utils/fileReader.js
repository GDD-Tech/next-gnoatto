
async function processFile(fileName, contentPromise, tempImagens, setRegistros) {
  // 📄 JSON
  if (fileName.endsWith(".json")) {
    const content = await contentPromise("string");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed.detections)) {
      const considerAxes = parsed.description?.consider_axes;
      setRegistros(parsed.detections.map(d => ({ ...d, consider_axes: d.consider_axes ?? d.description?.consider_axes ?? considerAxes })));
    } else {
      console.warn("JSON não é um array.");
    }
  }

  // 🖼️ Imagens
  if (/\.(png|jpe?g|gif|webp)$/i.test(fileName)) {
    const blob = await contentPromise("blob");
    const url = URL.createObjectURL(blob);
    tempImagens[fileName] = url;
  }
}

export async function readFolder(files) {
  if (!files || files.length === 0) return;

  try {
    let tempRegistros = [];
    const tempImagens = {};
    const setRegistros = (data) => { tempRegistros = data; };

    await Promise.all(
      Array.from(files).map(async (file) => {
        // For folder uploads, webkitRelativePath includes the root folder name.
        // We strip it to match the internal structure (like in a ZIP).
        let fileName = file.webkitRelativePath || file.name;
        if (file.webkitRelativePath) {
          const parts = fileName.split('/');
          if (parts.length > 1) {
            fileName = parts.slice(1).join('/');
          }
        }

        // Skip directories if they somehow end up here
        if (file.size === 0 && !file.type) return;

        await processFile(
          fileName,
          async (type) => {
            if (type === "string") return await file.text();
            if (type === "blob") return file;
            return file;
          },
          tempImagens,
          setRegistros
        );
      })
    );

    return { tempRegistros, tempImagens };
  } catch (err) {
    console.error(err);
    alert("Erro ao ler a pasta");
    return { tempRegistros: [], tempImagens: {} };
  }
}

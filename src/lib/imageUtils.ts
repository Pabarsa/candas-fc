/**
 * Comprime una imagen antes de subirla a Supabase.
 * - Redimensiona al máximo 1200px en el lado más largo
 * - Convierte a JPEG con calidad 0.82
 * - Devuelve un File listo para subir
 */
export async function comprimirImagen(file: File, maxPx = 1200, calidad = 0.82): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Redimensionar si supera maxPx
      if (width > maxPx || height > maxPx) {
        if (width > height) {
          height = Math.round((height * maxPx) / width);
          width = maxPx;
        } else {
          width = Math.round((width * maxPx) / height);
          height = maxPx;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Error al comprimir imagen")); return; }
          const nombre = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
          resolve(new File([blob], nombre, { type: "image/jpeg" }));
        },
        "image/jpeg",
        calidad
      );
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Error cargando imagen")); };
    img.src = url;
  });
}

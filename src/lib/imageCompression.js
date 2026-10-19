export const maxInputSize = 20 * 1024 * 1024;
export const maxDimension = 1920;
export const targetBytes = 700 * 1024;
const qualitySteps = [0.86, 0.8, 0.74, 0.68, 0.62];
const inputTypes = ['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'];

export async function compressImageFile(file) {
  if (!file || !inputTypes.includes(file.type)) {
    throw new Error('Selecciona una imagen JPG, PNG, WebP, GIF o AVIF.');
  }
  if (file.size > maxInputSize) {
    throw new Error('La imagen supera el maximo permitido de 20MB.');
  }

  const bitmap = await createImageBitmap(file);
  try {
    const ratio = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    let width = Math.max(1, Math.round(bitmap.width * ratio));
    let height = Math.max(1, Math.round(bitmap.height * ratio));
    const canvas = document.createElement('canvas');
    let blob;

    // Reduce dimensions as well as quality when a detailed image exceeds the target.
    do {
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { alpha: true });
      if (!context) throw new Error('No se pudo preparar la imagen.');
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(bitmap, 0, 0, width, height);
      for (const quality of qualitySteps) {
        blob = await canvasToBlob(canvas, quality);
        if (blob.size <= targetBytes) break;
      }
      if (blob.size <= targetBytes || (width === 1 && height === 1)) break;
      width = Math.max(1, Math.floor(width * 0.8));
      height = Math.max(1, Math.floor(height * 0.8));
    } while (true);

    const resized = width !== bitmap.width || height !== bitmap.height;
    // Canvas may fall back to PNG in browsers without WebP encoding.
    const extension = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/jpeg' ? 'jpg' : 'png';
    const name = file.name.replace(/\.[^/.]+$/, '') || crypto.randomUUID();
    const compressed = new File([blob], `${name}.${extension}`, { type: blob.type });
    const result = resized || compressed.size < file.size ? compressed : file;
    return {
      file: result,
      stats: {
        before: file.size,
        after: result.size,
        saved: Math.max(0, Math.round((1 - result.size / file.size) * 100)),
      },
    };
  } finally {
    bitmap.close();
  }
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob && ['image/webp', 'image/png', 'image/jpeg'].includes(blob.type)) resolve(blob);
      else reject(new Error('No se pudo comprimir la imagen.'));
    }, 'image/webp', quality);
  });
}

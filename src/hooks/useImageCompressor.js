"use client";

import { useCallback, useState } from "react";

const maxInputSize = 300 * 1024 * 1024;
const maxDimension = 1920;
const targetBytes = 700 * 1024;
const qualitySteps = [0.86, 0.8, 0.74, 0.68, 0.62];

export default function useImageCompressor() {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionError, setCompressionError] = useState("");
  const [compressionStats, setCompressionStats] = useState(null);

  const compressImage = useCallback(async (file) => {
    setCompressionError("");
    setCompressionStats(null);

    if (!file?.type?.startsWith("image/")) {
      return { error: null, file };
    }

    if (file.size > maxInputSize) {
      const error = {
        message: "La imagen supera el maximo permitido de 300MB.",
      };
      setCompressionError(error.message);
      return { error, file: null };
    }

    if (file.type === "image/svg+xml") {
      return { error: null, file };
    }

    setIsCompressing(true);

    try {
      const bitmap = await createImageBitmap(file);
      const { height, width } = getCompressedSize(bitmap);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d", {
        alpha: true,
        desynchronized: true,
      });

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(bitmap, 0, 0, width, height);
      bitmap.close?.();

      let compressedBlob = null;

      for (const quality of qualitySteps) {
        compressedBlob = await canvasToBlob(canvas, "image/webp", quality);

        if (compressedBlob.size <= targetBytes) {
          break;
        }
      }

      const compressedFile = new File(
        [compressedBlob],
        getCompressedFileName(file.name),
        {
          lastModified: Date.now(),
          type: "image/webp",
        },
      );

      const finalFile =
        compressedFile.size < file.size || file.size > targetBytes
          ? compressedFile
          : file;

      setCompressionStats({
        after: finalFile.size,
        before: file.size,
        saved:
          file.size > 0
            ? Math.max(0, Math.round((1 - finalFile.size / file.size) * 100))
            : 0,
      });

      return { error: null, file: finalFile };
    } catch (error) {
      setCompressionError(error.message);
      return { error, file: null };
    } finally {
      setIsCompressing(false);
    }
  }, []);

  return {
    compressImage,
    compressionError,
    compressionStats,
    isCompressing,
    maxInputSize,
  };
}

function getCompressedSize({ height, width }) {
  const ratio = Math.min(1, maxDimension / Math.max(width, height));

  return {
    height: Math.round(height * ratio),
    width: Math.round(width * ratio),
  };
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo comprimir la imagen."));
          return;
        }

        resolve(blob);
      },
      type,
      quality,
    );
  });
}

function getCompressedFileName(name) {
  const baseName = name.replace(/\.[^/.]+$/, "");
  return `${baseName || crypto.randomUUID()}.webp`;
}

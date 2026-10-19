"use client";

import { useCallback, useState } from "react";
import { compressImageFile, maxInputSize } from "@/lib/imageCompression";

export default function useImageCompressor() {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionError, setCompressionError] = useState("");
  const [compressionStats, setCompressionStats] = useState(null);

  const compressImage = useCallback(async (file) => {
    setCompressionError("");
    setCompressionStats(null);
    setIsCompressing(true);
    try {
      const result = await compressImageFile(file);
      setCompressionStats(result.stats);
      return { error: null, file: result.file };
    } catch (error) {
      setCompressionError(error.message);
      return { error, file: null };
    } finally {
      setIsCompressing(false);
    }
  }, []);

  return { compressImage, compressionError, compressionStats, isCompressing, maxInputSize };
}

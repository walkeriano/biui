"use client";

import { useCallback, useState } from "react";
import { compressImageFile } from "@/lib/imageCompression";

export default function useImageCompressor() {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionError, setCompressionError] = useState("");

  const compressImage = useCallback(async (file) => {
    setCompressionError("");
    setIsCompressing(true);
    try {
      const result = await compressImageFile(file);
      return { error: null, file: result.file };
    } catch (error) {
      setCompressionError(error.message);
      return { error, file: null };
    } finally {
      setIsCompressing(false);
    }
  }, []);

  return { compressImage, compressionError, isCompressing };
}

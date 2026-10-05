"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import useImageCompressor from "@/hooks/useImageCompressor";

const bucketName = "profesional-assets";

export default function useImageUpload() {
  const { supabase, user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const {
    compressImage,
    compressionError,
    compressionStats,
    isCompressing,
  } = useImageCompressor();

  const uploadImage = useCallback(
    async ({ file, folder = "pages" }) => {
      if (!supabase || !user) {
        setUploadError(
          "Necesitas iniciar sesion y configurar Supabase para subir imagenes.",
        );
        return {
          error: {
            message:
              "Necesitas iniciar sesion y configurar Supabase para subir imagenes.",
          },
          publicUrl: "",
        };
      }

      const { error: compressionFailure, file: uploadFile } =
        await compressImage(file);

      if (compressionFailure) {
        setUploadError(compressionFailure.message);
        return { error: compressionFailure, publicUrl: "" };
      }

      const extension = uploadFile.name.split(".").pop() || "webp";
      const safeName = `${crypto.randomUUID()}.${extension.toLowerCase()}`;
      const path = `${user.id}/${folder}/${safeName}`;

      setIsUploading(true);
      setUploadError("");
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(path, uploadFile, {
          contentType: uploadFile.type,
          cacheControl: "3600",
          upsert: true,
        });
      setIsUploading(false);

      if (error) {
        setUploadError(error.message);
        return { error, publicUrl: "" };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(path);

      return { error: null, path, publicUrl };
    },
    [compressImage, supabase, user],
  );

  return {
    bucketName,
    compressionStats,
    isCompressing,
    isUploading: isUploading || isCompressing,
    uploadError: uploadError || compressionError,
    uploadImage,
  };
}

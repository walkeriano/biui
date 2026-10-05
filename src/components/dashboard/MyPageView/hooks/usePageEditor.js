"use client";

import { useEffect, useRef, useState } from "react";
import {
  defaultAvailableDays,
  defaultPageData,
  initialServices,
} from "@/components/dashboard/MyPageView/data";
import useImageUpload from "@/hooks/useImageUpload";
import useProfessionalPage from "@/hooks/useProfessionalPage";
import { sanitizeStoredImageUrl } from "@/lib/professionalPage/mapper";

export default function usePageEditor() {
  const [data, setData] = useState(defaultPageData);
  const [services, setServices] = useState(initialServices);
  const [heroImage, setHeroImage] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [availableDays, setAvailableDays] = useState(defaultAvailableDays);
  const [feedback, setFeedback] = useState("");
  const [publishStatus, setPublishStatus] = useState({
    message: "",
    state: "idle",
  });
  const hydratedPageId = useRef("");
  const { isUploading, uploadError, uploadImage } = useImageUpload();
  const {
    editorState,
    error,
    isLoading,
    isSaving,
    page,
    savePage,
  } = useProfessionalPage();

  useEffect(() => {
    if (!page?.id || hydratedPageId.current === page.id) {
      return undefined;
    }

    const hydrateEditor = () => {
      hydratedPageId.current = page.id;
      setData(editorState.data);
      setServices(editorState.services);
      setAvailableDays(editorState.availableDays);
      setHeroImage(editorState.data.heroImage ?? "");
      setProfileImage(editorState.data.profileImage ?? "");
    };

    queueMicrotask(hydrateEditor);
    return undefined;
  }, [editorState, page]);

  const updateData = (key, value) => {
    setData((current) => ({ ...current, [key]: value }));
  };

  const handleImage = (setter, folder = "page") => async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFeedback("Comprimiendo y subiendo imagen...");
    const localPreviewUrl = URL.createObjectURL(file);
    setter(localPreviewUrl);

    const { error, publicUrl } = await uploadImage({ file, folder });

    if (publicUrl) {
      setter(publicUrl);
      setFeedback("Imagen guardada en Supabase Storage.");
    } else {
      setFeedback(
        error?.message ||
          "No se pudo subir la imagen. Revisa el bucket de Supabase.",
      );
    }
  };

  const updateService = (id, key, value) => {
    setServices((current) =>
      current.map((service) =>
        service.id === id ? { ...service, [key]: value } : service,
      ),
    );
  };

  const handleServiceImage = (id) => async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFeedback("Comprimiendo y subiendo imagen del servicio...");
    const localPreviewUrl = URL.createObjectURL(file);
    updateService(id, "image", localPreviewUrl);

    const { error, publicUrl } = await uploadImage({
      file,
      folder: `services/${id}`,
    });

    if (publicUrl) {
      updateService(id, "image", publicUrl);
      setFeedback("Imagen del servicio guardada en Supabase Storage.");
    } else {
      setFeedback(
        error?.message ||
          "No se pudo subir la imagen del servicio. Revisa el bucket de Supabase.",
      );
    }
  };

  const addService = () => {
    setServices((current) => [
      ...current,
      {
        id: Date.now(),
        name: "Nuevo servicio",
        duration: "50 minutos",
        price: "60",
        image: "",
        description: "Describe brevemente este servicio.",
      },
    ]);
  };

  const removeService = (id) => {
    setServices((current) => current.filter((service) => service.id !== id));
  };

  const toggleAvailableDay = (day) => {
    setAvailableDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day],
    );
  };

  const handleSavePage = async () => {
    setFeedback("");
    setPublishStatus({
      message: "Estamos preparando tu pagina y validando imagenes.",
      state: "publishing",
    });

    if (hasPendingLocalImages({ heroImage, profileImage, services })) {
      const message =
        uploadError ||
        "Hay imagenes locales que aun no estan guardadas en Supabase. Espera a que terminen de subir o vuelve a adjuntarlas.";
      setFeedback(message);
      setPublishStatus({
        message,
        state: "error",
      });
      return {
        error: {
          message:
            "Hay imagenes locales pendientes de subir antes de publicar.",
        },
      };
    }

    setPublishStatus({
      message: "Guardando datos en Supabase y publicando tu landing.",
      state: "publishing",
    });

    const result = await savePage({
      availableDays,
      data: {
        ...data,
        heroImage: sanitizeStoredImageUrl(heroImage),
        profileImage: sanitizeStoredImageUrl(profileImage),
      },
      services: services.filter(
        (service) =>
          service.name ||
          service.description ||
          service.price ||
          service.image,
      ),
    });

    const message = result.error
      ? result.error.message
      : `Cambios publicados correctamente en /${result.data.slug}.`;

    setFeedback(message);
    setPublishStatus({
      message,
      state: result.error ? "error" : "success",
    });

    return result;
  };

  const closePublishStatus = () => {
    setPublishStatus({ message: "", state: "idle" });
  };

  return {
    addService,
    availableDays,
    data,
    error: uploadError || error,
    feedback,
    closePublishStatus,
    handleServiceImage,
    handleImage,
    handleSavePage,
    heroImage,
    isLoading,
    isSaving,
    isUploading,
    hasExistingPage: Boolean(page?.id),
    page,
    publishStatus,
    profileImage,
    removeService,
    services,
    setHeroImage,
    setProfileImage,
    toggleAvailableDay,
    updateData,
    updateService,
  };
}

function hasPendingLocalImages({ heroImage, profileImage, services }) {
  return [heroImage, profileImage, ...services.map((service) => service.image)].some(
    (image) => image?.startsWith("blob:") || image?.startsWith("data:"),
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
  defaultAvailableDays,
  defaultPageData,
  initialServices,
} from "@/components/dashboard/MyPageView/data";
import useImageUpload from "@/hooks/useImageUpload";
import useProfessionalPage from "@/hooks/useProfessionalPage";

export default function usePageEditor() {
  const [data, setData] = useState(defaultPageData);
  const [services, setServices] = useState(initialServices);
  const [heroImage, setHeroImage] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [availableDays, setAvailableDays] = useState(defaultAvailableDays);
  const [feedback, setFeedback] = useState("");
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

    const localPreviewUrl = URL.createObjectURL(file);
    setter(localPreviewUrl);

    const { publicUrl } = await uploadImage({ file, folder });

    if (publicUrl) {
      setter(publicUrl);
    } else {
      setFeedback("No se pudo subir la imagen. Revisa el bucket de Supabase.");
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

    const localPreviewUrl = URL.createObjectURL(file);
    updateService(id, "image", localPreviewUrl);

    const { publicUrl } = await uploadImage({
      file,
      folder: `services/${id}`,
    });

    if (publicUrl) {
      updateService(id, "image", publicUrl);
    } else {
      setFeedback(
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
    const result = await savePage({
      availableDays,
      data: {
        ...data,
        heroImage,
        profileImage,
      },
      services,
    });

    setFeedback(
      result.error
        ? result.error.message
        : `Cambios publicados correctamente en /${result.data.slug}.`,
    );

    return result;
  };

  return {
    addService,
    availableDays,
    data,
    error: uploadError || error,
    feedback,
    handleServiceImage,
    handleImage,
    handleSavePage,
    heroImage,
    isLoading,
    isSaving,
    isUploading,
    page,
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

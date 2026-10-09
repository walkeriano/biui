"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
    href: "",
    message: "",
    state: "idle",
  });
  const [pendingImages, setPendingImages] = useState(createEmptyPendingImages);
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    createEditorSnapshot({
      availableDays: defaultAvailableDays,
      data: defaultPageData,
      heroImage: "",
      profileImage: "",
      services: initialServices,
    }),
  );
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
      setPendingImages(createEmptyPendingImages());
      setSavedSnapshot(
        createEditorSnapshot({
          availableDays: editorState.availableDays,
          data: editorState.data,
          heroImage: editorState.data.heroImage ?? "",
          profileImage: editorState.data.profileImage ?? "",
          services: editorState.services,
        }),
      );
    };

    queueMicrotask(hydrateEditor);
    return undefined;
  }, [editorState, page]);

  const updateData = (key, value) => {
    setData((current) => ({ ...current, [key]: value }));
  };

  const currentSnapshot = useMemo(
    () =>
      createEditorSnapshot({
        availableDays,
        data,
        heroImage,
        profileImage,
        services,
      }),
    [availableDays, data, heroImage, profileImage, services],
  );
  const hasChanges = currentSnapshot !== savedSnapshot;

  const handleImage = (setter, folder = "page", key = "heroImage") => async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFeedback("Imagen lista. Se guardara en Storage al publicar cambios.");
    const localPreviewUrl = URL.createObjectURL(file);
    setter(localPreviewUrl);
    setPendingImages((current) => ({
      ...current,
      [key]: {
        file,
        folder,
        previewUrl: localPreviewUrl,
      },
    }));
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

    setFeedback("Imagen del servicio lista. Se guardara en Storage al publicar.");
    const localPreviewUrl = URL.createObjectURL(file);
    updateService(id, "image", localPreviewUrl);
    setPendingImages((current) => ({
      ...current,
      services: {
        ...current.services,
        [id]: {
          file,
          folder: `services/${id}`,
          previewUrl: localPreviewUrl,
        },
      },
    }));
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
      href: "",
      message: "Estamos preparando tu pagina y guardando imagenes.",
      state: "publishing",
    });

    const prepared = await uploadPendingImages({
      data,
      heroImage,
      pendingImages,
      profileImage,
      services,
      uploadImage,
    });

    if (prepared.error) {
      const message = prepared.error.message || uploadError;
      setFeedback(message);
      setPublishStatus({
        href: "",
        message,
        state: "error",
      });
      return { error: prepared.error };
    }

    setData(prepared.data);
    setHeroImage(prepared.heroImage);
    setProfileImage(prepared.profileImage);
    setServices(prepared.services);
    setPendingImages(createEmptyPendingImages());

    setPublishStatus({
      href: "",
      message: "Guardando datos en Supabase y publicando tu landing.",
      state: "publishing",
    });

    const result = await savePage({
      availableDays,
      data: {
        ...prepared.data,
        heroImage: sanitizeStoredImageUrl(prepared.heroImage),
        logoImage: sanitizeStoredImageUrl(prepared.data.logoImage),
        profileImage: sanitizeStoredImageUrl(prepared.profileImage),
      },
      services: prepared.services.filter(
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
      href: result.error ? "" : `/${result.data.slug}`,
      message,
      state: result.error ? "error" : "success",
    });

    if (!result.error) {
      setSavedSnapshot(
        createEditorSnapshot({
          availableDays,
          data: prepared.data,
          heroImage: prepared.heroImage,
          profileImage: prepared.profileImage,
          services: prepared.services,
        }),
      );
    }

    return result;
  };

  const closePublishStatus = () => {
    setPublishStatus({ href: "", message: "", state: "idle" });
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
    hasChanges,
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

async function uploadPendingImages({
  data,
  heroImage,
  pendingImages,
  profileImage,
  services,
  uploadImage,
}) {
  const nextData = { ...data };
  let nextHeroImage = heroImage;
  let nextProfileImage = profileImage;
  let nextServices = services;

  const logoResult = await uploadPendingImage({
    currentUrl: nextData.logoImage,
    pendingImage: pendingImages.logoImage,
    uploadImage,
  });
  if (logoResult.error) return { error: logoResult.error };
  nextData.logoImage = logoResult.url;

  const heroResult = await uploadPendingImage({
    currentUrl: nextHeroImage,
    pendingImage: pendingImages.heroImage,
    uploadImage,
  });
  if (heroResult.error) return { error: heroResult.error };
  nextHeroImage = heroResult.url;

  const profileResult = await uploadPendingImage({
    currentUrl: nextProfileImage,
    pendingImage: pendingImages.profileImage,
    uploadImage,
  });
  if (profileResult.error) return { error: profileResult.error };
  nextProfileImage = profileResult.url;

  nextServices = await Promise.all(
    services.map(async (service) => {
      const serviceResult = await uploadPendingImage({
        currentUrl: service.image,
        pendingImage: pendingImages.services[service.id],
        uploadImage,
      });

      if (serviceResult.error) {
        throw serviceResult.error;
      }

      return {
        ...service,
        image: serviceResult.url,
      };
    }),
  ).catch((error) => ({ error }));

  if (nextServices.error) {
    return { error: nextServices.error };
  }

  const localImageError = getLocalImageError({
    heroImage: nextHeroImage,
    logoImage: nextData.logoImage,
    profileImage: nextProfileImage,
    services: nextServices,
  });

  if (localImageError) {
    return { error: { message: localImageError } };
  }

  return {
    data: nextData,
    heroImage: nextHeroImage,
    profileImage: nextProfileImage,
    services: nextServices,
  };
}

async function uploadPendingImage({ currentUrl, pendingImage, uploadImage }) {
  if (!currentUrl) {
    return { error: null, url: "" };
  }

  if (!isLocalImage(currentUrl)) {
    return { error: null, url: currentUrl };
  }

  if (!pendingImage || pendingImage.previewUrl !== currentUrl) {
    return {
      error: {
        message:
          "Hay una imagen local pendiente. Vuelve a adjuntarla para poder guardarla en Storage.",
      },
      url: currentUrl,
    };
  }

  const { error, publicUrl } = await uploadImage({
    file: pendingImage.file,
    folder: pendingImage.folder,
  });

  if (error || !publicUrl) {
    return {
      error: error || {
        message:
          "No se pudo subir una imagen. Revisa el bucket de Supabase.",
      },
      url: currentUrl,
    };
  }

  return { error: null, url: publicUrl };
}

function getLocalImageError({ heroImage, logoImage, profileImage, services }) {
  const hasLocalImage = [
    heroImage,
    logoImage,
    profileImage,
    ...services.map((service) => service.image),
  ].some(isLocalImage);

  return hasLocalImage
    ? "Hay imagenes locales pendientes de guardar en Storage."
    : "";
}

function isLocalImage(image) {
  return image?.startsWith("blob:") || image?.startsWith("data:");
}

function createEmptyPendingImages() {
  return {
    heroImage: null,
    logoImage: null,
    profileImage: null,
    services: {},
  };
}

function createEditorSnapshot({
  availableDays,
  data,
  heroImage,
  profileImage,
  services,
}) {
  return JSON.stringify({
    availableDays,
    data,
    heroImage,
    profileImage,
    services,
  });
}

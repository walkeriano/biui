export function normalizeBusinessName(value) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, 80) : "";
}

export function getPublicPageMetadata(page) {
  if (!page) return { title: "Pagina no encontrada | BIUI" };

  return {
    title: normalizeBusinessName(page.hero?.businessName) ||
      normalizeBusinessName(page.professional?.name) || "Perfil profesional",
    description: page.hero?.text,
  };
}

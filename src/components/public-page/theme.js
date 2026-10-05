export function getButtonClassName(buttonStyle, { pill = false } = {}) {
  const radiusClassName =
    buttonStyle === "square"
      ? "rounded-none"
      : buttonStyle === "minimal"
        ? "rounded-none border-b"
        : pill
          ? "rounded-full"
          : "rounded-md";

  return `${radiusClassName} transition hover:opacity-90`;
}

export function getButtonStyle(page) {
  if (page.theme.buttonStyle === "minimal") {
    return {
      backgroundColor: "transparent",
      borderColor: page.theme.primaryColor,
      color: page.theme.primaryColor,
    };
  }

  return {
    backgroundColor: page.theme.primaryColor,
    color: "#ffffff",
  };
}

export function getSocialLinks(contact) {
  return [
    ["facebook", "Facebook", "F", contact.socialFacebook],
    ["instagram", "Instagram", "I", contact.socialInstagram],
    ["youtube", "YouTube", "Y", contact.socialYoutube],
  ]
    .map(([key, label, shortLabel, url]) => [
      key,
      label,
      shortLabel,
      normalizeExternalUrl(url),
    ])
    .filter(([, , , url]) => Boolean(url));
}

export function normalizeExternalUrl(url) {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return "";
  }

  return /^https?:\/\//i.test(trimmedUrl)
    ? trimmedUrl
    : `https://${trimmedUrl}`;
}

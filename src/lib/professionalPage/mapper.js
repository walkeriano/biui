import {
  defaultAvailableDays,
  defaultPageData,
  initialServices,
  publicFallbackServices,
  publicPageFallbackData,
} from "@/components/dashboard/MyPageView/data";
import { buildTimeSlots } from "@/lib/availability";
import { sanitizeSlug } from "@/lib/slug";
import { normalizeExternalUrl } from "@/components/public-page/theme";

export const defaultProfessional = {
  name: "Laura Martin",
  title: "Psicologa",
  avatarInitials: "LM",
  logoImage: "",
};

const defaultTheme = {
  primaryColor: publicPageFallbackData.primaryColor,
  secondaryColor: publicPageFallbackData.secondaryColor,
  titleFont: "Georgia",
  textFont: "Arial",
  buttonStyle: publicPageFallbackData.buttonStyle,
};

const defaultHero = {
  label: publicPageFallbackData.heroLabel,
  title: publicPageFallbackData.heroTitle,
  text: publicPageFallbackData.heroText,
  image: "",
};

const defaultAbout = {
  title: publicPageFallbackData.profileTitle,
  subtitle: publicPageFallbackData.profileSubtitle,
  description: publicPageFallbackData.profileDescription,
  image: "",
};

const defaultContact = {
  city: publicPageFallbackData.city,
  address: publicPageFallbackData.address,
  phone: publicPageFallbackData.phone,
  email: publicPageFallbackData.email,
  socialFacebook: publicPageFallbackData.socialFacebook,
  socialInstagram: publicPageFallbackData.socialInstagram,
  socialYoutube: publicPageFallbackData.socialYoutube,
};

const defaultAvailability = {
  days: defaultAvailableDays,
  start: publicPageFallbackData.scheduleStart,
  end: publicPageFallbackData.scheduleEnd,
  timeZone: "Europe/Madrid",
  times: ["09:00", "10:00", "11:00", "12:00", "16:00", "17:30"],
};

export function editorStateToPagePayload({
  availableDays,
  data,
  professional = defaultProfessional,
  services,
}) {
  const slug = sanitizeSlug(data.publicSlug) || "mi-pagina";

  return {
    slug,
    professional: {
      ...professional,
      logoImage: sanitizeStoredImageUrl(data.logoImage),
    },
    theme: {
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      titleFont: data.titleFont,
      textFont: data.textFont,
      buttonStyle: data.buttonStyle,
    },
    hero: {
      label: data.heroLabel,
      title: data.heroTitle,
      text: data.heroText,
      image: sanitizeStoredImageUrl(data.heroImage),
    },
    about: {
      title: data.profileTitle,
      subtitle: data.profileSubtitle,
      description: data.profileDescription,
      image: sanitizeStoredImageUrl(data.profileImage),
    },
    services: services.map((service) => ({
      ...service,
      image: sanitizeStoredImageUrl(service.image),
    })),
    contact: {
      city: data.city,
      address: data.address,
      phone: data.phone,
      email: data.email,
      socialFacebook: normalizeExternalUrl(data.socialFacebook),
      socialInstagram: normalizeExternalUrl(data.socialInstagram),
      socialYoutube: normalizeExternalUrl(data.socialYoutube),
    },
    availability: {
      days: availableDays,
      start: data.scheduleStart,
      end: data.scheduleEnd,
      timeZone: defaultAvailability.timeZone,
      times: buildTimeSlots(data.scheduleStart, data.scheduleEnd),
    },
    published: true,
  };
}

export function pagePayloadToEditorState(page) {
  if (!page) {
    return {
      availableDays: defaultAvailableDays,
      data: defaultPageData,
      services: initialServices,
    };
  }

  return {
    availableDays: page.availability?.days ?? defaultAvailableDays,
    data: {
      ...defaultPageData,
      primaryColor: page.theme?.primaryColor ?? defaultPageData.primaryColor,
      secondaryColor:
        page.theme?.secondaryColor ?? defaultPageData.secondaryColor,
      logoImage: sanitizeStoredImageUrl(page.professional?.logoImage),
      titleFont: page.theme?.titleFont ?? defaultPageData.titleFont,
      textFont: page.theme?.textFont ?? defaultPageData.textFont,
      buttonStyle: page.theme?.buttonStyle ?? defaultPageData.buttonStyle,
      heroLabel: page.hero?.label ?? defaultPageData.heroLabel,
      heroTitle: page.hero?.title ?? defaultPageData.heroTitle,
      heroText: page.hero?.text ?? defaultPageData.heroText,
      heroImage: sanitizeStoredImageUrl(page.hero?.image),
      profileTitle: page.about?.title ?? defaultPageData.profileTitle,
      profileSubtitle:
        page.about?.subtitle ?? defaultPageData.profileSubtitle,
      profileDescription:
        page.about?.description ?? defaultPageData.profileDescription,
      profileImage: sanitizeStoredImageUrl(page.about?.image),
      city: page.contact?.city ?? defaultPageData.city,
      address: page.contact?.address ?? defaultPageData.address,
      phone: page.contact?.phone ?? defaultPageData.phone,
      email: page.contact?.email ?? defaultPageData.email,
      socialFacebook:
        page.contact?.socialFacebook ?? defaultPageData.socialFacebook,
      socialInstagram:
        page.contact?.socialInstagram ?? defaultPageData.socialInstagram,
      socialYoutube:
        page.contact?.socialYoutube ?? defaultPageData.socialYoutube,
      publicSlug: page.slug ?? defaultPageData.publicSlug,
      scheduleStart: page.availability?.start ?? defaultPageData.scheduleStart,
      scheduleEnd: page.availability?.end ?? defaultPageData.scheduleEnd,
    },
    services: page.services?.length
      ? page.services.map((service) => ({
          ...service,
          image: sanitizeStoredImageUrl(service.image),
        }))
      : initialServices,
  };
}

export function databaseRowToPublicPage(row) {
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    professional: { ...defaultProfessional, ...(row.professional ?? {}) },
    theme: { ...defaultTheme, ...(row.theme ?? {}) },
    hero: {
      ...defaultHero,
      ...(row.hero ?? {}),
      image: sanitizeStoredImageUrl(row.hero?.image),
    },
    about: {
      ...defaultAbout,
      ...(row.about ?? {}),
      image: sanitizeStoredImageUrl(row.about?.image),
    },
    services: row.services?.length
      ? row.services.map((service) => ({
          ...service,
          image: sanitizeStoredImageUrl(service.image),
        }))
      : publicFallbackServices,
    contact: { ...defaultContact, ...(row.contact ?? {}) },
    availability: { ...defaultAvailability, ...(row.availability ?? {}) },
    published: row.published,
  };
}

export function sanitizeStoredImageUrl(url) {
  if (!url || typeof url !== "string") {
    return "";
  }

  if (url.startsWith("blob:") || url.startsWith("data:")) {
    return "";
  }

  return url;
}

import {
  defaultAvailableDays,
  defaultPageData,
  initialServices,
} from "@/components/dashboard/MyPageView/data";
import { buildTimeSlots } from "@/lib/availability";
import { sanitizeSlug } from "@/lib/slug";

export const defaultProfessional = {
  name: "Laura Martin",
  title: "Psicologa",
  avatarInitials: "LM",
};

const defaultTheme = {
  primaryColor: defaultPageData.primaryColor,
  secondaryColor: defaultPageData.secondaryColor,
  titleFont: "Georgia",
  textFont: "Arial",
  buttonStyle: defaultPageData.buttonStyle,
};

const defaultHero = {
  label: defaultPageData.heroLabel,
  title: defaultPageData.heroTitle,
  text: defaultPageData.heroText,
  image: "",
};

const defaultAbout = {
  title: defaultPageData.profileTitle,
  subtitle: defaultPageData.profileSubtitle,
  description: defaultPageData.profileDescription,
  image: "",
};

const defaultContact = {
  city: defaultPageData.city,
  address: defaultPageData.address,
  phone: defaultPageData.phone,
  email: defaultPageData.email,
};

const defaultAvailability = {
  days: defaultAvailableDays,
  start: defaultPageData.scheduleStart,
  end: defaultPageData.scheduleEnd,
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
    professional,
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
      image: data.heroImage ?? "",
    },
    about: {
      title: data.profileTitle,
      subtitle: data.profileSubtitle,
      description: data.profileDescription,
      image: data.profileImage ?? "",
    },
    services,
    contact: {
      city: data.city,
      address: data.address,
      phone: data.phone,
      email: data.email,
    },
    availability: {
      days: availableDays,
      start: data.scheduleStart,
      end: data.scheduleEnd,
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
      titleFont: page.theme?.titleFont ?? defaultPageData.titleFont,
      textFont: page.theme?.textFont ?? defaultPageData.textFont,
      buttonStyle: page.theme?.buttonStyle ?? defaultPageData.buttonStyle,
      heroLabel: page.hero?.label ?? defaultPageData.heroLabel,
      heroTitle: page.hero?.title ?? defaultPageData.heroTitle,
      heroText: page.hero?.text ?? defaultPageData.heroText,
      heroImage: page.hero?.image ?? "",
      profileTitle: page.about?.title ?? defaultPageData.profileTitle,
      profileSubtitle:
        page.about?.subtitle ?? defaultPageData.profileSubtitle,
      profileDescription:
        page.about?.description ?? defaultPageData.profileDescription,
      profileImage: page.about?.image ?? "",
      city: page.contact?.city ?? defaultPageData.city,
      address: page.contact?.address ?? defaultPageData.address,
      phone: page.contact?.phone ?? defaultPageData.phone,
      email: page.contact?.email ?? defaultPageData.email,
      publicSlug: page.slug ?? defaultPageData.publicSlug,
      scheduleStart: page.availability?.start ?? defaultPageData.scheduleStart,
      scheduleEnd: page.availability?.end ?? defaultPageData.scheduleEnd,
    },
    services: page.services?.length ? page.services : initialServices,
  };
}

export function databaseRowToPublicPage(row) {
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    professional: { ...defaultProfessional, ...(row.professional ?? {}) },
    theme: { ...defaultTheme, ...(row.theme ?? {}) },
    hero: { ...defaultHero, ...(row.hero ?? {}) },
    about: { ...defaultAbout, ...(row.about ?? {}) },
    services: row.services?.length ? row.services : initialServices,
    contact: { ...defaultContact, ...(row.contact ?? {}) },
    availability: { ...defaultAvailability, ...(row.availability ?? {}) },
    published: row.published,
  };
}

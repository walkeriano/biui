export const colorOptions = [
  "#16a34a",
  "#9adf62",
  "#c7e95f",
  "#fed7aa",
  "#fca5a5",
  "#c4b5fd",
  "#bfdbfe",
];

export const secondaryColorOptions = [
  "#004236",
  "#8fa3a0",
  "#e2e8f0",
  "#f7ede2",
  "#fecaca",
  "#e9d5ff",
  "#dbeafe",
];

export const defaultPageData = {
  primaryColor: "#16a34a",
  secondaryColor: "#004236",
  titleFont: "Playfair Display",
  textFont: "Inter",
  buttonStyle: "rounded",
  heroLabel: "",
  heroTitle: "",
  heroText: "",
  profileTitle: "",
  profileSubtitle: "",
  profileDescription: "",
  city: "",
  address: "",
  phone: "",
  email: "",
  publicSlug: "",
  scheduleStart: "09:00",
  scheduleEnd: "18:00",
};

export const publicPageFallbackData = {
  ...defaultPageData,
  heroLabel: "TU ESPACIO SEGURO",
  heroTitle: "Bienestar emocional para una vida mas plena",
  heroText:
    "Te acompano en tu proceso de crecimiento personal, gestion emocional y bienestar. Juntos podemos construir las herramientas que necesitas para sentirte mejor.",
  profileTitle: "Hola, soy Laura Martin",
  profileSubtitle: "Psicologa especializada en bienestar emocional",
  profileDescription:
    "Creo en la terapia como un espacio seguro, cercano y libre de juicios, donde puedas sentirte escuchado/a y acompanado/a en tu proceso. Mi enfoque es integrador y personalizado, adaptado a tus necesidades y objetivos.",
  city: "Madrid, Espana",
  address: "Calle Gran Via 12",
  phone: "+34 600 123 456",
  email: "laura@tucorreo.com",
  publicSlug: "laura-martin",
  scheduleStart: "09:00",
  scheduleEnd: "20:00",
};

export const emptyService = {
  id: 1,
  name: "",
  duration: "50 minutos",
  price: "",
  image: "",
  description: "",
};

export const initialServices = [{ ...emptyService }];

export const publicFallbackServices = [
  {
    id: 1,
    name: "Terapia individual",
    duration: "50 minutos",
    price: "60",
    image: "",
    description:
      "Un espacio para ti. Trabajaremos tus emociones, autoestima y objetivos personales.",
  },
];

export const weekDays = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

export const defaultAvailableDays = ["Lun", "Mar", "Mie", "Jue", "Vie"];

export const inputClassName =
  "h-10 w-full rounded-md border border-line bg-surface px-3 text-[0.8125rem] font-medium text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent-soft";

export const textareaClassName =
  "w-full resize-none rounded-md border border-line bg-surface px-3 py-2.5 text-[0.8125rem] font-medium leading-5 text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent-soft";

export const ghostButtonClassName =
  "flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 text-[0.8125rem] font-bold text-foreground transition hover:border-accent hover:text-accent";

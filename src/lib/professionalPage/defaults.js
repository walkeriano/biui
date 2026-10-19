export const defaultPageData = {
  primaryColor: "#16a34a",
  secondaryColor: "#004236",
  logoImage: "",
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
  socialFacebook: "",
  socialInstagram: "",
  socialYoutube: "",
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
  socialFacebook: "",
  socialInstagram: "",
  socialYoutube: "",
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

export const defaultAvailableDays = ["Lun", "Mar", "Mie", "Jue", "Vie"];


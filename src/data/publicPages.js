export const publicPages = [
  {
    slug: "laura-martin",
    professional: {
      name: "Laura Martin",
      title: "Psicologa",
      avatarInitials: "LM",
    },
    theme: {
      primaryColor: "#16a34a",
      secondaryColor: "#004236",
      titleFont: "Georgia",
      textFont: "Arial",
      buttonStyle: "rounded",
    },
    hero: {
      label: "TU ESPACIO SEGURO",
      title: "Bienestar emocional para una vida mas plena",
      text: "Te acompano en tu proceso de crecimiento personal, gestion emocional y bienestar. Juntos podemos construir las herramientas que necesitas para sentirte mejor.",
    },
    about: {
      title: "Hola, soy Laura Martin",
      subtitle: "Psicologa especializada en bienestar emocional",
      description:
        "Creo en la terapia como un espacio seguro, cercano y libre de juicios, donde puedas sentirte escuchado/a y acompanado/a en tu proceso. Mi enfoque es integrador y personalizado, adaptado a tus necesidades y objetivos.",
    },
    services: [
      {
        id: "terapia-individual",
        name: "Terapia individual",
        duration: "50 minutos",
        price: "60",
        description:
          "Un espacio para ti. Trabajaremos tus emociones, autoestima y objetivos personales.",
      },
      {
        id: "terapia-pareja",
        name: "Terapia de pareja",
        duration: "60 minutos",
        price: "70",
        description:
          "Mejora la comunicacion, resuelve conflictos y fortalece vuestra relacion.",
      },
      {
        id: "acompanamiento-emocional",
        name: "Acompanamiento emocional",
        duration: "50 minutos",
        price: "60",
        description:
          "Apoyo en momentos de cambio, ansiedad, estres o dificultades vitales.",
      },
    ],
    contact: {
      city: "Madrid, Espana",
      address: "Calle Gran Via 12",
      phone: "+34 600 123 456",
      email: "laura@tucorreo.com",
    },
    availability: {
      days: ["Lun", "Mar", "Mie", "Jue", "Vie"],
      start: "09:00",
      end: "20:00",
      times: ["09:00", "10:00", "11:00", "12:00", "16:00", "17:30"],
    },
  },
];

export function getPublicPageBySlug(slug) {
  return publicPages.find((page) => page.slug === slug);
}

export function getPublicPageSlugs() {
  return publicPages.map((page) => ({ slug: page.slug }));
}

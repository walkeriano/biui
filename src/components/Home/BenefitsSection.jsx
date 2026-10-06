import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faCalendarDays,
  faChartSimple,
  faClock,
  faHeart,
  faMobileScreenButton,
  faPenToSquare,
  faUser,
  faUsers,
} from "@/lib/fontawesome";

const professions = [
  {
    icon: faBriefcase,
    image: "/service-1.png",
    label: "Barbero",
    className:
      "lg:-rotate-[2.5deg] lg:translate-y-1 lg:[transform:rotate(-2.5deg)_rotateY(8deg)] hover:lg:[transform:translateY(-0.75rem)_rotate(-2.5deg)_rotateY(0deg)_scale(1.02)]",
  },
  {
    icon: faUser,
    image: "/service-2.png",
    label: "Dentista",
    className:
      "lg:rotate-[2.5deg] lg:translate-y-8 lg:[transform:translateY(2rem)_rotate(2.5deg)_rotateY(5deg)] hover:lg:[transform:translateY(1.15rem)_rotate(2.5deg)_rotateY(0deg)_scale(1.02)]",
  },
  {
    icon: faHeart,
    image: "/service-3.png",
    label: "Psicóloga",
    className:
      "lg:-rotate-[2.5deg] lg:translate-y-8 lg:[transform:translateY(2rem)_rotate(-2.5deg)_rotateY(-5deg)] hover:lg:[transform:translateY(1.15rem)_rotate(-2.5deg)_rotateY(0deg)_scale(1.02)]",
  },
  {
    icon: faPenToSquare,
    image: "/service-4.png",
    label: "Tatuadora",
    className:
      "lg:rotate-[2.5deg] lg:translate-y-1 lg:[transform:rotate(2.5deg)_rotateY(-8deg)] hover:lg:[transform:translateY(-0.75rem)_rotate(2.5deg)_rotateY(0deg)_scale(1.02)]",
  },
];

const benefits = [
  {
    description: "Tus clientes pueden agendar en cualquier momento.",
    icon: faCalendarDays,
    title: "Recibe reservas 24/7",
  },
  {
    description: "Olvídate de mensajes y llamadas interminables.",
    icon: faClock,
    title: "Ahorra tiempo",
  },
  {
    description: "Una página profesional que genera confianza.",
    icon: faUsers,
    title: "Más clientes",
  },
  {
    description: "Tus clientes reservan desde móvil, tablet o ordenador.",
    icon: faMobileScreenButton,
    title: "Funciona en cualquier dispositivo",
  },
  {
    description: "Adáptala a tu marca y muestra tus servicios a tu manera.",
    icon: faPenToSquare,
    title: "Personaliza tu página",
  },
  {
    description: "Ten todas tus citas y notificaciones en un solo lugar.",
    icon: faChartSimple,
    title: "Organiza tu día",
  },
];

export default function BenefitsSection() {
  return (
    <section
      id="beneficios"
      className="relative overflow-hidden bg-white px-4 py-20 text-foreground sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="pointer-events-none absolute left-[-18rem] top-[-16rem] size-[44rem] rounded-full bg-[radial-gradient(circle,rgba(208,244,157,0.44)_0%,rgba(238,250,219,0.3)_42%,transparent_70%)]" />
      <div className="pointer-events-none absolute right-[-18rem] top-[16rem] size-[46rem] rounded-full bg-[radial-gradient(circle,rgba(210,246,172,0.35)_0%,rgba(244,251,238,0.28)_46%,transparent_72%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-18rem] h-[32rem] bg-[radial-gradient(circle_at_50%_50%,rgba(230,249,212,0.58)_0%,rgba(250,253,247,0.34)_42%,transparent_72%)]" />

      <div className="relative z-10 mx-auto max-w-[96rem]">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mx-auto inline-flex rounded-full bg-[#e7f8d9] px-7 py-3 text-xs font-black uppercase tracking-[0.36em] text-[#05090a]">
            Beneficios
          </p>
          <h2 className="mt-7 text-[clamp(2.5rem,5.2vw,5.6rem)] font-black leading-[0.95] tracking-[-0.045em] text-[#05090a]">
            Todo lo que necesitas
            <span className="block text-[#26910f]">
              para hacer crecer tu negocio.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-[#69707d] sm:text-2xl sm:leading-9">
            Una plataforma simple y completa para que te enfoques en lo
            importante: tus clientes.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-[94rem] gap-4 [perspective:1400px] sm:grid-cols-2 lg:grid-cols-[1.04fr_1.08fr_0.92fr_1.14fr] lg:gap-3">
          {professions.map((profession) => (
            <article
              key={profession.label}
              className={`group relative min-h-[17rem] overflow-hidden rounded-[1.65rem] bg-[#050505] shadow-[0_24px_55px_rgba(6,19,15,0.12)] transition duration-500 ease-out [transform-style:preserve-3d] hover:z-20 hover:shadow-[0_34px_75px_rgba(6,19,15,0.2)] sm:min-h-[21rem] lg:min-h-[26rem] ${profession.className}`}
            >
              <Image
                src={profession.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover object-center transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,0.04),transparent_32%)] transition duration-500 group-hover:bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.1),transparent_36%)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.12)_42%,transparent_58%)] opacity-0 transition duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-5 bottom-5 flex justify-center">
                <div className="inline-flex min-w-[9.75rem] items-center justify-center gap-4 rounded-[1rem] bg-white px-5 py-3 text-sm font-black text-[#05090a] shadow-[0_18px_34px_rgba(0,0,0,0.16)] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_24px_42px_rgba(0,0,0,0.22)]">
                  <FontAwesomeIcon
                    icon={profession.icon}
                    className="size-7 text-[#26910f]"
                  />
                  {profession.label}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-14 grid max-w-[86rem] gap-4 md:grid-cols-2 xl:grid-cols-3">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="grid min-h-[6.6rem] grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-6 rounded-[1.1rem] bg-white/92 px-6 py-5 shadow-[0_20px_55px_rgba(6,19,15,0.08)] ring-1 ring-[#eef5e9]"
            >
              <span className="grid size-[4.25rem] place-items-center rounded-[1rem] bg-[#e7f8d9] text-[#26910f]">
                <FontAwesomeIcon icon={benefit.icon} className="size-8" />
              </span>
              <span>
                <span className="block text-base font-black leading-6 text-[#05090a]">
                  {benefit.title}
                </span>
                <span className="mt-1 block max-w-[18rem] text-base font-medium leading-6 text-[#69707d]">
                  {benefit.description}
                </span>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCheck,
  faComment,
  faEnvelope,
  faUsers,
} from "@/lib/fontawesome";

const planFeatures = [
  "Página de reservas personalizada",
  "Reservas ilimitadas",
  "Gestión de servicios y horarios",
  "Notificaciones automáticas",
  "Soporte por email",
  "Todas las funciones incluidas",
];

const supportFeatures = [
  {
    description: "Soporte por chat de lunes a viernes.",
    icon: faComment,
  },
  {
    description: "Respuesta rápida a tus consultas.",
    icon: faEnvelope,
  },
  {
    description: "Guías y tutoriales para sacarle el máximo provecho.",
    icon: faUsers,
  },
];

export default function SubscriptionContactSection() {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-20 text-[#05090a] sm:px-6 lg:px-8 lg:py-24">
      <span id="suscripcion" className="absolute -top-24" />
      <Image
        src="/bg-oficial.png"
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-white/18" />

      <div className="relative z-10 mx-auto max-w-[96rem]">
        <div className="grid items-center gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14">
          <div className="max-w-[52rem]">
            <p className="inline-flex rounded-full bg-[#e7f8d9] px-7 py-3 text-xs font-black uppercase tracking-[0.36em] shadow-[0_18px_36px_rgba(67,174,18,0.12)]">
              Suscripción
            </p>
            <h2 className="mt-7 text-[clamp(2.8rem,5vw,5.85rem)] font-black leading-[0.95]">
              Un plan de lanzamiento
              <span className="block text-[#42ad18]">
                para impulsar tu negocio.
              </span>
            </h2>
            <p className="mt-7 max-w-[48rem] text-xl font-medium leading-8 text-[#636775] sm:text-2xl sm:leading-10">
              Accede a todas las funcionalidades por solo{" "}
              <strong className="font-black text-[#3b3d48]">
                5 € el primer mes.
              </strong>{" "}
              Sin permanencia y cancela cuando quieras.
            </p>
          </div>

          <div className="rounded-[1.6rem] bg-white/88 p-6 shadow-[0_26px_75px_rgba(9,24,15,0.1)] ring-1 ring-white/80 backdrop-blur md:p-8">
            <div className="grid gap-8 md:grid-cols-[0.95fr_1.05fr] md:items-center">
              <div className="text-center">
                <p className="mx-auto inline-flex rounded-full bg-[#e7f8d9] px-7 py-3 text-xs font-black uppercase tracking-[0.34em]">
                  Plan de lanzamiento
                </p>
                <div className="mt-5 text-[clamp(5rem,11vw,8.25rem)] font-black leading-none">
                  5 €
                </div>
                <p className="mt-2 text-2xl font-black leading-none">
                  el primer mes
                </p>
                <p className="mt-2 text-base font-medium leading-6 text-[#70727c]">
                  Luego 12 €/mes
                  <span className="block">Sin permanencia</span>
                </p>
                <Link
                  href="/acceso"
                  className="mt-5 inline-flex h-14 w-full items-center justify-center gap-4 rounded-[0.7rem] bg-[#003d2e] px-6 text-lg font-bold text-white shadow-[0_18px_34px_rgba(0,61,46,0.2)] transition hover:bg-[#002d22] focus:outline-none focus:ring-4 focus:ring-[#bce9a8]"
                >
                  Comenzar ahora
                  <FontAwesomeIcon icon={faArrowRight} className="size-4" />
                </Link>
              </div>

              <ul className="space-y-4 border-[#e7ece7] md:border-l md:pl-8">
                {planFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-4 text-lg font-medium text-[#626671]"
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-[#49b719] text-white shadow-[0_12px_22px_rgba(73,183,25,0.24)]">
                      <FontAwesomeIcon icon={faCheck} className="size-4" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div
          id="atencion"
          className="relative mt-16 overflow-hidden rounded-[1.65rem] bg-[#003b2d] px-6 py-8 text-white shadow-[0_28px_70px_rgba(0,38,30,0.18)] sm:px-10 lg:mt-20 lg:px-14 lg:py-12"
        >
          <Image
            src="/bg-oficial.png"
            alt=""
            fill
            sizes="100vw"
            className="pointer-events-none object-cover object-bottom opacity-85 mix-blend-screen"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,38,30,0.98)_0%,rgba(0,58,36,0.94)_55%,rgba(0,83,41,0.78)_100%)]" />
          <div className="pointer-events-none absolute -bottom-16 -left-20 size-72 rounded-full bg-[#74d73c]/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 -top-20 size-80 rounded-full bg-[#8ee75a]/20 blur-3xl" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="max-w-[36rem]">
              <p className="inline-flex rounded-full bg-[#43b717] px-5 py-2.5 text-[0.65rem] font-black uppercase tracking-[0.34em]">
                Atención al cliente
              </p>
              <h3 className="mt-5 text-[clamp(2.5rem,4vw,4.35rem)] font-black leading-[0.95]">
                Siempre aquí
                <span className="block text-[#57c722]">para ayudarte.</span>
              </h3>
              <p className="mt-4 max-w-[31rem] text-base font-medium leading-7 text-white/88">
                ¿Tienes alguna duda? Nuestro equipo está listo para ayudarte en
                lo que necesites. Te acompañamos en cada paso.
              </p>
              <Link
                href="/acceso"
                className="mt-8 inline-flex h-14 w-full max-w-[16.5rem] items-center justify-center gap-4 rounded-[0.7rem] bg-white px-6 text-base font-black text-[#05090a] shadow-[0_18px_34px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:bg-[#f2f6ef] focus:outline-none focus:ring-4 focus:ring-white/40"
              >
                Contactar soporte
                <FontAwesomeIcon icon={faArrowRight} className="size-4" />
              </Link>
            </div>

            <div className="grid gap-4 border-white/20 lg:grid-cols-3 lg:border-l lg:pl-10">
              {supportFeatures.map((feature) => (
                <div
                  key={feature.description}
                  className="rounded-[1rem] border border-white/12 bg-white/[0.07] p-5 shadow-[0_18px_36px_rgba(0,0,0,0.08)] backdrop-blur"
                >
                  <span className="grid size-14 place-items-center rounded-full border border-white/20 bg-white/8 text-white shadow-[0_0_0_8px_rgba(255,255,255,0.04)]">
                    <FontAwesomeIcon icon={feature.icon} className="size-7" />
                  </span>
                  <p className="mt-5 text-base font-medium leading-6 text-white/86">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

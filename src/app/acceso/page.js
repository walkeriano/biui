import Image from "next/image";
import Link from "next/link";
import AuthPanel from "@/components/auth/AuthPanel/AuthPanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@/lib/fontawesome";

export const metadata = {
  title: "Acceso | BIUI",
  description: "Crea tu pagina profesional y gestiona reservas con BIUI.",
};

export default function AccesoPage() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_20%_12%,var(--accent-soft),transparent_22rem),linear-gradient(135deg,#ffffff_0%,var(--background)_50%,#eef6f2_100%)] px-4 pb-8 pt-4 text-foreground sm:px-6 sm:pt-6 lg:px-8">
      <header className="mx-auto flex w-full max-w-[86rem] items-center justify-between gap-3 rounded-[1.15rem] border border-white/70 bg-white/90 px-4 py-3 shadow-[0_12px_40px_rgba(8,31,24,0.08)] backdrop-blur sm:gap-6 sm:px-8">
        <Link href="/" aria-label="BIUI inicio" className="shrink-0">
          <Image
            src="/logo-biui.jpg"
            alt="BIUI"
            width={981}
            height={554}
            priority
            className="h-10 w-auto object-contain mix-blend-multiply sm:h-12"
          />
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[0.55rem] bg-[#00261e] px-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(0,31,24,0.16)] transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-soft sm:gap-3 sm:px-4"
        >
          <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="size-3.5 rotate-180" />
          Volver al inicio
        </Link>
      </header>
      <section className="mx-auto mt-10 grid min-h-[calc(100dvh-11rem)] w-full max-w-[var(--container-page)] items-center gap-10 lg:grid-cols-[0.92fr_1fr]">
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          <p className="inline-flex rounded-full bg-accent-soft px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Tu pagina profesional
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Publica tu presencia online y recibe reservas sin friccion.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted sm:text-lg">
            Crea una landing personalizada, ajusta tus servicios, define tus
            horarios y comparte una pagina lista para convertir visitas en citas.
          </p>
        </div>

        <AuthPanel />
      </section>
    </main>
  );
}

import Image from "next/image";
import AuthPanel from "@/components/auth/AuthPanel/AuthPanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCheck,
  faShieldHalved,
} from "@/lib/fontawesome";

export const metadata = {
  title: "Acceso | BIUI",
  description: "Crea tu pagina profesional y gestiona reservas con BIUI.",
};

export default function AccesoPage() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_20%_12%,var(--accent-soft),transparent_22rem),linear-gradient(135deg,#ffffff_0%,var(--background)_50%,#eef6f2_100%)] px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-[var(--container-page)] items-center gap-10 lg:grid-cols-[0.92fr_1fr]">
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          <div className="mb-8 flex justify-center lg:justify-start">
            <Image
              src="/logo-biui.jpg"
              alt="BIUI"
              width={981}
              height={554}
              priority
              className="h-16 w-auto object-contain"
            />
          </div>

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
          <div className="mt-8 hidden rounded-card border border-line bg-surface-elevated p-5 text-left shadow-card backdrop-blur lg:block">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                <FontAwesomeIcon icon={faCalendarDays} className="size-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">
                  De idea a pagina publicada
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Disena tu perfil, publica cambios y abre tu pagina final en
                  segundos para comprobar la experiencia de tus clientes.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm font-semibold text-muted-foreground">
              <p className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCheck} className="size-3 text-accent" />
                Plantilla editable con colores, imagenes y servicios
              </p>
              <p className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faShieldHalved}
                  className="size-3 text-accent"
                />
                Reservas protegidas y panel privado para profesionales
              </p>
            </div>
          </div>
        </div>

        <AuthPanel />
      </section>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faRightToBracket,
} from "@/lib/fontawesome";

const navigation = [
  { label: "Funciones", href: "#funciones" },
  { label: "Precios", href: "#precios" },
  { label: "Ejemplos", href: "#ejemplos" },
  { label: "Preguntas", href: "#preguntas" },
];

export default function Header() {
  return (
    <header className="mx-auto flex w-full max-w-[var(--container-page)] items-center justify-between gap-6 rounded-card border border-line bg-surface-elevated px-4 py-3 shadow-card backdrop-blur sm:px-6">
      <Link href="/" aria-label="BIUI inicio" className="shrink-0">
        <Image
          src="/logo-biui.jpg"
          alt="BIUI"
          width={981}
          height={554}
          priority
          className="h-10 w-auto object-contain"
        />
      </Link>

      <nav className="hidden items-center gap-7 text-sm font-medium text-foreground lg:flex">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="transition hover:text-accent"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/acceso"
          className="hidden items-center gap-2 text-sm font-semibold text-foreground transition hover:text-accent sm:inline-flex"
        >
          <FontAwesomeIcon icon={faRightToBracket} className="size-3.5" />
          Iniciar sesion
        </Link>
        <Link
          href="/acceso"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white shadow-card transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-soft"
        >
          Crear cuenta gratis
          <FontAwesomeIcon icon={faArrowRight} className="size-3.5" />
        </Link>
      </div>
    </header>
  );
}

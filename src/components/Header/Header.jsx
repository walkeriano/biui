import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket, faUserPlus } from "@/lib/fontawesome";

const navigation = [
  { label: "Inicio", href: "/", active: true },
  { label: "Beneficios", href: "#beneficios" },
  { label: "Suscripción", href: "#suscripcion" },
  { label: "Atención al cliente", href: "#atencion" },
];

export default function Header() {
  return (
    <header className="mx-auto flex w-full max-w-[86rem] items-center justify-between rounded-[1.15rem] border border-white/70 bg-white/90 px-4 py-3 shadow-[0_12px_40px_rgba(8,31,24,0.08)] backdrop-blur sm:gap-6 sm:px-8">
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
      <nav className="hidden items-center gap-10 text-base font-medium text-[#0f1315] lg:flex">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              item.active
                ? "relative py-2 font-bold text-sm text-[#34ad12] after:absolute after:-bottom-3 after:left-1/2 after:h-1 after:w-9 after:-translate-x-1/2 after:rounded-full after:bg-[#34ad12]"
                : "py-2 transition text-sm hover:text-accent"
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <Link
          href="/acceso"
          className="hidden items-center gap-3 text-base font-bold text-[#0d1214] transition hover:text-accent text-sm sm:inline-flex"
        >
          <FontAwesomeIcon icon={faRightToBracket} className="size-3.5" />
          Iniciar sesión
        </Link>
        <Link
          href="/acceso"
          aria-label="Crear cuenta"
          className="inline-flex size-10 items-center justify-center gap-2 whitespace-nowrap rounded-[0.55rem] bg-[#00261e] text-sm font-bold text-white shadow-[0_14px_30px_rgba(0,31,24,0.16)] transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary-soft sm:h-11 sm:w-auto sm:px-4"
        >
          <span className="hidden sm:inline">Crear cuenta</span>
          <FontAwesomeIcon icon={faUserPlus} className="size-3.7" />
        </Link>
      </div>
    </header>
  );
}

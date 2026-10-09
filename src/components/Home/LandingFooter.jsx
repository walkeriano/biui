import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@/lib/fontawesome";

const footerLinks = [
  { label: "Inicio", href: "/" },
  { label: "Beneficios", href: "#beneficios" },
  { label: "Suscripción", href: "#suscripcion" },
  { label: "Atención al cliente", href: "#atencion" },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-[#edf2ea] bg-[#f7faf6] px-4 py-10 text-[#05090a] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[86rem] gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <Link href="/" aria-label="BIUI inicio" className="inline-flex">
            <Image
              src="/logo-biui.jpg"
              alt="BIUI"
              width={981}
              height={554}
              className="h-12 w-auto object-contain mix-blend-multiply"
            />
          </Link>
          <p className="mt-5 max-w-[30rem] text-base font-medium leading-7 text-[#69707d]">
            Crea tu página de reservas, compártela con tus clientes y gestiona
            tus citas desde un solo lugar.
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:items-end">
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-[#69707d]">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-[#26910f]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/acceso"
            className="inline-flex h-12 w-full max-w-[15rem] items-center justify-center gap-3 rounded-[0.65rem] bg-[#43b717] px-5 text-sm font-black text-white shadow-[0_16px_32px_rgba(67,183,23,0.18)] transition hover:bg-[#36a511] focus:outline-none focus:ring-4 focus:ring-[#bce9a8]"
          >
            Crear cuenta
            <FontAwesomeIcon icon={faArrowRight} className="size-3.5" />
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-9 flex max-w-[86rem] flex-col gap-3 border-t border-[#e3eadf] pt-6 text-sm font-medium text-[#8a929a] sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 BIUI. Todos los derechos reservados.</p>
        <p>Reservas simples para negocios que quieren crecer.</p>
      </div>
    </footer>
  );
}

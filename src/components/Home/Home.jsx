import Link from "next/link";
import Image from "next/image";
import BenefitsSection from "@/components/Home/BenefitsSection";
import Header from "@/components/Header/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@/lib/fontawesome";

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-white text-foreground before:pointer-events-none before:absolute before:left-[-14rem] before:top-[-18rem] before:z-0 before:size-[42rem] before:rounded-full before:bg-[radial-gradient(circle,rgba(196,238,118,0.46)_0%,rgba(235,248,216,0.24)_42%,transparent_70%)] after:pointer-events-none after:absolute after:right-[-18rem] after:top-[5rem] after:z-0 after:size-[50rem] after:rounded-full after:bg-[radial-gradient(circle,rgba(57,173,18,0.16)_0%,rgba(0,38,30,0.08)_38%,transparent_68%)]">
      <div className="pointer-events-none absolute inset-x-0 bottom-[-18rem] z-0 h-[34rem] bg-[radial-gradient(circle_at_50%_50%,rgba(224,246,205,0.42)_0%,rgba(247,251,243,0.32)_34%,transparent_70%)]" />
      <div className="relative z-10 px-4 pt-9 sm:px-6 lg:px-8">
        <Header />
      </div>

      <section className="relative z-10 mx-auto grid min-h-[calc(100dvh-9.25rem)] w-full max-w-[86rem] items-center px-4 pb-10 pt-10 sm:px-8 lg:grid-cols-[0.86fr_1.14fr] lg:gap-6 lg:pb-8 lg:pt-0">
        <div className="relative z-20 w-full min-w-0 max-w-[38rem] lg:pb-3">
          <p className="inline-flex max-w-full rounded-full bg-[#ebf8d8] px-4 py-2.5 text-[0.56rem] font-black uppercase tracking-[0.16em] text-[#111714] shadow-[0_1px_0_rgba(255,255,255,0.75)_inset] sm:px-5 sm:text-xs sm:tracking-[0.2em]">
            Tu plataforma de reservas en minutos
          </p>

          <h1 className="mt-6 text-[clamp(2.2rem,4.35vw,4.35rem)] font-black leading-[1.03] text-[#05090a]">
            Tu web,
            <span className="block text-[#45af16]">tus reservas</span>
            <span className="block">y tus clientes</span>
            <span className="block">en un solo lugar.</span>
          </h1>

          <p className="mt-5 max-w-[20rem] text-base font-medium leading-7 text-[#626b70] sm:max-w-[34rem] sm:text-xl sm:leading-8">
            Crea tu página web con calendario de reservas, compártela con tus
            clientes y gestiona citas automáticamente.
          </p>

          <div className="mt-8">
            <Link
              href="/acceso"
              className="inline-flex h-14 w-full max-w-[18.5rem] items-center justify-center gap-4 rounded-[0.6rem] bg-[#39ad12] px-6 text-base font-bold text-white shadow-[0_18px_34px_rgba(44,160,17,0.18)] transition hover:bg-[#2f9810] focus:outline-none focus:ring-4 focus:ring-[#cdecbb] sm:w-auto sm:min-w-[18.5rem] sm:text-lg"
            >
              Crear mi pagina
              <FontAwesomeIcon icon={faUserPlus} className="size-4" />
            </Link>
          </div>
        </div>

        <div className="pointer-events-none relative z-10 mx-auto mt-8 aspect-[1672/941] h-auto w-full max-w-[42rem] min-w-0 lg:mx-0 lg:mt-0 lg:max-w-none lg:self-center">
          <Image
            src="/movil-png.png"
            alt="Panel de reservas de BIUI en ordenador y móvil"
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-contain object-center"
          />
        </div>
      </section>

      <BenefitsSection />
    </main>
  );
}

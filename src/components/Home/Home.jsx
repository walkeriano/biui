import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@/lib/fontawesome";

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f7fbf3] text-foreground">
      <Image
        src="/bg-oficial.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none z-0 object-cover object-center"
      />

      <div className="relative z-10 px-4 pt-9 sm:px-6 lg:px-8">
        <Header />
      </div>

      <section className="relative z-10 mx-auto grid min-h-[calc(100dvh-9.25rem)] w-full max-w-[91rem] items-center px-6 pb-10 pt-12 sm:px-8 lg:grid-cols-[0.93fr_1.07fr] lg:gap-0 lg:px-10 lg:pb-8 lg:pt-2 xl:px-0">
        <div className="relative z-20 w-full min-w-0 max-w-[45rem] lg:pb-5">
          <p className="inline-flex max-w-full rounded-full bg-[#ebf8d8] px-4 py-3 text-[0.56rem] font-black uppercase tracking-[0.18em] text-[#111714] shadow-[0_1px_0_rgba(255,255,255,0.75)_inset] sm:px-6 sm:text-sm sm:tracking-[0.24em]">
            Tu plataforma de reservas en minutos
          </p>

          <h1 className="mt-7 text-[clamp(2.55rem,5.2vw,5.25rem)] font-black leading-[1.02] text-[#05090a]">
            Tu web,
            <span className="block text-[#45af16]">tus reservas</span>
            <span className="block">y tus clientes</span>
            <span className="block">en un solo lugar.</span>
          </h1>

          <p className="mt-6 max-w-[20rem] text-lg font-medium leading-7 text-[#626b70] sm:max-w-[39rem] sm:text-[1.38rem] sm:leading-8">
            Crea tu página de reservas, compártela con tus clientes y recibe
            citas automáticamente. Sin complicaciones.
          </p>

          <div className="mt-9">
            <Link
              href="/acceso"
              className="inline-flex h-[4.15rem] w-full max-w-[21rem] items-center justify-center gap-5 rounded-[0.6rem] bg-[#39ad12] px-8 text-lg font-bold text-white shadow-[0_18px_34px_rgba(44,160,17,0.18)] transition hover:bg-[#2f9810] focus:outline-none focus:ring-4 focus:ring-[#cdecbb] sm:w-auto sm:min-w-[21rem] sm:text-xl"
            >
              Crear mi pagina gratis
              <FontAwesomeIcon icon={faArrowRight} className="size-5" />
            </Link>
            <p className="mt-4 text-base font-medium text-[#6f777a] sm:pl-1">
              Sin tarjeta de credito. Configúrala en minutos.
            </p>
          </div>
        </div>

        <div className="pointer-events-none relative z-10 mx-0 mt-8 h-[24rem] min-w-0 sm:h-[31rem] lg:mx-[-2rem] lg:-mt-24 lg:h-[43rem] lg:translate-x-8 xl:h-[47rem]">
          <Image
            src="/movil-png.png"
            alt="Panel de reservas de BIUI en ordenador y móvil"
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-contain object-center lg:scale-[1.3] lg:object-[62%_50%] xl:scale-[1.34] xl:object-[58%_50%]"
          />
        </div>
      </section>
    </main>
  );
}

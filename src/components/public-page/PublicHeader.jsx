export default function PublicHeader({ page }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#inicio" className="flex items-center gap-3">
          <span
            className="grid size-11 place-items-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: page.theme.secondaryColor }}
          >
            {page.professional.avatarInitials}
          </span>
          <span>
            <span className="block text-sm font-bold text-foreground">
              {page.professional.name}
            </span>
            <span className="block text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted">
              {page.professional.title}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-bold text-muted lg:flex">
          <a href="#servicios" className="transition hover:text-foreground">
            Servicios
          </a>
          <a href="#sobre-mi" className="transition hover:text-foreground">
            Sobre mi
          </a>
          <a href="#contacto" className="transition hover:text-foreground">
            Contacto
          </a>
        </nav>

        <a
          href="#reservar"
          className="rounded-md px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:opacity-90"
          style={{ backgroundColor: page.theme.secondaryColor }}
        >
          Reservar cita
        </a>
      </div>
    </header>
  );
}

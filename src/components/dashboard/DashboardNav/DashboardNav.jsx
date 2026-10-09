import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAnglesLeft,
  faAnglesRight,
  faCalendarDays,
  faHouse,
  faRightFromBracket,
  faUser,
  faXmark,
} from "@/lib/fontawesome";

const navigation = [
  { id: "home", label: "Inicio", description: "", icon: faHouse, enabled: true },
  {
    id: "page",
    label: "Mi pagina",
    description: "Nombre y perfil",
    icon: faUser,
    enabled: true,
  },
  {
    id: "reservations",
    label: "Reservas",
    description: "Agenda y citas",
    icon: faCalendarDays,
    enabled: true,
  },
];

export default function DashboardNav({
  activeView,
  isCollapsed,
  isOpen,
  isSigningOut,
  onClose,
  onSignOut,
  onToggleCollapse,
  onViewChange,
}) {
  return (
    <>
      <div
        className={
          isOpen
            ? "fixed inset-0 z-40 bg-primary/30 backdrop-blur-sm lg:hidden"
            : "hidden"
        }
        onClick={onClose}
      />

      <aside
        className={
          isOpen
            ? "fixed inset-y-0 left-0 z-50 flex h-dvh w-72 flex-col border-r border-line bg-surface px-3 py-5 shadow-soft transition-all duration-300 lg:w-56 lg:translate-x-0"
            : isCollapsed
              ? "fixed inset-y-0 left-0 z-50 flex h-dvh w-72 -translate-x-full flex-col border-r border-line bg-surface px-3 py-5 shadow-soft transition-all duration-300 lg:w-20 lg:translate-x-0"
              : "fixed inset-y-0 left-0 z-50 flex h-dvh w-72 -translate-x-full flex-col border-r border-line bg-surface px-3 py-5 shadow-soft transition-all duration-300 lg:w-56 lg:translate-x-0"
        }
      >
        <div
          className={
            isCollapsed
              ? "mb-5 flex shrink-0 items-center justify-center gap-2"
              : "mb-5 flex shrink-0 items-center justify-between gap-2"
          }
        >
          <div className={isCollapsed ? "hidden" : "block"}>
            <Image
              src="/logo-biui.jpg"
              alt="BIUI"
              width={981}
              height={554}
              priority
              className="h-12 w-auto object-contain"
            />
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden size-10 place-items-center rounded-md bg-surface-muted text-muted transition hover:bg-success-soft hover:text-success lg:grid"
            aria-label={isCollapsed ? "Expandir menu" : "Contraer menu"}
          >
            <FontAwesomeIcon
              icon={isCollapsed ? faAnglesRight : faAnglesLeft}
              className="size-4"
            />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-md bg-surface-muted text-muted lg:hidden"
            aria-label="Cerrar menu"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="-mx-2 flex flex-1 items-center px-2 py-5">
          <nav className="grid w-full gap-2">
            {navigation.map((item) => {
              const isActive = activeView === item.id;
              const isEnabled = item.enabled;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => isEnabled && onViewChange(item.id)}
                  disabled={!isEnabled}
                  className={
                    isActive
                      ? "flex w-full items-center gap-3 rounded-card bg-success-soft px-3 py-2.5 text-left text-foreground"
                      : isEnabled
                        ? "flex w-full items-center gap-3 rounded-card px-3 py-2.5 text-left text-foreground transition hover:bg-surface-muted"
                        : "flex w-full items-center gap-3 rounded-card px-3 py-2.5 text-left text-foreground opacity-80"
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <span
                    className={
                      isActive
                        ? "grid size-9 shrink-0 place-items-center rounded-md bg-surface text-success"
                        : "grid size-9 shrink-0 place-items-center rounded-md bg-surface-muted text-primary"
                    }
                  >
                    <FontAwesomeIcon icon={item.icon} className="size-4" />
                  </span>
                  <span className={isCollapsed ? "lg:hidden" : "block"}>
                    <span className="block text-sm font-bold">{item.label}</span>
                    {item.description ? (
                      <span className="mt-1 block text-xs font-medium text-muted">
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={onSignOut}
              disabled={isSigningOut}
              className="flex w-full items-center gap-3 rounded-card px-3 py-2.5 text-left text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-70"
              title={isCollapsed ? "Cerrar sesión" : undefined}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-surface-muted text-primary">
                <FontAwesomeIcon icon={faRightFromBracket} className="size-4" />
              </span>
              <span className={isCollapsed ? "lg:hidden" : "block"}>
                <span className="block text-sm font-bold">
                  {isSigningOut ? "Cerrando..." : "Cerrar sesión"}
                </span>
              </span>
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
}

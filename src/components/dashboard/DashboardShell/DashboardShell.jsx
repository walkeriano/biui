"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DashboardNav from "@/components/dashboard/DashboardNav/DashboardNav";
import DashboardHome from "@/components/dashboard/DashboardHome/DashboardHome";
import MyPageView from "@/components/dashboard/MyPageView/MyPageView";
import ReservationsView from "@/components/dashboard/ReservationsView/ReservationsView";
import useCurrentPublicPageLink from "@/hooks/useCurrentPublicPageLink";
import { useAuth } from "@/context/AuthContext";
import {
  faBars,
  faUpRightFromSquare,
  faXmark,
} from "@/lib/fontawesome";

const views = {
  home: DashboardHome,
  page: MyPageView,
  reservations: ReservationsView,
};

export default function DashboardShell() {
  const [activeView, setActiveView] = useState("home");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const { user } = useAuth();
  const publicPageLink = useCurrentPublicPageLink();
  const ActiveView = views[activeView] ?? DashboardHome;
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Profesional";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleViewChange = (viewId) => {
    setActiveView(viewId);
    setIsNavOpen(false);
  };

  return (
    <main className="min-h-dvh bg-[linear-gradient(135deg,#f7fbfb_0%,#f1f8ef_45%,#ffffff_100%)] text-foreground">
      <div className="min-h-dvh">
        <DashboardNav
          activeView={activeView}
          isCollapsed={isNavCollapsed}
          isOpen={isNavOpen}
          onClose={() => setIsNavOpen(false)}
          onToggleCollapse={() => setIsNavCollapsed((value) => !value)}
          onViewChange={handleViewChange}
        />

        <section
          className={
            isNavCollapsed
              ? "min-w-0 px-4 py-4 transition-[padding] duration-300 sm:px-5 lg:pl-[6.5rem] lg:pr-6"
              : "min-w-0 px-4 py-4 transition-[padding] duration-300 sm:px-5 lg:pl-[15.5rem] lg:pr-6"
          }
        >
          <header className="mb-5 flex items-center justify-between gap-4 rounded-[1rem] border border-line bg-surface-elevated px-4 py-3 shadow-card backdrop-blur lg:hidden">
            <button
              type="button"
              onClick={() => setIsNavOpen((value) => !value)}
              className="grid size-11 place-items-center rounded-md bg-primary text-white"
              aria-label={isNavOpen ? "Cerrar menu" : "Abrir menu"}
            >
              <FontAwesomeIcon icon={isNavOpen ? faXmark : faBars} />
            </button>
            <p className="text-sm font-bold text-foreground">BIUI Dashboard</p>
            <span className="size-11" />
          </header>

          <div className="mb-5 hidden items-center justify-between gap-5 rounded-[1rem] border border-line bg-surface-elevated px-5 py-4 shadow-card backdrop-blur lg:flex">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Buenos dias, {displayName} 👋
              </h1>
              <p className="mt-1 text-sm text-muted">
                Aqui tienes un resumen de tu pagina, reservas y proximos
                eventos.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={publicPageLink.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center gap-3 rounded-md border border-line bg-surface px-4 text-sm font-bold text-foreground shadow-card transition hover:border-accent hover:text-accent"
              >
                {publicPageLink.isLoading ? "Preparando..." : "Ver pagina"}
                <FontAwesomeIcon icon={faUpRightFromSquare} className="size-4" />
              </Link>
              <div className="flex h-11 items-center gap-3 rounded-md border border-line bg-surface px-3 shadow-card">
                <div className="grid size-8 place-items-center rounded-full bg-primary text-xs font-bold text-white">
                  {initials}
                </div>
                <p className="text-sm font-bold text-foreground">{displayName}</p>
              </div>
            </div>
          </div>

          <ActiveView onViewChange={handleViewChange} />
        </section>
      </div>
    </main>
  );
}

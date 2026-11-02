"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DashboardNav, { navigation } from "@/components/dashboard/DashboardNav/DashboardNav";
import DashboardHome from "@/components/dashboard/DashboardHome/DashboardHome";
import MyPageView from "@/components/dashboard/MyPageView/MyPageView";
import ReservationsView from "@/components/dashboard/ReservationsView/ReservationsView";
import useAuthActions from "@/hooks/useAuthActions";
import useCurrentPublicPageLink from "@/hooks/useCurrentPublicPageLink";
import { useAuth } from "@/context/AuthContext";
import {
  faRightFromBracket,
  faUpRightFromSquare,
} from "@/lib/fontawesome";

const views = {
  home: DashboardHome,
  page: MyPageView,
  reservations: ReservationsView,
};

const viewTitles = {
  home: "Resumen del dia",
  page: "Personaliza tu sitio web",
  reservations: "Supervisa tus reservas",
};

export default function DashboardShell() {
  const router = useRouter();
  const [activeView, setActiveView] = useState("home");
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [editorMounted, setEditorMounted] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { user } = useAuth();
  const { signOut } = useAuthActions();
  const publicPageLink = useCurrentPublicPageLink();
  const ActiveView = views[activeView] ?? DashboardHome;
  const activeViewTitle = viewTitles[activeView] ?? viewTitles.home;
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Profesional";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleViewChange = (viewId) => {
    if (viewId === "page") setEditorMounted(true);
    setActiveView(viewId);
  };

  const handleSignOut = async () => {
    if (hasUnsavedChanges && !window.confirm("Tienes cambios sin publicar. ¿Quieres cerrar sesión y descartarlos?")) return;
    setIsSigningOut(true);
    const { error } = await signOut();

    if (error) {
      setIsSigningOut(false);
      window.alert(error.message);
      return;
    }

    router.replace("/acceso");
  };

  return (
    <main className="min-h-dvh bg-[linear-gradient(135deg,#f7fbfb_0%,#f1f8ef_45%,#ffffff_100%)] text-foreground">
      <div className="min-h-dvh">
        <div className="hidden lg:block">
          <DashboardNav
            activeView={activeView}
            isCollapsed={isNavCollapsed}
            isOpen={false}
            onSignOut={handleSignOut}
            onToggleCollapse={() => setIsNavCollapsed((value) => !value)}
            onViewChange={handleViewChange}
            isSigningOut={isSigningOut}
          />
        </div>

        <section
          className={
            isNavCollapsed
              ? "min-w-0 px-4 py-4 transition-[padding] duration-300 sm:px-5 lg:pl-[6.5rem] lg:pr-6"
              : "min-w-0 px-4 py-4 transition-[padding] duration-300 sm:px-5 lg:pl-[15.5rem] lg:pr-6"
          }
        >
          <header className="mb-3 flex items-center justify-between gap-4 rounded-[1rem] border border-line bg-surface-elevated px-4 py-3 shadow-card backdrop-blur lg:hidden">
            <button
              type="button"
              onClick={() => handleViewChange("home")}
              className="flex min-h-11 shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="BIUI, ir al inicio del dashboard"
            >
              <Image
                src="/logo-biui.jpg"
                alt="BIUI"
                width={981}
                height={554}
                priority
                className="h-10 w-auto object-contain mix-blend-multiply"
              />
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-black px-4 text-xs font-bold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="size-4 text-accent" />
              {isSigningOut ? "Cerrando..." : "Cerrar sesión"}
            </button>
          </header>

          <nav
            aria-label="Navegación del dashboard"
            className="mb-5 flex min-w-0 gap-2 overflow-x-auto overscroll-x-contain pb-1 lg:hidden"
          >
            {navigation.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!item.enabled}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => handleViewChange(item.id)}
                  className={`inline-flex min-h-11 flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset disabled:opacity-60 sm:gap-2 sm:px-4 sm:text-sm ${
                    isActive
                      ? "border-black bg-black text-white"
                      : "border-line bg-surface text-foreground hover:border-accent"
                  }`}
                >
                  <FontAwesomeIcon icon={item.icon} className="size-3.5 text-accent" />
                  {item.id === "page" ? "Mi página" : item.label}
                </button>
              );
            })}
          </nav>

          <div className="mb-5 hidden items-center justify-between gap-5 rounded-[1rem] border border-line bg-surface-elevated px-5 py-4 shadow-card backdrop-blur lg:flex">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {activeViewTitle}
              </h1>
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

          {editorMounted ? (
            <div hidden={activeView !== "page"}>
              <MyPageView onViewChange={handleViewChange} onDirtyChange={setHasUnsavedChanges} />
            </div>
          ) : null}
          {activeView !== "page" ? <ActiveView onViewChange={handleViewChange} /> : null}
        </section>
      </div>
    </main>
  );
}

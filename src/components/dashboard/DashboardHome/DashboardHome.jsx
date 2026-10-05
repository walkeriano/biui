"use client";

import AppointmentsWidget from "@/components/dashboard/widgets/AppointmentsWidget";
import QuickActionsWidget from "@/components/dashboard/widgets/QuickActionsWidget";
import RecentClientsWidget from "@/components/dashboard/widgets/RecentClientsWidget";
import StatCard from "@/components/dashboard/widgets/StatCard";
import useDashboardSummary from "@/hooks/useDashboardSummary";
import {
  faCalendarDays,
  faChartSimple,
  faClock,
  faTrophy,
} from "@/lib/fontawesome";

export default function DashboardHome({ onViewChange }) {
  const { error, isLoading, summary } = useDashboardSummary();
  const stats = [
    {
      value: isLoading ? "..." : String(summary.appointmentsToday),
      label: "Citas hoy",
      icon: faCalendarDays,
      tone: "green",
    },
    {
      value: isLoading ? "..." : String(summary.upcomingAppointments),
      label: "Proximas citas",
      icon: faClock,
      tone: "blue",
    },
    {
      value: isLoading ? "..." : String(summary.pendingAppointments),
      label: "Pendientes",
      icon: faTrophy,
      tone: "orange",
    },
    {
      value: isLoading ? "..." : String(summary.monthAppointments),
      label: "Total este mes",
      icon: faChartSimple,
      tone: "purple",
    },
  ];

  return (
    <div className="grid gap-5">
      {error ? (
        <p className="rounded-card border border-line bg-surface px-4 py-3 text-sm font-bold text-danger shadow-card">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(26rem,0.92fr)]">
        <AppointmentsWidget appointments={summary.todayAppointments} />
        <QuickActionsWidget onViewChange={onViewChange} />
      </div>

      <RecentClientsWidget clients={summary.recentClients} />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserCacheKey,
  readLocalCache,
  writeLocalCache,
} from "@/lib/localCache";

const initialSummary = {
  appointmentsToday: 0,
  upcomingAppointments: 0,
  pendingAppointments: 0,
  monthAppointments: 0,
  todayAppointments: [],
  recentClients: [],
  page: null,
};
const summaryCacheTtl = 60 * 1000;

export default function useDashboardSummary() {
  const { supabase, user } = useAuth();
  const [summary, setSummary] = useState(initialSummary);
  const [isLoading, setIsLoading] = useState(Boolean(supabase && user));
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async () => {
    if (!supabase || !user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    const [pageResult, appointmentsResult] = await Promise.all([
      supabase
        .from("professional_pages")
        .select("slug,published,services,availability,updated_at")
        .eq("user_id", user.id)
        .maybeSingle(),
      fetchAppointments(supabase, user.id),
    ]);

    if (pageResult.error) {
      setError(pageResult.error.message);
    }

    if (appointmentsResult.error && !isMissingAppointmentsTable(appointmentsResult.error)) {
      setError(appointmentsResult.error.message);
    }

    const appointments = appointmentsResult.data ?? [];
    const nextSummary = buildSummary({
      appointments,
      page: pageResult.data,
    });

    setSummary(nextSummary);
    writeLocalCache(
      getUserCacheKey(user, "dashboard-summary"),
      nextSummary,
      summaryCacheTtl,
    );
    setIsLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    queueMicrotask(() => {
      if (user) {
        const cachedSummary = readLocalCache(
          getUserCacheKey(user, "dashboard-summary"),
        );

        if (cachedSummary) {
          setSummary(cachedSummary);
          setIsLoading(false);
        }
      }

      fetchSummary();
    });
  }, [fetchSummary, user]);

  return useMemo(
    () => ({
      error,
      isLoading,
      refresh: fetchSummary,
      summary,
    }),
    [error, fetchSummary, isLoading, summary],
  );
}

async function fetchAppointments(supabase, userId) {
  const { data, error } = await supabase
    .from("appointments")
    .select("id,customer_name,service_name,appointment_at,status,created_at")
    .eq("professional_user_id", userId)
    .order("appointment_at", { ascending: true })
    .limit(50);

  if (error) {
    return { data: [], error };
  }

  return { data, error: null };
}

function buildSummary({ appointments, page }) {
  const now = new Date();
  const todayKey = toDateKey(now);
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;

  const todayAppointments = appointments
    .filter((appointment) => toDateKey(new Date(appointment.appointment_at)) === todayKey)
    .map(mapAppointment)
    .slice(0, 4);

  const upcomingAppointments = appointments.filter(
    (appointment) => new Date(appointment.appointment_at) >= now,
  );

  const monthAppointments = appointments.filter((appointment) => {
    const date = new Date(appointment.appointment_at);
    return `${date.getFullYear()}-${date.getMonth()}` === monthKey;
  });

  return {
    appointmentsToday: todayAppointments.length,
    monthAppointments: monthAppointments.length,
    page,
    pendingAppointments: appointments.filter(
      (appointment) => normalizeStatus(appointment.status) === "pendiente",
    ).length,
    recentClients: buildRecentClients(appointments),
    todayAppointments,
    upcomingAppointments: upcomingAppointments.length,
  };
}

function isMissingAppointmentsTable(error) {
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    error.message?.includes("appointments")
  );
}

function buildRecentClients(appointments) {
  const seen = new Set();

  return appointments
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .filter((appointment) => {
      const key = appointment.customer_name || appointment.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 4)
    .map((appointment) => ({
      date: formatDate(appointment.appointment_at),
      initials: getInitials(appointment.customer_name),
      name: appointment.customer_name || "Cliente",
      service: appointment.service_name || "Consulta",
      status:
        normalizeStatus(appointment.status) === "confirmada"
          ? "Recurrente"
          : "Nueva",
    }));
}

function mapAppointment(appointment) {
  return {
    id: appointment.id,
    client: appointment.customer_name || "Cliente",
    service: appointment.service_name || "Consulta",
    status: formatStatus(appointment.status),
    time: new Intl.DateTimeFormat("es", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(appointment.appointment_at)),
  };
}

function normalizeStatus(status) {
  return String(status || "pendiente").toLowerCase();
}

function formatStatus(status) {
  const normalized = normalizeStatus(status);

  return normalized === "confirmada" ? "Confirmada" : "Pendiente";
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

function getInitials(name = "Cliente") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

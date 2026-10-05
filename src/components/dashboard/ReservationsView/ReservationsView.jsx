"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "@/context/AuthContext";
import {
  faCalendarDays,
  faCheck,
  faClock,
  faEnvelope,
  faPhone,
  faUserGroup,
} from "@/lib/fontawesome";

const initialSummary = {
  today: 0,
  pending: 0,
  confirmed: 0,
};

export default function ReservationsView() {
  const { supabase, user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(supabase && user));

  const fetchAppointments = useCallback(async () => {
    if (!supabase || !user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("appointments")
      .select(
        "id,customer_email,customer_name,customer_phone,service_name,appointment_at,status,notes,created_at",
      )
      .eq("professional_user_id", user.id)
      .order("appointment_at", { ascending: true })
      .limit(100);

    if (fetchError) {
      setError(fetchError.message);
      setAppointments([]);
    } else {
      setAppointments(data ?? []);
    }

    setIsLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    queueMicrotask(fetchAppointments);
  }, [fetchAppointments]);

  const summary = useMemo(() => buildSummary(appointments), [appointments]);

  return (
    <div className="grid gap-5">
      {error ? (
        <p className="rounded-card border border-line bg-surface px-4 py-3 text-sm font-bold text-danger shadow-card">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={faCalendarDays}
          label="Reservas de hoy"
          tone="bg-success-soft text-success"
          value={isLoading ? "..." : String(summary.today)}
        />
        <SummaryCard
          icon={faClock}
          label="Pendientes"
          tone="bg-orange-50 text-orange-500"
          value={isLoading ? "..." : String(summary.pending)}
        />
        <SummaryCard
          icon={faUserGroup}
          label="Confirmadas"
          tone="bg-blue-50 text-blue-600"
          value={isLoading ? "..." : String(summary.confirmed)}
        />
      </div>

      <section className="rounded-card border border-line bg-surface p-4 shadow-card">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-foreground">Proximas reservas</h3>
          {isLoading ? (
            <span className="text-sm font-bold text-muted">Cargando...</span>
          ) : null}
        </div>

        {appointments.length ? (
          <div className="overflow-hidden rounded-card border border-line">
            {appointments.map((appointment) => {
              const isPending = normalizeStatus(appointment.status) === "pendiente";

              return (
                <article
                  key={appointment.id}
                  className="grid gap-3 border-b border-line px-4 py-4 text-sm last:border-b-0 lg:grid-cols-[8rem_minmax(12rem,1fr)_minmax(11rem,1fr)_minmax(12rem,1fr)_auto]"
                >
                  <div>
                    <p className="font-bold text-foreground">
                      {formatDate(appointment.appointment_at)}
                    </p>
                    <p className="mt-1 text-xs font-bold text-muted">
                      {formatTime(appointment.appointment_at)}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      {appointment.customer_name || "Cliente"}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-muted">
                      {appointment.service_name || "Consulta"}
                    </p>
                  </div>
                  <div className="grid gap-1 text-sm text-muted">
                    {appointment.customer_phone ? (
                      <p className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faPhone} className="size-3" />
                        {appointment.customer_phone}
                      </p>
                    ) : null}
                    {appointment.customer_email ? (
                      <p className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faEnvelope} className="size-3" />
                        {appointment.customer_email}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-sm leading-5 text-muted">
                    {appointment.notes || "Sin notas adicionales."}
                  </p>
                  <span
                    className={
                      isPending
                        ? "h-fit w-fit rounded-md bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-500"
                        : "inline-flex h-fit w-fit items-center gap-2 rounded-md bg-success-soft px-3 py-1.5 text-xs font-bold text-success"
                    }
                  >
                    {!isPending ? (
                      <FontAwesomeIcon icon={faCheck} className="size-3" />
                    ) : null}
                    {formatStatus(appointment.status)}
                  </span>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-line bg-surface-muted px-4 py-10 text-center">
            <p className="text-sm font-bold text-foreground">
              Todavia no hay reservas
            </p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Cuando un cliente confirme desde tu pagina publica, aparecera aqui.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ icon, label, tone, value }) {
  return (
    <article className="rounded-card border border-line bg-surface p-4 shadow-card">
      <span className={`grid size-10 place-items-center rounded-md ${tone}`}>
        <FontAwesomeIcon icon={icon} className="size-4" />
      </span>
      <p className="mt-4 text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </article>
  );
}

function buildSummary(appointments) {
  const todayKey = toDateKey(new Date());

  return appointments.reduce((summary, appointment) => {
    if (toDateKey(new Date(appointment.appointment_at)) === todayKey) {
      summary.today += 1;
    }

    if (normalizeStatus(appointment.status) === "pendiente") {
      summary.pending += 1;
    }

    if (normalizeStatus(appointment.status) === "confirmada") {
      summary.confirmed += 1;
    }

    return summary;
  }, { ...initialSummary });
}

function normalizeStatus(status) {
  return String(status || "pendiente").toLowerCase();
}

function formatStatus(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "confirmada") return "Confirmada";
  if (normalized === "cancelada") return "Cancelada";
  return "Pendiente";
}

function formatDate(date) {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

function formatTime(date) {
  return new Intl.DateTimeFormat("es", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

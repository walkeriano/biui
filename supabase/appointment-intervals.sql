-- Deploy the compatible application code first, then apply production-hardening.sql
-- and this migration. Old application versions must not write after migration.
-- Transactional: existing overlaps abort the migration; no appointments are deleted.
begin;
create extension if not exists btree_gist with schema extensions;
set local search_path = public, extensions;
lock table public.appointments in access exclusive mode;

alter table public.appointments add column if not exists duration_minutes integer;
alter table public.appointments add column if not exists appointment_end_at timestamptz;

-- Recover the current service duration when possible. Unmatched historical services
-- use 60 minutes and must be reviewed against the original appointment records.
update public.appointments a
set duration_minutes = coalesce((
  select case
    when (s->>'durationMinutes') ~ '^[0-9]{1,4}$'
      and (s->>'durationMinutes')::integer between 1 and 1440
      then (s->>'durationMinutes')::integer
    when (s->>'duration') ~ '^[0-9]{1,4} minutos?$'
      and split_part(s->>'duration', ' ', 1)::integer between 1 and 1440
      then split_part(s->>'duration', ' ', 1)::integer
    else 60 end
  from public.professional_pages p,
       lateral jsonb_array_elements(case when jsonb_typeof(p.services) = 'array' then p.services else '[]'::jsonb end) s
  where p.id = a.professional_page_id and s->>'name' = a.service_name
  limit 1
), 60)
where duration_minutes is null;

update public.appointments
set appointment_end_at = appointment_at + make_interval(mins => duration_minutes)
where appointment_end_at is distinct from appointment_at + make_interval(mins => duration_minutes);

-- Fail with an actionable message instead of silently cancelling existing bookings.
do $$
begin
  if exists (
    select 1 from public.appointments a join public.appointments b
      on a.professional_user_id = b.professional_user_id and a.id < b.id
      and tstzrange(a.appointment_at, a.appointment_end_at, '[)') && tstzrange(b.appointment_at, b.appointment_end_at, '[)')
    where a.status <> 'cancelada' and b.status <> 'cancelada'
  ) then
    raise exception 'Existing active appointments overlap. Review them with appointment-intervals-preflight.sql, resolve the conflicts, then rerun this migration.';
  end if;
end $$;

alter table public.appointments alter column duration_minutes set not null;
alter table public.appointments alter column appointment_end_at set not null;
-- No default: legacy writers fail rather than silently ignoring service duration.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'appointments_duration_check' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_duration_check check (duration_minutes between 1 and 1440);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'appointments_no_overlap' and conrelid = 'public.appointments'::regclass) then
    alter table public.appointments add constraint appointments_no_overlap
      exclude using gist (professional_user_id with =, tstzrange(appointment_at, appointment_end_at, '[)') with &&)
      where (status <> 'cancelada');
  end if;
end $$;

create or replace function public.set_appointment_end()
returns trigger language plpgsql set search_path = public as $$
begin
  new.appointment_end_at := new.appointment_at + make_interval(mins => new.duration_minutes);
  return new;
end;
$$;
drop trigger if exists appointments_set_end on public.appointments;
create trigger appointments_set_end before insert or update on public.appointments
for each row execute function public.set_appointment_end();
commit;

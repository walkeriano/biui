-- Read-only review before migrating. Durations are inferred from current services,
-- not historical snapshots. Review fallback values and changed services manually.
with inferred as (
  select a.id, a.professional_user_id, a.appointment_at, a.status,
    (select case
      when (s->>'durationMinutes') ~ '^[0-9]{1,4}$' and (s->>'durationMinutes')::integer between 1 and 1440 then (s->>'durationMinutes')::integer
      when (s->>'duration') ~ '^[0-9]{1,4} minutos?$' and split_part(s->>'duration', ' ', 1)::integer between 1 and 1440 then split_part(s->>'duration', ' ', 1)::integer
      end from public.professional_pages p,
      lateral jsonb_array_elements(case when jsonb_typeof(p.services) = 'array' then p.services else '[]'::jsonb end) s
      where p.id = a.professional_page_id and s->>'name' = a.service_name limit 1) as service_minutes
  from public.appointments a
), reviewed as (
  select *, coalesce(service_minutes, 60) as inferred_minutes,
    case when service_minutes is null then 'FALLBACK_60_REVIEW_REQUIRED' else 'CURRENT_SERVICE_REVIEW_HISTORY' end as duration_source
  from inferred
)
select a.id, a.professional_user_id, a.appointment_at, a.inferred_minutes, a.duration_source,
       b.id as conflicting_id, b.appointment_at as conflicting_start
from reviewed a left join reviewed b on a.id < b.id
  and a.professional_user_id = b.professional_user_id
  and a.status <> 'cancelada' and b.status <> 'cancelada'
  and tstzrange(a.appointment_at, a.appointment_at + make_interval(mins => a.inferred_minutes), '[)')
      && tstzrange(b.appointment_at, b.appointment_at + make_interval(mins => b.inferred_minutes), '[)')
order by a.professional_user_id, a.appointment_at;

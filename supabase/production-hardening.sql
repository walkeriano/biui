-- Apply in the Supabase SQL editor after reviewing the live verification report.
-- Updates configuration and future writes; does not delete pages, users or files.
begin;

alter table public.professional_pages alter column published set default false;

-- All public reservation creation must go through the validated server API.
drop policy if exists "Customers can create appointments on published pages"
  on public.appointments;
revoke insert on public.appointments from anon, authenticated;

update storage.buckets
set allowed_mime_types = array[
  'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'
], file_size_limit = 5242880
where id = 'profesional-assets';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'professional_pages_slug_check'
      and conrelid = 'public.professional_pages'::regclass
  ) then
    alter table public.professional_pages add constraint professional_pages_slug_check
      check (
        slug ~ '^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$'
        and slug not in ('dashboard', 'acceso', 'api', 'auth', 'restablecer-contrasena', 'robots-txt', 'sitemap-xml', 'favicon-ico')
      ) not valid;
  end if;
end $$;

commit;

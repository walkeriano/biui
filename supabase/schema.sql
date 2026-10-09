create table if not exists public.professional_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  professional jsonb not null default '{}'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  hero jsonb not null default '{}'::jsonb,
  about jsonb not null default '{}'::jsonb,
  services jsonb not null default '[]'::jsonb,
  contact jsonb not null default '{}'::jsonb,
  availability jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists professional_pages_user_id_key
  on public.professional_pages(user_id);

alter table public.professional_pages enable row level security;

drop policy if exists "Public pages are readable when published"
  on public.professional_pages;
drop policy if exists "Professionals can insert their page"
  on public.professional_pages;
drop policy if exists "Professionals can update their page"
  on public.professional_pages;
drop policy if exists "Professionals can delete their page"
  on public.professional_pages;

create policy "Public pages are readable when published"
  on public.professional_pages
  for select
  using (published = true or auth.uid() = user_id);

create policy "Professionals can insert their page"
  on public.professional_pages
  for insert
  with check (auth.uid() = user_id);

create policy "Professionals can update their page"
  on public.professional_pages
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Professionals can delete their page"
  on public.professional_pages
  for delete
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('profesional-assets', 'profesional-assets', true)
on conflict (id) do update
set
  allowed_mime_types = array[
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/webp'
  ],
  file_size_limit = 5242880,
  public = true;

drop policy if exists "Professional assets are publicly readable"
  on storage.objects;
drop policy if exists "Professionals can upload their own assets"
  on storage.objects;
drop policy if exists "Professionals can update their own assets"
  on storage.objects;
drop policy if exists "Professionals can delete their own assets"
  on storage.objects;

create policy "Professional assets are publicly readable"
  on storage.objects
  for select
  using (bucket_id = 'profesional-assets');

create policy "Professionals can upload their own assets"
  on storage.objects
  for insert
  with check (
    bucket_id = 'profesional-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Professionals can update their own assets"
  on storage.objects
  for update
  using (
    bucket_id = 'profesional-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'profesional-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Professionals can delete their own assets"
  on storage.objects
  for delete
  using (
    bucket_id = 'profesional-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  professional_user_id uuid not null references auth.users(id) on delete cascade,
  professional_page_id uuid references public.professional_pages(id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  service_name text,
  appointment_at timestamptz not null,
  status text not null default 'pendiente',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_status_check'
  ) then
    alter table public.appointments
      add constraint appointments_status_check
      check (status in ('pendiente', 'confirmada', 'cancelada'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_customer_name_length_check'
  ) then
    alter table public.appointments
      add constraint appointments_customer_name_length_check
      check (char_length(customer_name) between 1 and 120);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_customer_phone_length_check'
  ) then
    alter table public.appointments
      add constraint appointments_customer_phone_length_check
      check (char_length(customer_phone) between 1 and 40);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_customer_email_length_check'
  ) then
    alter table public.appointments
      add constraint appointments_customer_email_length_check
      check (customer_email is null or char_length(customer_email) <= 254);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_notes_length_check'
  ) then
    alter table public.appointments
      add constraint appointments_notes_length_check
      check (notes is null or char_length(notes) <= 500);
  end if;
end $$;

create index if not exists appointments_professional_user_id_idx
  on public.appointments(professional_user_id);

create index if not exists appointments_appointment_at_idx
  on public.appointments(appointment_at);

create unique index if not exists appointments_active_slot_key
  on public.appointments(professional_user_id, appointment_at)
  where status <> 'cancelada';

alter table public.appointments enable row level security;

drop policy if exists "Customers can create appointments on published pages"
  on public.appointments;
drop policy if exists "Professionals can read their appointments"
  on public.appointments;
drop policy if exists "Professionals can update their appointments"
  on public.appointments;

create policy "Professionals can read their appointments"
  on public.appointments
  for select
  using (auth.uid() = professional_user_id);

create policy "Professionals can update their appointments"
  on public.appointments
  for update
  using (auth.uid() = professional_user_id)
  with check (auth.uid() = professional_user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists professional_pages_set_updated_at
  on public.professional_pages;
create trigger professional_pages_set_updated_at
  before update on public.professional_pages
  for each row
  execute function public.set_updated_at();

drop trigger if exists appointments_set_updated_at
  on public.appointments;
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row
  execute function public.set_updated_at();

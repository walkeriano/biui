insert into storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
values (
  'profesional-assets', 'profesional-assets', true,
  array['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'],
  5242880
)
on conflict (id) do update
set
  allowed_mime_types = array[
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp'
  ],
  file_size_limit = 5242880,
  public = true;

drop policy if exists "Professional assets are publicly readable" on storage.objects;
drop policy if exists "Professionals can upload their own assets" on storage.objects;
drop policy if exists "Professionals can update their own assets" on storage.objects;
drop policy if exists "Professionals can delete their own assets" on storage.objects;

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

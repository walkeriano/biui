insert into storage.buckets (id, name, public)
values ('profesional-assets', 'profesional-assets', true)
on conflict (id) do update set public = true;

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

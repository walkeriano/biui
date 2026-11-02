-- Storage-only hardening for the existing professional images bucket.
-- Preserves visibility, policies, existing objects and public URLs.
-- Safe to reapply; fails explicitly if the expected bucket is absent.
begin;

do $$
begin
  update storage.buckets
  set file_size_limit = 5242880,
      allowed_mime_types = array[
        'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'
      ]
  where id = 'profesional-assets';

  if not found then
    raise exception 'Expected Storage bucket profesional-assets does not exist';
  end if;
end $$;

commit;

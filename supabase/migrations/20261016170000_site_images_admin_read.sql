-- Deleting or replacing a file first has to find it, so administrators also need to read site-images objects.
create policy "Admins read site images list" on storage.objects for select to authenticated
  using (bucket_id = 'site-images' and (select private.is_admin()));

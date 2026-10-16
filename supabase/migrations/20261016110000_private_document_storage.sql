-- Private file storage for passports, tickets, vouchers and receipts.
-- The bucket is NOT public: files can only be read or written by administrators (second-factor session),
-- and are opened through short-lived signed links created by the server.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('client-documents', 'client-documents', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins read client documents" on storage.objects for select to authenticated
  using (bucket_id = 'client-documents' and (select private.is_admin()));
create policy "Admins upload client documents" on storage.objects for insert to authenticated
  with check (bucket_id = 'client-documents' and (select private.is_admin()));
create policy "Admins replace client documents" on storage.objects for update to authenticated
  using (bucket_id = 'client-documents' and (select private.is_admin()))
  with check (bucket_id = 'client-documents' and (select private.is_admin()));
create policy "Admins delete client documents" on storage.objects for delete to authenticated
  using (bucket_id = 'client-documents' and (select private.is_admin()));

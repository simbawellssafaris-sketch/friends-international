-- Website content you can manage from the admin area.
-- Visitors (anon) can read ONLY what is published; drafts and unpublished items are invisible to them.
-- Only administrators (second-factor session) can create, edit, publish or delete.

-- ---------------------------------------------------------------------------
-- Package overrides. The 95 packages stay in the code; this table holds your edits on top of them.
--   draft     = work in progress (never shown to visitors)
--   published = what visitors see (fields you leave empty keep the site's built-in text)
--   listed    = false hides the package from the public site (unpublished)
-- ---------------------------------------------------------------------------
create table public.package_content (
  package_id   text primary key check (char_length(package_id) between 1 and 120),
  listed       boolean not null default true,
  draft        jsonb check (draft is null or (jsonb_typeof(draft) = 'object' and pg_column_size(draft) < 60000)),
  published    jsonb check (published is null or (jsonb_typeof(published) = 'object' and pg_column_size(published) < 60000)),
  published_at timestamptz,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references public.admin_profiles (user_id) on delete set null
);
create index package_content_updated_by_idx on public.package_content (updated_by);

-- Destination descriptions (shown on package pages for that destination)
create table public.destination_content (
  dest            text primary key check (char_length(dest) between 1 and 120),
  draft_about     text check (char_length(draft_about) <= 4000),
  published_about text check (char_length(published_about) <= 4000),
  updated_at      timestamptz not null default now(),
  updated_by      uuid references public.admin_profiles (user_id) on delete set null
);
create index destination_content_updated_by_idx on public.destination_content (updated_by);

create table public.faqs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null check (char_length(question) between 1 and 300),
  answer     text not null check (char_length(answer) between 1 and 3000),
  sort       integer not null default 0,
  status     text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index faqs_public_idx on public.faqs (sort, created_at) where status = 'published';

create table public.testimonials (
  id         uuid primary key default gen_random_uuid(),
  author     text not null check (char_length(author) between 1 and 120),
  detail     text check (char_length(detail) <= 160),
  quote      text not null check (char_length(quote) between 1 and 1500),
  rating     integer check (rating between 1 and 5),
  sort       integer not null default 0,
  status     text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index testimonials_public_idx on public.testimonials (sort, created_at) where status = 'published';

create table public.announcements (
  id         uuid primary key default gen_random_uuid(),
  message    text not null check (char_length(message) between 1 and 240),
  link_url   text check (link_url is null or link_url ~ '^(/|https://)' and char_length(link_url) <= 300),
  link_label text check (char_length(link_label) <= 40),
  starts_at  timestamptz,
  ends_at    timestamptz,
  status     text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_window check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create index announcements_public_idx on public.announcements (created_at desc) where status = 'published';

create trigger faqs_updated before update on public.faqs for each row execute function private.set_updated_at();
create trigger testimonials_updated before update on public.testimonials for each row execute function private.set_updated_at();
create trigger announcements_updated before update on public.announcements for each row execute function private.set_updated_at();
create trigger package_content_updated before update on public.package_content for each row execute function private.set_updated_at();
create trigger destination_content_updated before update on public.destination_content for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Access
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['package_content', 'destination_content', 'faqs', 'testimonials', 'announcements'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy "Administrators only" on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))', t);
  end loop;
end;
$$;

-- Visitors: published rows only, and for the override tables only the published columns (drafts stay private).
grant select (package_id, listed, published) on public.package_content to anon;
create policy "Visitors read package overrides" on public.package_content for select to anon using (true);

grant select (dest, published_about) on public.destination_content to anon;
create policy "Visitors read published destination text" on public.destination_content for select to anon using (published_about is not null);

grant select on public.faqs to anon;
create policy "Visitors read published FAQs" on public.faqs for select to anon using (status = 'published');

grant select (id, author, detail, quote, rating, sort) on public.testimonials to anon;
create policy "Visitors read published testimonials" on public.testimonials for select to anon using (status = 'published');

grant select (id, message, link_url, link_label, starts_at, ends_at) on public.announcements to anon;
create policy "Visitors read live announcements" on public.announcements for select to anon
  using (status = 'published' and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()));

-- ---------------------------------------------------------------------------
-- Public image storage (package pictures). Anyone can view; only administrators can add, replace or delete.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins add site images" on storage.objects for insert to authenticated
  with check (bucket_id = 'site-images' and (select private.is_admin()));
create policy "Admins replace site images" on storage.objects for update to authenticated
  using (bucket_id = 'site-images' and (select private.is_admin())) with check (bucket_id = 'site-images' and (select private.is_admin()));
create policy "Admins delete site images" on storage.objects for delete to authenticated
  using (bucket_id = 'site-images' and (select private.is_admin()));

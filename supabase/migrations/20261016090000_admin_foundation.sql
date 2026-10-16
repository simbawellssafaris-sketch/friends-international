-- Admin foundation: private helper schema, admin profiles, audit log.
-- Admin access is granted explicitly (see supabase/README-admin.md). There is no sign-up trigger:
-- creating an account never makes someone an administrator by itself.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------
-- Administrator profiles
-- ---------------------------------------------------------------------------
create table public.admin_profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null check (email = lower(email)),
  full_name  text check (char_length(full_name) <= 120),
  role       text not null default 'staff' check (role in ('owner', 'staff')),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
comment on table public.admin_profiles is 'People allowed into /admin. Row exists = explicitly authorised administrator.';

alter table public.admin_profiles enable row level security;

-- ---------------------------------------------------------------------------
-- Authorisation helpers (not exposed through the API: they live in the private schema)
-- is_admin()  : active administrator AND signed in with a second factor (aal2)
-- is_owner()  : same, and the owner role
-- ---------------------------------------------------------------------------
create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_profiles p
    where p.user_id = (select auth.uid()) and p.active
  ) and coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2';
$$;

create function private.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_profiles p
    where p.user_id = (select auth.uid()) and p.active and p.role = 'owner'
  ) and coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2';
$$;

revoke execute on function private.is_admin() from public, anon;
revoke execute on function private.is_owner() from public, anon;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_owner() to authenticated;

-- Updates updated_at on any table that has the column.
create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- A signed-in person can read only their own profile (the app uses this to decide if they are an admin
-- before the second factor is completed). Owners can see everyone.
create policy "Read own admin profile"
  on public.admin_profiles for select
  to authenticated
  using (user_id = (select auth.uid()) or (select private.is_owner()));

-- ---------------------------------------------------------------------------
-- Audit log: append only
-- ---------------------------------------------------------------------------
create table public.audit_logs (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  actor_id    uuid references auth.users (id) on delete set null,
  actor_email text,
  action      text not null check (char_length(action) <= 80),
  entity      text check (char_length(entity) <= 80),
  entity_id   text check (char_length(entity_id) <= 80),
  details     jsonb,
  ip          text
);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity, entity_id);
create index audit_logs_actor_idx on public.audit_logs (actor_id);

alter table public.audit_logs enable row level security;

create policy "Admins read audit log"
  on public.audit_logs for select
  to authenticated
  using ((select private.is_admin()));

create policy "Admins write own audit entries"
  on public.audit_logs for insert
  to authenticated
  with check ((select private.is_admin()) and actor_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- API privileges: nothing for anonymous visitors
-- ---------------------------------------------------------------------------
revoke all on public.admin_profiles from anon, authenticated;
revoke all on public.audit_logs from anon, authenticated;
grant select on public.admin_profiles to authenticated;
grant select, insert on public.audit_logs to authenticated;

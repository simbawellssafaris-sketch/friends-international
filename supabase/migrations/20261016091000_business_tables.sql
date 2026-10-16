-- Business tables for the admin dashboard: clients, enquiries, bookings, quotations, invoices, payments.
-- Every table has Row Level Security. Only active administrators who signed in with a second factor (private.is_admin())
-- can read or write. Anonymous visitors have NO access: public forms are saved by a server route using the secret key.

-- ---------------------------------------------------------------------------
-- Reference numbers (ENQ-2026-00001, BKG-..., QUO-..., INV-..., PAY-..., RCT-...)
-- ---------------------------------------------------------------------------
create sequence private.enquiry_seq;
create sequence private.booking_seq;
create sequence private.quotation_seq;
create sequence private.invoice_seq;
create sequence private.payment_seq;
create sequence private.receipt_seq;
grant usage, select on all sequences in schema private to authenticated;

-- ---------------------------------------------------------------------------
-- Lookup tables (configurable)
-- ---------------------------------------------------------------------------
create table public.currencies (
  code   text primary key check (code = upper(code) and char_length(code) = 3),
  name   text not null,
  symbol text not null,
  active boolean not null default true
);
insert into public.currencies (code, name, symbol) values
  ('USD', 'US Dollar', '$'), ('EUR', 'Euro', '€'), ('GBP', 'British Pound', '£'), ('KES', 'Kenyan Shilling', 'KSh');

create table public.booking_statuses (
  code   text primary key check (code ~ '^[a-z_]+$'),
  label  text not null,
  sort   integer not null default 0,
  active boolean not null default true
);
insert into public.booking_statuses (code, label, sort) values
  ('enquiry', 'Enquiry', 10),
  ('quotation_sent', 'Quotation sent', 20),
  ('awaiting_deposit', 'Awaiting deposit', 30),
  ('confirmed', 'Confirmed', 40),
  ('in_preparation', 'In preparation', 50),
  ('in_progress', 'In progress', 60),
  ('completed', 'Completed', 70),
  ('cancelled', 'Cancelled', 80),
  ('refunded', 'Refunded', 90);

-- ---------------------------------------------------------------------------
-- Clients
-- ---------------------------------------------------------------------------
create table public.clients (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null check (char_length(full_name) between 1 and 120),
  email       text check (char_length(email) <= 200),
  phone       text check (char_length(phone) <= 40),
  whatsapp    text check (char_length(whatsapp) <= 40),
  country     text check (char_length(country) <= 80),
  preferences text check (char_length(preferences) <= 2000),
  notes       text check (char_length(notes) <= 4000),
  archived_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint clients_contact_present check (coalesce(btrim(email), '') <> '' or coalesce(btrim(phone), '') <> '' or coalesce(btrim(whatsapp), '') <> '')
);
create unique index clients_email_unique on public.clients (lower(email)) where email is not null and archived_at is null;
create index clients_name_idx on public.clients (lower(full_name));
create index clients_created_at_idx on public.clients (created_at desc);
create trigger clients_updated before update on public.clients for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Enquiries
-- ---------------------------------------------------------------------------
create table public.enquiries (
  id                 uuid primary key default gen_random_uuid(),
  reference          text not null unique default ('ENQ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('private.enquiry_seq')::text, 5, '0')),
  client_id          uuid references public.clients (id) on delete set null,
  -- what the visitor typed (kept even if the client record is later edited)
  full_name          text not null check (char_length(full_name) between 1 and 120),
  email              text check (char_length(email) <= 200),
  phone              text check (char_length(phone) <= 40),
  whatsapp           text check (char_length(whatsapp) <= 40),
  country            text check (char_length(country) <= 80),
  kind               text not null default 'enquiry' check (kind in ('book', 'customize', 'enquiry')),
  channel            text not null default 'form' check (channel in ('whatsapp', 'email', 'form')),
  package_ref        text check (char_length(package_ref) <= 120),
  trip_title         text check (char_length(trip_title) <= 200),
  destination        text check (char_length(destination) <= 200),
  preferred_start    date,
  preferred_end      date,
  adults             integer check (adults between 1 and 50),
  children           integer check (children between 0 and 30),
  child_ages         text check (char_length(child_ages) <= 100),
  accommodation_pref text check (char_length(accommodation_pref) <= 100),
  budget_range       text check (char_length(budget_range) <= 100),
  changes_wanted     text[],
  special_requests   text check (char_length(special_requests) <= 4000),
  source_page        text check (char_length(source_page) <= 500),
  consent            boolean not null default false,
  status             text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'quoted', 'converted', 'lost')),
  lost_reason        text check (char_length(lost_reason) <= 300),
  is_read            boolean not null default false,
  assigned_to        uuid references public.admin_profiles (user_id) on delete set null,
  internal_notes     text check (char_length(internal_notes) <= 4000),
  last_contact_at    timestamptz,
  next_follow_up_at  timestamptz,
  -- duplicate protection: the server fills this with a hash of contact + trip + day; the same value cannot be saved twice
  dedupe_key         text,
  -- email notification tracking
  email_status       text not null default 'pending' check (email_status in ('pending', 'sent', 'failed')),
  email_error        text check (char_length(email_error) <= 500),
  email_attempts     integer not null default 0,
  archived_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint enquiries_contact_present check (coalesce(btrim(email), '') <> '' or coalesce(btrim(phone), '') <> '' or coalesce(btrim(whatsapp), '') <> ''),
  constraint enquiries_dates_order check (preferred_end is null or preferred_start is null or preferred_end >= preferred_start)
);
create unique index enquiries_dedupe_unique on public.enquiries (dedupe_key) where dedupe_key is not null;
create index enquiries_status_idx on public.enquiries (status) where archived_at is null;
create index enquiries_created_at_idx on public.enquiries (created_at desc);
create index enquiries_client_idx on public.enquiries (client_id);
create index enquiries_assigned_idx on public.enquiries (assigned_to);
create index enquiries_follow_up_idx on public.enquiries (next_follow_up_at) where next_follow_up_at is not null;
create index enquiries_email_status_idx on public.enquiries (email_status) where email_status <> 'sent';
create trigger enquiries_updated before update on public.enquiries for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Quotations and line items
-- ---------------------------------------------------------------------------
create table public.quotations (
  id                 uuid primary key default gen_random_uuid(),
  reference          text not null default ('QUO-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('private.quotation_seq')::text, 5, '0')),
  version            integer not null default 1 check (version >= 1),
  parent_id          uuid references public.quotations (id) on delete set null,
  client_id          uuid not null references public.clients (id) on delete restrict,
  enquiry_id         uuid references public.enquiries (id) on delete set null,
  title              text not null check (char_length(title) between 1 and 200),
  status             text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined', 'expired', 'superseded')),
  currency           text not null references public.currencies (code),
  issue_date         date not null default current_date,
  valid_until        date,
  tax_rate           numeric(5, 2) not null default 0 check (tax_rate between 0 and 100),
  subtotal           numeric(14, 2) not null default 0,
  discount_total     numeric(14, 2) not null default 0,
  tax_total          numeric(14, 2) not null default 0,
  total              numeric(14, 2) not null default 0,
  inclusions         text check (char_length(inclusions) <= 6000),
  exclusions         text check (char_length(exclusions) <= 6000),
  payment_terms      text check (char_length(payment_terms) <= 3000),
  cancellation_terms text check (char_length(cancellation_terms) <= 3000),
  notes              text check (char_length(notes) <= 3000),
  sent_at            timestamptz,
  accepted_at        timestamptz,
  created_by         uuid references public.admin_profiles (user_id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (reference, version)
);
create index quotations_client_idx on public.quotations (client_id);
create index quotations_enquiry_idx on public.quotations (enquiry_id);
create index quotations_parent_idx on public.quotations (parent_id);
create index quotations_status_idx on public.quotations (status);
create index quotations_created_by_idx on public.quotations (created_by);

create table public.quotation_items (
  id            uuid primary key default gen_random_uuid(),
  quotation_id  uuid not null references public.quotations (id) on delete cascade,
  category      text not null default 'other' check (category in ('accommodation', 'transport', 'activity', 'park_fee', 'flight', 'transfer', 'other')),
  description   text not null check (char_length(description) between 1 and 500),
  quantity      numeric(10, 2) not null default 1 check (quantity > 0),
  unit_price    numeric(14, 2) not null default 0 check (unit_price >= 0),
  discount_pct  numeric(5, 2) not null default 0 check (discount_pct between 0 and 100),
  sort          integer not null default 0
);
create index quotation_items_quotation_idx on public.quotation_items (quotation_id, sort);

-- Totals are always calculated by the database, never trusted from the browser.
create function private.quotation_totals()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  s numeric;
  d numeric;
begin
  select coalesce(sum(quantity * unit_price), 0), coalesce(sum(quantity * unit_price * discount_pct / 100), 0)
    into s, d
    from public.quotation_items where quotation_id = new.id;
  new.subtotal := round(s, 2);
  new.discount_total := round(d, 2);
  new.tax_total := round((s - d) * new.tax_rate / 100, 2);
  new.total := new.subtotal - new.discount_total + new.tax_total;
  new.updated_at := now();
  return new;
end;
$$;
create trigger quotations_totals before insert or update on public.quotations for each row execute function private.quotation_totals();

create function private.touch_quotation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.quotations set updated_at = now() where id = coalesce(new.quotation_id, old.quotation_id);
  return null;
end;
$$;
create trigger quotation_items_touch after insert or update or delete on public.quotation_items for each row execute function private.touch_quotation();

-- ---------------------------------------------------------------------------
-- Bookings
-- ---------------------------------------------------------------------------
create table public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  reference           text not null unique default ('BKG-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('private.booking_seq')::text, 5, '0')),
  client_id           uuid not null references public.clients (id) on delete restrict,
  enquiry_id          uuid references public.enquiries (id) on delete set null,
  quotation_id        uuid references public.quotations (id) on delete set null,
  title               text not null check (char_length(title) between 1 and 200),
  package_ref         text check (char_length(package_ref) <= 120),
  destination         text check (char_length(destination) <= 200),
  start_date          date,
  end_date            date,
  adults              integer not null default 1 check (adults between 1 and 50),
  children            integer not null default 0 check (children between 0 and 30),
  accommodation       text check (char_length(accommodation) <= 2000),
  transport           text check (char_length(transport) <= 2000),
  guide_or_supplier   text check (char_length(guide_or_supplier) <= 300),
  status              text not null default 'enquiry' references public.booking_statuses (code),
  currency            text not null references public.currencies (code),
  quoted_total        numeric(14, 2) check (quoted_total >= 0),
  agreed_total        numeric(14, 2) check (agreed_total >= 0),
  deposit_required    numeric(14, 2) not null default 0 check (deposit_required >= 0),
  payment_deadline    date,
  notes               text check (char_length(notes) <= 4000),
  created_by          uuid references public.admin_profiles (user_id) on delete set null,
  archived_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint bookings_dates_order check (end_date is null or start_date is null or end_date >= start_date)
);
create index bookings_client_idx on public.bookings (client_id);
create index bookings_enquiry_idx on public.bookings (enquiry_id);
create index bookings_quotation_idx on public.bookings (quotation_id);
create index bookings_status_idx on public.bookings (status) where archived_at is null;
create index bookings_start_date_idx on public.bookings (start_date);
create index bookings_created_by_idx on public.bookings (created_by);
create trigger bookings_updated before update on public.bookings for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Invoices
-- ---------------------------------------------------------------------------
create table public.invoices (
  id         uuid primary key default gen_random_uuid(),
  reference  text not null unique default ('INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('private.invoice_seq')::text, 5, '0')),
  booking_id uuid not null references public.bookings (id) on delete restrict,
  client_id  uuid not null references public.clients (id) on delete restrict,
  status     text not null default 'draft' check (status in ('draft', 'issued', 'part_paid', 'paid', 'void')),
  currency   text not null references public.currencies (code),
  issue_date date not null default current_date,
  due_date   date,
  total      numeric(14, 2) not null default 0 check (total >= 0),
  notes      text check (char_length(notes) <= 3000),
  created_by uuid references public.admin_profiles (user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index invoices_booking_idx on public.invoices (booking_id);
create index invoices_client_idx on public.invoices (client_id);
create index invoices_created_by_idx on public.invoices (created_by);
create trigger invoices_updated before update on public.invoices for each row execute function private.set_updated_at();

create table public.invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references public.invoices (id) on delete cascade,
  description text not null check (char_length(description) between 1 and 500),
  quantity    numeric(10, 2) not null default 1 check (quantity > 0),
  unit_price  numeric(14, 2) not null default 0 check (unit_price >= 0),
  sort        integer not null default 0
);
create index invoice_items_invoice_idx on public.invoice_items (invoice_id, sort);

-- ---------------------------------------------------------------------------
-- Payments (manual recording first; a payment provider can be added later)
-- Only status = 'confirmed' payments count towards the amount paid.
-- ---------------------------------------------------------------------------
create table public.payments (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null unique default ('PAY-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('private.payment_seq')::text, 5, '0')),
  booking_id      uuid not null references public.bookings (id) on delete restrict,
  client_id       uuid not null references public.clients (id) on delete restrict,
  invoice_id      uuid references public.invoices (id) on delete set null,
  amount          numeric(14, 2) not null check (amount > 0),
  currency        text not null references public.currencies (code),
  method          text not null check (method in ('bank_transfer', 'mobile_money', 'card', 'cash', 'cheque', 'other')),
  status          text not null default 'confirmed' check (status in ('pending', 'confirmed', 'failed', 'refunded')),
  paid_at         date not null default current_date,
  external_ref    text check (char_length(external_ref) <= 120),
  provider        text check (char_length(provider) <= 60),
  provider_txn_id text check (char_length(provider_txn_id) <= 120),
  document_path   text check (char_length(document_path) <= 300),
  notes           text check (char_length(notes) <= 2000),
  recorded_by     uuid references public.admin_profiles (user_id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
-- The same bank reference cannot be recorded twice for one booking; one provider transaction can be saved only once.
create unique index payments_external_ref_unique on public.payments (booking_id, lower(external_ref)) where external_ref is not null;
create unique index payments_provider_txn_unique on public.payments (provider, provider_txn_id) where provider_txn_id is not null;
create index payments_booking_idx on public.payments (booking_id);
create index payments_client_idx on public.payments (client_id);
create index payments_invoice_idx on public.payments (invoice_id);
create index payments_recorded_by_idx on public.payments (recorded_by);
create index payments_paid_at_idx on public.payments (paid_at desc);
create trigger payments_updated before update on public.payments for each row execute function private.set_updated_at();

-- A payment must be in the same currency as its booking, and belong to that booking's client.
create function private.check_payment()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  b public.bookings%rowtype;
begin
  select * into b from public.bookings where id = new.booking_id;
  if b.id is null then
    raise exception 'Booking not found';
  end if;
  if new.currency <> b.currency then
    raise exception 'Payment currency (%) must match the booking currency (%)', new.currency, b.currency;
  end if;
  new.client_id := b.client_id;
  return new;
end;
$$;
create trigger payments_check before insert or update on public.payments for each row execute function private.check_payment();

create table public.receipts (
  id         uuid primary key default gen_random_uuid(),
  reference  text not null unique default ('RCT-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('private.receipt_seq')::text, 5, '0')),
  payment_id uuid not null unique references public.payments (id) on delete restrict,
  issued_at  timestamptz not null default now(),
  issued_by  uuid references public.admin_profiles (user_id) on delete set null
);
create index receipts_issued_by_idx on public.receipts (issued_by);

-- Money summary per booking. security_invoker so the view obeys the same Row Level Security as the tables.
create view public.booking_financials with (security_invoker = true) as
select
  b.id as booking_id,
  b.currency,
  coalesce(b.agreed_total, b.quoted_total, 0) as total_value,
  coalesce(sum(p.amount) filter (where p.status = 'confirmed'), 0) as amount_paid,
  coalesce(b.agreed_total, b.quoted_total, 0) - coalesce(sum(p.amount) filter (where p.status = 'confirmed'), 0) as balance
from public.bookings b
left join public.payments p on p.booking_id = b.id
group by b.id;

-- ---------------------------------------------------------------------------
-- Activity (notes and communication history), follow-up reminders, documents
-- ---------------------------------------------------------------------------
create table public.activities (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references public.clients (id) on delete cascade,
  enquiry_id  uuid references public.enquiries (id) on delete cascade,
  booking_id  uuid references public.bookings (id) on delete cascade,
  kind        text not null default 'note' check (kind in ('note', 'call', 'email', 'whatsapp', 'meeting', 'status_change', 'system')),
  body        text not null check (char_length(body) between 1 and 4000),
  created_by  uuid references public.admin_profiles (user_id) on delete set null,
  created_at  timestamptz not null default now(),
  constraint activities_has_parent check (client_id is not null or enquiry_id is not null or booking_id is not null)
);
create index activities_client_idx on public.activities (client_id, created_at desc);
create index activities_enquiry_idx on public.activities (enquiry_id, created_at desc);
create index activities_booking_idx on public.activities (booking_id, created_at desc);
create index activities_created_by_idx on public.activities (created_by);

create table public.follow_ups (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references public.clients (id) on delete cascade,
  enquiry_id  uuid references public.enquiries (id) on delete cascade,
  booking_id  uuid references public.bookings (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  due_at      timestamptz not null,
  done_at     timestamptz,
  assigned_to uuid references public.admin_profiles (user_id) on delete set null,
  created_at  timestamptz not null default now()
);
create index follow_ups_due_idx on public.follow_ups (due_at) where done_at is null;
create index follow_ups_client_idx on public.follow_ups (client_id);
create index follow_ups_enquiry_idx on public.follow_ups (enquiry_id);
create index follow_ups_booking_idx on public.follow_ups (booking_id);
create index follow_ups_assigned_idx on public.follow_ups (assigned_to);

create table public.documents (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references public.clients (id) on delete cascade,
  booking_id   uuid references public.bookings (id) on delete cascade,
  kind         text not null default 'other' check (kind in ('passport', 'visa', 'ticket', 'voucher', 'receipt', 'quotation', 'other')),
  filename     text not null check (char_length(filename) <= 200),
  storage_path text not null check (char_length(storage_path) <= 300),
  sensitive    boolean not null default true,
  uploaded_by  uuid references public.admin_profiles (user_id) on delete set null,
  created_at   timestamptz not null default now(),
  constraint documents_has_parent check (client_id is not null or booking_id is not null)
);
create index documents_client_idx on public.documents (client_id);
create index documents_booking_idx on public.documents (booking_id);
create index documents_uploaded_by_idx on public.documents (uploaded_by);

-- ---------------------------------------------------------------------------
-- Row Level Security: administrators only
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'currencies', 'booking_statuses', 'clients', 'enquiries', 'quotations', 'quotation_items', 'bookings',
    'invoices', 'invoice_items', 'payments', 'receipts', 'activities', 'follow_ups', 'documents'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format(
      'create policy "Administrators only" on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',
      t
    );
  end loop;
end;
$$;

revoke all on public.booking_financials from anon, authenticated;
grant select on public.booking_financials to authenticated;

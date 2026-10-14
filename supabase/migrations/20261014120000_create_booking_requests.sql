-- Form submissions from the website: booking requests, customise requests and homepage enquiries.
-- No sign-in: every visitor may submit (INSERT only). Nobody can read, change or delete rows through the public API.
-- Requests are read in the Supabase dashboard (Table Editor) or later through a signed-in admin area.

create table public.booking_requests (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  status        text not null default 'new',
  kind          text not null check (kind in ('book', 'customize', 'enquiry')),
  channel       text not null check (channel in ('whatsapp', 'email', 'form')),
  trip          text check (char_length(trip) <= 200),
  name          text not null check (char_length(name) between 1 and 120),
  phone         text check (char_length(phone) <= 40),
  email         text check (char_length(email) <= 200),
  travel_date   date,
  adults        integer check (adults between 1 and 50),
  children      integer check (children between 0 and 30),
  travel_level  text check (char_length(travel_level) <= 40),
  child_ages    text check (char_length(child_ages) <= 100),
  changes       text[],
  details       text check (char_length(details) <= 2000),
  notes         text check (char_length(notes) <= 2000),
  page_url      text check (char_length(page_url) <= 500),
  -- the form already asks for a phone number or an email; keep the database consistent with that
  constraint booking_requests_contact_present check (
    coalesce(btrim(phone), '') <> '' or coalesce(btrim(email), '') <> ''
  )
);

comment on table public.booking_requests is 'Website form submissions (book, customise, enquiry). Public insert only.';

create index booking_requests_created_at_idx on public.booking_requests (created_at desc);

alter table public.booking_requests enable row level security;

-- Anyone (anonymous visitors included) can submit a new request, and only as a "new" request.
create policy "Anyone can submit a request"
  on public.booking_requests
  for insert
  to anon, authenticated
  with check (status = 'new');

-- The Data API only exposes what is granted: insert is allowed, reading and changing is not.
revoke all on public.booking_requests from anon, authenticated;
grant insert on public.booking_requests to anon, authenticated;

-- Visitors need the creation time only to sort published items; it is not sensitive.
grant select (created_at) on public.testimonials to anon;
grant select (created_at) on public.announcements to anon;

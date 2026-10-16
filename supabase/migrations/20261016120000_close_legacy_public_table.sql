-- Public forms are now saved by the server (/api/enquiry, secret key) into public.enquiries.
-- The old browser-side table booking_requests no longer needs to accept anonymous inserts, so close it completely.
-- (It held no data. The table itself is kept for now and can be dropped later.)

drop policy if exists "Anyone can submit a request" on public.booking_requests;
revoke all on public.booking_requests from anon, authenticated;

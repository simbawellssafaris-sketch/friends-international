-- One call that returns every figure on the dashboard, calculated from the real tables.
-- SECURITY INVOKER: it runs with the signed-in administrator's permissions, so Row Level Security still applies,
-- and it refuses to run for anyone who is not an administrator with a second-factor session.
--
-- Money is never added across currencies: every amount is grouped by currency.
-- "Confirmed" bookings = confirmed, in_preparation, in_progress, completed. Cancelled / refunded never count.

create or replace function public.admin_dashboard(p_from date, p_to date, p_bucket text default 'month')
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  tz       constant text := 'Africa/Nairobi';
  v_from   timestamptz := (p_from::timestamp at time zone tz);
  v_to     timestamptz := ((p_to + 1)::timestamp at time zone tz);
  v_conf   constant text[] := array['confirmed', 'in_preparation', 'in_progress', 'completed'];
  v_bucket text := case when p_bucket in ('day', 'week', 'month') then p_bucket else 'month' end;
  res      jsonb;
begin
  if not (select private.is_admin()) then
    raise exception 'not authorised' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'range', jsonb_build_object('from', p_from, 'to', p_to, 'bucket', v_bucket),

    -- headline counts
    'enquiries_new',     (select count(*) from public.enquiries where status = 'new' and archived_at is null),
    'enquiries_unread',  (select count(*) from public.enquiries where not is_read and archived_at is null),
    'enquiries_in_range',(select count(*) from public.enquiries where created_at >= v_from and created_at < v_to),
    'pending_quotations',(select count(*) from public.quotations where status in ('draft', 'sent')),
    'confirmed_bookings',(select count(*) from public.bookings
                           where archived_at is null and status = any (v_conf) and created_at >= v_from and created_at < v_to),
    'upcoming_trips',    (select count(*) from public.bookings
                           where archived_at is null and status in ('confirmed', 'in_preparation') and start_date >= current_date),
    'pending_payments',  (select count(*) from public.bookings b join public.booking_financials f on f.booking_id = b.id
                           where b.archived_at is null and b.status in ('awaiting_deposit', 'confirmed', 'in_preparation', 'in_progress') and f.balance > 0),
    'unconfirmed_payments', (select count(*) from public.payments where status = 'pending'),

    -- money, always grouped by currency
    'booked_value', coalesce((
      select jsonb_object_agg(currency, v) from (
        select currency, sum(coalesce(agreed_total, quoted_total, 0)) v from public.bookings
        where archived_at is null and status = any (v_conf) and created_at >= v_from and created_at < v_to
        group by currency) x), '{}'::jsonb),
    'collected', coalesce((
      select jsonb_object_agg(currency, v) from (
        select currency, sum(amount) v from public.payments
        where status = 'confirmed' and paid_at >= p_from and paid_at <= p_to
        group by currency) x), '{}'::jsonb),
    'outstanding', coalesce((
      select jsonb_object_agg(currency, v) from (
        select f.currency, sum(f.balance) v from public.booking_financials f join public.bookings b on b.id = f.booking_id
        where b.archived_at is null and b.status = any (v_conf) and f.balance > 0
        group by f.currency) x), '{}'::jsonb),
    'quoted_pipeline', coalesce((
      select jsonb_object_agg(currency, v) from (
        select currency, sum(total) v from public.quotations where status = 'sent' group by currency) x), '{}'::jsonb),

    -- trend over the chosen range
    'trend', coalesce((
      select jsonb_agg(jsonb_build_object(
        'period', to_char(g, 'YYYY-MM-DD'),
        'enquiries', (select count(*) from public.enquiries e
                       where date_trunc(v_bucket, e.created_at at time zone tz) = g),
        'bookings', (select count(*) from public.bookings b
                      where b.archived_at is null and b.status = any (v_conf) and date_trunc(v_bucket, b.created_at at time zone tz) = g),
        'booked', coalesce((select jsonb_object_agg(currency, s) from (
                     select b.currency, sum(coalesce(b.agreed_total, b.quoted_total, 0)) s from public.bookings b
                     where b.archived_at is null and b.status = any (v_conf) and date_trunc(v_bucket, b.created_at at time zone tz) = g
                     group by b.currency) q), '{}'::jsonb),
        'collected', coalesce((select jsonb_object_agg(currency, s) from (
                     select p.currency, sum(p.amount) s from public.payments p
                     where p.status = 'confirmed' and date_trunc(v_bucket, p.paid_at::timestamp) = g
                     group by p.currency) q), '{}'::jsonb)
      ) order by g)
      from generate_series(date_trunc(v_bucket, p_from::timestamp), date_trunc(v_bucket, p_to::timestamp), ('1 ' || v_bucket)::interval) g
    ), '[]'::jsonb),

    -- lists
    'recent_enquiries', coalesce((
      select jsonb_agg(to_jsonb(r)) from (
        select id, reference, full_name, trip_title, destination, status, is_read, created_at
        from public.enquiries where archived_at is null order by created_at desc limit 8) r), '[]'::jsonb),

    'upcoming_departures', coalesce((
      select jsonb_agg(to_jsonb(r)) from (
        select b.id, b.reference, b.title, b.destination, b.start_date, b.end_date, b.adults, b.children, b.status, c.full_name as client_name
        from public.bookings b join public.clients c on c.id = b.client_id
        where b.archived_at is null and b.status in ('confirmed', 'in_preparation', 'in_progress') and b.start_date >= current_date
        order by b.start_date asc limit 8) r), '[]'::jsonb),

    'recent_activity', coalesce((
      select jsonb_agg(to_jsonb(r)) from (
        select * from (
          select 'booking'::text as kind, b.id::text as id, b.reference, b.title as label, b.status as detail, null::numeric as amount, b.currency, b.updated_at as at
          from public.bookings b
          union all
          select 'payment', p.id::text, p.reference, c.full_name, p.status, p.amount, p.currency, p.created_at
          from public.payments p join public.clients c on c.id = p.client_id
        ) a order by at desc limit 10) r), '[]'::jsonb),

    'follow_ups', coalesce((
      select jsonb_agg(to_jsonb(r)) from (
        select * from (
          select 'reminder'::text as source, f.id::text as id, f.title, f.due_at, null::text as reference, null::text as enquiry_id
          from public.follow_ups f where f.done_at is null
          union all
          select 'enquiry', e.id::text, 'Follow up: ' || e.full_name, e.next_follow_up_at, e.reference, e.id::text
          from public.enquiries e
          where e.next_follow_up_at is not null and e.archived_at is null and e.status not in ('converted', 'lost')
        ) a order by due_at asc limit 8) r), '[]'::jsonb)
  ) into res;

  return res;
end;
$$;

revoke execute on function public.admin_dashboard(date, date, text) from public, anon;
grant execute on function public.admin_dashboard(date, date, text) to authenticated;

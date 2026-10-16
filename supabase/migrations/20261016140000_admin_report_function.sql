-- Business report for a date range. SECURITY INVOKER (Row Level Security applies; administrators with a second factor only).
-- Money is grouped by currency and never added across currencies.
--   confirmed value  = value of bookings that are confirmed / in preparation / in progress / completed (created in the range)
--   money collected  = confirmed payments received in the range
--   outstanding      = balance still owed on those bookings today
--   quoted value     = quotations sent in the range (not a promise of revenue)
-- Profit is NOT calculated: no supplier or cost data is recorded, so any profit figure would be invented.

create or replace function public.admin_report(p_from date, p_to date)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  tz     constant text := 'Africa/Nairobi';
  v_from timestamptz := (p_from::timestamp at time zone tz);
  v_to   timestamptz := ((p_to + 1)::timestamp at time zone tz);
  v_conf constant text[] := array['confirmed', 'in_preparation', 'in_progress', 'completed'];
  res    jsonb;
begin
  if not (select private.is_admin()) then
    raise exception 'not authorised' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'range', jsonb_build_object('from', p_from, 'to', p_to),

    'enquiries', jsonb_build_object(
      'total',     (select count(*) from public.enquiries where created_at >= v_from and created_at < v_to),
      'converted', (select count(*) from public.enquiries where created_at >= v_from and created_at < v_to and status = 'converted'),
      'lost',      (select count(*) from public.enquiries where created_at >= v_from and created_at < v_to and status = 'lost'),
      'open',      (select count(*) from public.enquiries where created_at >= v_from and created_at < v_to and status not in ('converted', 'lost'))
    ),

    'enquiries_by_month', coalesce((
      select jsonb_agg(jsonb_build_object('month', to_char(m, 'YYYY-MM'), 'total', t, 'converted', c, 'lost', l) order by m)
      from (
        select date_trunc('month', e.created_at at time zone tz) as m, count(*) as t,
               count(*) filter (where e.status = 'converted') as c, count(*) filter (where e.status = 'lost') as l
        from public.enquiries e where e.created_at >= v_from and e.created_at < v_to group by 1) x), '[]'::jsonb),

    'bookings_by_destination', coalesce((
      select jsonb_agg(jsonb_build_object('name', name, 'bookings', n::int, 'value', val) order by n desc, name)
      from (
        select name, sum(cnt) as n, jsonb_object_agg(cur, s) as val
        from (
          select coalesce(nullif(btrim(b.destination), ''), 'Not set') as name, b.currency as cur, count(*) as cnt, sum(coalesce(b.agreed_total, b.quoted_total, 0)) as s
          from public.bookings b
          where b.archived_at is null and b.status = any (v_conf) and b.created_at >= v_from and b.created_at < v_to
          group by 1, 2) g
        group by name) y), '[]'::jsonb),

    'bookings_by_package', coalesce((
      select jsonb_agg(jsonb_build_object('name', name, 'bookings', n::int, 'value', val) order by n desc, name)
      from (
        select name, sum(cnt) as n, jsonb_object_agg(cur, s) as val
        from (
          select b.title as name, b.currency as cur, count(*) as cnt, sum(coalesce(b.agreed_total, b.quoted_total, 0)) as s
          from public.bookings b
          where b.archived_at is null and b.status = any (v_conf) and b.created_at >= v_from and b.created_at < v_to
          group by 1, 2) g
        group by name) y), '[]'::jsonb),

    'confirmed_value', coalesce((select jsonb_object_agg(currency, v) from (
        select currency, sum(coalesce(agreed_total, quoted_total, 0)) v from public.bookings
        where archived_at is null and status = any (v_conf) and created_at >= v_from and created_at < v_to group by currency) x), '{}'::jsonb),
    'collected', coalesce((select jsonb_object_agg(currency, v) from (
        select currency, sum(amount) v from public.payments
        where status = 'confirmed' and paid_at >= p_from and paid_at <= p_to group by currency) x), '{}'::jsonb),
    'outstanding', coalesce((select jsonb_object_agg(currency, v) from (
        select f.currency, sum(f.balance) v from public.booking_financials f join public.bookings b on b.id = f.booking_id
        where b.archived_at is null and b.status = any (v_conf) and f.balance > 0 group by f.currency) x), '{}'::jsonb),
    'quoted_value', coalesce((select jsonb_object_agg(currency, v) from (
        select currency, sum(total) v from public.quotations
        where sent_at >= v_from and sent_at < v_to and status <> 'superseded' group by currency) x), '{}'::jsonb),

    'upcoming_departures', coalesce((
      select jsonb_agg(to_jsonb(r)) from (
        select b.reference, b.title, b.destination, b.start_date, b.end_date, b.adults, b.children, b.status, c.full_name as client_name
        from public.bookings b join public.clients c on c.id = b.client_id
        where b.archived_at is null and b.status = any (v_conf) and b.start_date >= current_date
        order by b.start_date, b.reference limit 50) r), '[]'::jsonb),

    'lost_reasons', coalesce((
      select jsonb_agg(jsonb_build_object('reason', reason, 'count', n) order by n desc, reason)
      from (
        select coalesce(nullif(btrim(lost_reason), ''), 'No reason recorded') as reason, count(*) as n
        from public.enquiries where status = 'lost' and created_at >= v_from and created_at < v_to group by 1) x), '[]'::jsonb)
  ) into res;
  return res;
end;
$$;

revoke execute on function public.admin_report(date, date) from public, anon;
grant execute on function public.admin_report(date, date) to authenticated;

import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { RANGES, resolveRange, loadDashboard } from "@/lib/admin/dashboard";
import { moneyEntries, money, fmtDate, fmtDateTime, timeAgo, daysUntil, statusLabel } from "@/lib/admin/format";
import BarChart from "../_components/BarChart";

export const metadata = { title: "Dashboard" };

const S1 = "#2f8a62"; // brand green (checked for colour-blind separation)
const S2 = "#d9912b"; // brand gold

const periodLabel = (iso, bucket) => {
  const d = new Date(`${iso}T12:00:00Z`);
  return bucket === "month"
    ? d.toLocaleDateString("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" })
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
};

function Money({ obj, empty = "None yet" }) {
  const rows = moneyEntries(obj);
  if (!rows.length) return <span className="kpi-v kpi-none">{empty}</span>;
  return (
    <span className="kpi-money">
      {rows.map(([c, v]) => (<span key={c} className="kpi-v">{money(v, c)}</span>))}
    </span>
  );
}

function Kpi({ label, value, hint, children }) {
  return (
    <div className="kpi">
      <span className="kpi-l">{label}</span>
      {children ?? <span className="kpi-v">{Number(value).toLocaleString("en-US")}</span>}
      {hint ? <span className="kpi-h">{hint}</span> : null}
    </div>
  );
}

const Badge = ({ s }) => <span className={`adm-badge ab-${s}`}>{statusLabel(s)}</span>;

export default async function Dashboard({ searchParams }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const range = resolveRange(sp);
  const d = await loadDashboard(s, range);

  // Revenue chart: one currency at a time (amounts in different currencies are never added together).
  const currencies = [...new Set([...Object.keys(d.booked_value), ...Object.keys(d.collected), ...d.trend.flatMap((t) => [...Object.keys(t.booked), ...Object.keys(t.collected)])])];
  // Default to USD (the main selling currency) when it has data; amounts in different currencies cannot be compared by size.
  const cur = typeof sp.cur === "string" && currencies.includes(sp.cur) ? sp.cur : currencies.includes("USD") ? "USD" : currencies[0] || "USD";

  const activityRows = d.trend.map((t) => ({ label: periodLabel(t.period, range.bucket), enquiries: t.enquiries, bookings: t.bookings }));
  const revenueRows = d.trend.map((t) => ({ label: periodLabel(t.period, range.bucket), booked: Number(t.booked[cur] || 0), collected: Number(t.collected[cur] || 0) }));
  const hrefFor = (extra) => {
    const q = new URLSearchParams({ range: range.key, ...(range.key === "custom" ? { from: range.from, to: range.to } : {}), ...extra });
    return `/admin?${q.toString()}`;
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Dashboard</h1>
          <p>{s.profile.full_name ? `Welcome back, ${s.profile.full_name}. ` : ""}Showing {fmtDate(range.from)} to {fmtDate(range.to)}.</p>
        </div>
        <div className="adm-filters">
          <div className="adm-chips" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <Link key={r.key} href={`/admin?range=${r.key}`} className={`adm-chip${range.key === r.key ? " on" : ""}`} aria-current={range.key === r.key ? "true" : undefined}>{r.label}</Link>
            ))}
          </div>
          <form className="range-form" action="/admin" method="get">
            <input type="hidden" name="range" value="custom" />
            <label><span>From</span><input type="date" name="from" defaultValue={range.from} required /></label>
            <label><span>To</span><input type="date" name="to" defaultValue={range.to} required /></label>
            <button className={`adm-chip${range.key === "custom" ? " on" : ""}`}>Apply</button>
          </form>
        </div>
      </div>

      <section aria-label="Enquiries and bookings" className="kpi-grid">
        <Kpi label="New enquiries" value={d.enquiries_new} hint={`${d.enquiries_in_range.toLocaleString("en-US")} received in this period`} />
        <Kpi label="Unread enquiries" value={d.enquiries_unread} hint="Not opened yet" />
        <Kpi label="Pending quotations" value={d.pending_quotations} hint="Draft or sent, no answer yet" />
        <Kpi label="Confirmed bookings" value={d.confirmed_bookings} hint="Created in this period" />
        <Kpi label="Upcoming trips" value={d.upcoming_trips} hint="Confirmed, not yet started" />
        <Kpi label="Pending payments" value={d.pending_payments} hint={d.unconfirmed_payments ? `Plus ${d.unconfirmed_payments} payment(s) awaiting confirmation` : "Bookings with a balance due"} />
      </section>

      <section aria-label="Money" className="kpi-grid money">
        <Kpi label="Confirmed booking value" hint="Value of confirmed bookings in this period. This is not profit."><Money obj={d.booked_value} /></Kpi>
        <Kpi label="Payments received" hint="Confirmed payments in this period"><Money obj={d.collected} /></Kpi>
        <Kpi label="Outstanding balances" hint="Still owed on confirmed bookings, as of today"><Money obj={d.outstanding} empty="Nothing owed" /></Kpi>
        <Kpi label="Quoted, awaiting reply" hint="Sent quotations not yet accepted"><Money obj={d.quoted_pipeline} /></Kpi>
      </section>

      <div className="adm-two">
        <div className="adm-card">
          <BarChart
            title="Enquiries and confirmed bookings"
            series={[{ key: "enquiries", label: "Enquiries", color: S1 }, { key: "bookings", label: "Confirmed bookings", color: S2 }]}
            rows={activityRows}
            empty="No enquiries or bookings in this period yet."
          />
        </div>
        <div className="adm-card">
          {currencies.length > 1 ? (
            <div className="adm-chips adm-cur" role="group" aria-label="Currency">
              {currencies.map((c) => (<Link key={c} href={hrefFor({ cur: c })} className={`adm-chip${c === cur ? " on" : ""}`}>{c}</Link>))}
            </div>
          ) : null}
          <BarChart
            title={`Revenue in ${cur}`}
            currency={cur}
            series={[{ key: "booked", label: "Confirmed booking value", color: S1 }, { key: "collected", label: "Payments received", color: S2 }]}
            rows={revenueRows}
            empty="No confirmed bookings or payments in this period yet."
          />
        </div>
      </div>

      <div className="adm-two">
        <div className="adm-card">
          <h2>Recent enquiries</h2>
          {d.recent_enquiries.length === 0 ? <p className="adm-empty">No enquiries yet. They appear here as soon as someone submits a form on your website.</p> : (
            <ul className="rows">
              {d.recent_enquiries.map((e) => (
                <li key={e.id}>
                  <div><b>{e.full_name}</b>{!e.is_read ? <span className="dot" title="Unread" aria-label="Unread" /> : null}<small>{e.trip_title || e.destination || "General enquiry"} · {e.reference}</small></div>
                  <div className="r"><Badge s={e.status} /><small>{timeAgo(e.created_at)}</small></div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="adm-card">
          <h2>Upcoming departures</h2>
          {d.upcoming_departures.length === 0 ? <p className="adm-empty">No confirmed trips are scheduled.</p> : (
            <ul className="rows">
              {d.upcoming_departures.map((b) => {
                const n = daysUntil(b.start_date);
                return (
                  <li key={b.id}>
                    <div><b>{b.title}</b><small>{b.client_name} · {b.adults + b.children} traveller{b.adults + b.children === 1 ? "" : "s"}{b.destination ? ` · ${b.destination}` : ""}</small></div>
                    <div className="r"><strong>{fmtDate(b.start_date)}</strong><small>{n <= 0 ? "Today" : `in ${n} day${n === 1 ? "" : "s"}`}</small></div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="adm-two">
        <div className="adm-card">
          <h2>Follow-up reminders</h2>
          {d.follow_ups.length === 0 ? <p className="adm-empty">Nothing to follow up. Reminders you set on enquiries and bookings appear here.</p> : (
            <ul className="rows">
              {d.follow_ups.map((f) => {
                const late = new Date(f.due_at) < new Date();
                return (
                  <li key={`${f.source}-${f.id}`}>
                    <div><b>{f.title}</b>{f.reference ? <small>{f.reference}</small> : null}</div>
                    <div className="r"><span className={late ? "late" : ""}>{late ? "Overdue" : "Due"}</span><small>{fmtDateTime(f.due_at)}</small></div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="adm-card">
          <h2>Recent booking activity</h2>
          {d.recent_activity.length === 0 ? <p className="adm-empty">No bookings or payments yet.</p> : (
            <ul className="rows">
              {d.recent_activity.map((a) => (
                <li key={`${a.kind}-${a.id}`}>
                  <div><b>{a.kind === "payment" ? `Payment: ${a.label}` : a.label}</b><small>{a.reference}{a.kind === "payment" ? ` · ${money(a.amount, a.currency)}` : ""}</small></div>
                  <div className="r"><Badge s={a.detail} /><small>{timeAgo(a.at)}</small></div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

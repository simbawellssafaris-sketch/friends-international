import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { searchTerm, pageNum, oneOf } from "@/lib/admin/validate";
import { fmtDate, money, statusLabel, todayEAT } from "@/lib/admin/format";
import Pager from "../../_components/Pager";
import Flash from "../../_components/Flash";

export const metadata = { title: "Bookings" };
const PER = 25;

const monthParam = (v) => (/^\d{4}-(0[1-9]|1[0-2])$/.test(v || "") ? v : todayEAT().slice(0, 7));
const shiftMonth = (ym, n) => { const d = new Date(`${ym}-01T12:00:00Z`); d.setUTCMonth(d.getUTCMonth() + n); return d.toISOString().slice(0, 7); };

export default async function BookingsPage({ searchParams }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const mode = oneOf(sp.mode, ["list", "calendar"], "list");
  const { data: statuses } = await s.supabase.from("booking_statuses").select("code, label").eq("active", true).order("sort");
  const codes = (statuses || []).map((x) => x.code);

  if (mode === "calendar") return <Calendar s={s} sp={sp} statuses={statuses || []} />;

  const q = searchTerm(sp.q);
  const status = oneOf(sp.status, codes, "");
  const when = oneOf(sp.when, ["all", "upcoming", "past"], "all");
  const view = oneOf(sp.view, ["active", "archived"], "active");
  const page = pageNum(sp.page);
  const today = todayEAT();

  let query = s.supabase.from("bookings").select("id, reference, title, destination, status, currency, start_date, end_date, adults, children, agreed_total, quoted_total, clients(id, full_name)", { count: "exact" });
  query = view === "archived" ? query.not("archived_at", "is", null) : query.is("archived_at", null);
  if (status) query = query.eq("status", status);
  if (when === "upcoming") query = query.gte("start_date", today);
  if (when === "past") query = query.lt("start_date", today);
  if (q) {
    const { data: cl } = await s.supabase.from("clients").select("id").ilike("full_name", `%${q}%`).limit(50);
    const ids = (cl || []).map((c) => c.id);
    const parts = ["title", "reference", "destination"].map((c) => `${c}.ilike.%${q}%`);
    if (ids.length) parts.push(`client_id.in.(${ids.join(",")})`);
    query = query.or(parts.join(","));
  }
  query = query.order("start_date", { ascending: when !== "past", nullsFirst: false }).range((page - 1) * PER, page * PER - 1);
  const { data: rows, count, error } = await query;
  const ids = (rows || []).map((r) => r.id);
  const { data: fin } = ids.length ? await s.supabase.from("booking_financials").select("booking_id, amount_paid, balance").in("booking_id", ids) : { data: [] };
  const finBy = Object.fromEntries((fin || []).map((f) => [f.booking_id, f]));
  const params = { q, status, when: when === "all" ? "" : when, view: view === "active" ? "" : view };
  const exportQs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();

  return (
    <>
      <div className="adm-page-head">
        <div><h1>Bookings</h1><p>Trips you have quoted, confirmed or completed.</p></div>
        <div className="adm-actions">
          <Link className="adm-chip on" href="/admin/bookings">List</Link>
          <Link className="adm-chip" href="/admin/bookings?mode=calendar">Calendar</Link>
          <a className="adm-chip" href={`/admin/bookings/export${exportQs ? `?${exportQs}` : ""}`}>Export CSV</a>
          <Link className="adm-chip on" href="/admin/bookings/new">New booking</Link>
        </div>
      </div>
      <Flash ok={sp.ok} err={sp.err} />
      <form className="adm-toolbar" method="get" action="/admin/bookings">
        <input name="q" defaultValue={q} placeholder="Search client, trip, destination or reference" aria-label="Search" />
        <select name="status" defaultValue={status} aria-label="Status"><option value="">All statuses</option>{(statuses || []).map((x) => <option key={x.code} value={x.code}>{x.label}</option>)}</select>
        <select name="when" defaultValue={when} aria-label="When"><option value="all">Any date</option><option value="upcoming">Upcoming</option><option value="past">Past</option></select>
        <select name="view" defaultValue={view} aria-label="View"><option value="active">Active</option><option value="archived">Archived</option></select>
        <button className="adm-chip on">Filter</button>
      </form>
      {error ? <div className="adm-alert err">The list could not be loaded. Please try again.</div> : null}
      {!rows?.length ? (
        <div className="adm-card"><p className="adm-empty">{q || status || when !== "all" ? "No bookings match these filters." : "No bookings yet. Convert an enquiry, or create a booking for a client."}</p></div>
      ) : (
        <div className="adm-card flush"><div className="adm-scroll">
          <table className="adm-table">
            <thead><tr><th>Reference</th><th>Trip</th><th>Client</th><th>Dates</th><th>Value</th><th>Balance</th><th>Status</th></tr></thead>
            <tbody>{rows.map((b) => {
              const f = finBy[b.id];
              return (
                <tr key={b.id}>
                  <td data-l="Reference"><Link href={`/admin/bookings/${b.id}`}><b>{b.reference}</b></Link></td>
                  <td data-l="Trip">{b.title}<small>{b.destination}</small></td>
                  <td data-l="Client">{b.clients ? <Link href={`/admin/clients/${b.clients.id}`}>{b.clients.full_name}</Link> : "-"}</td>
                  <td data-l="Dates">{b.start_date ? fmtDate(b.start_date) : "TBC"}{b.end_date ? <small>to {fmtDate(b.end_date)}</small> : null}</td>
                  <td data-l="Value">{money(b.agreed_total ?? b.quoted_total ?? 0, b.currency)}</td>
                  <td data-l="Balance">{f ? (Number(f.balance) < 0 ? <span className="late">Overpaid {money(-f.balance, b.currency)}</span> : money(f.balance, b.currency)) : "-"}</td>
                  <td data-l="Status"><span className={`adm-badge ab-${b.status}`}>{statusLabel(b.status)}</span></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div></div>
      )}
      <Pager base="/admin/bookings" params={params} page={page} perPage={PER} total={count ?? 0} />
    </>
  );
}

// Month calendar of departures: each booking appears on every day from its start to its end date.
async function Calendar({ s, sp, statuses }) {
  const ym = monthParam(sp.month);
  const first = new Date(`${ym}-01T12:00:00Z`);
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // Monday first
  const last = `${ym}-${String(daysInMonth).padStart(2, "0")}`;
  const { data: rows } = await s.supabase.from("bookings").select("id, reference, title, status, start_date, end_date, clients(full_name)")
    .is("archived_at", null).not("status", "in", "(cancelled,refunded)").lte("start_date", last).or(`end_date.gte.${ym}-01,and(end_date.is.null,start_date.gte.${ym}-01)`).order("start_date");
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const day = `${ym}-${String(d).padStart(2, "0")}`;
    cells.push({ d, day, items: (rows || []).filter((b) => b.start_date <= day && day <= (b.end_date || b.start_date)) });
  }
  const label = first.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const today = todayEAT();
  return (
    <>
      <div className="adm-page-head">
        <div><h1>Departure calendar</h1><p>{label}. Cancelled and refunded trips are hidden.</p></div>
        <div className="adm-actions">
          <Link className="adm-chip" href="/admin/bookings">List</Link>
          <Link className="adm-chip on" href="/admin/bookings?mode=calendar">Calendar</Link>
          <Link className="adm-chip" href={`/admin/bookings?mode=calendar&month=${shiftMonth(ym, -1)}`}>Previous</Link>
          <Link className="adm-chip" href="/admin/bookings?mode=calendar">Today</Link>
          <Link className="adm-chip" href={`/admin/bookings?mode=calendar&month=${shiftMonth(ym, 1)}`}>Next</Link>
        </div>
      </div>
      <div className="adm-cal" role="grid" aria-label={label}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="cal-h">{d}</div>)}
        {cells.map((c, i) => c ? (
          <div key={i} className={`cal-d${c.day === today ? " today" : ""}`}>
            <span className="n">{c.d}</span>
            {c.items.slice(0, 3).map((b) => (<Link key={b.id} href={`/admin/bookings/${b.id}`} className={`cal-b ab-${b.status}`} title={`${b.title} (${b.clients?.full_name || ""})`}>{b.title}</Link>))}
            {c.items.length > 3 ? <small>+{c.items.length - 3} more</small> : null}
          </div>
        ) : <div key={i} className="cal-d off" />)}
      </div>
      {!(rows || []).length ? <p className="adm-empty">No trips in {label}.</p> : null}
    </>
  );
}

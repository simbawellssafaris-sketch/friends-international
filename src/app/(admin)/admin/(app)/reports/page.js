import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { RANGES, resolveRange } from "@/lib/admin/dashboard";
import { moneyEntries, money, fmtDate, statusLabel } from "@/lib/admin/format";
import BarChart from "../../_components/BarChart";

export const metadata = { title: "Reports" };
const S1 = "#2f8a62", S2 = "#d9912b";

const MonthLabel = (m) => new Date(`${m}-01T12:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" });
const Money = ({ obj, none = "None" }) => {
  const rows = moneyEntries(obj);
  return rows.length ? <>{rows.map(([c, v]) => <span key={c} className="mline">{money(v, c)}</span>)}</> : <span className="adm-empty">{none}</span>;
};

export default async function ReportsPage({ searchParams }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const range = resolveRange(sp);
  const { data: r, error } = await s.supabase.rpc("admin_report", { p_from: range.from, p_to: range.to });
  if (error || !r) return <div className="adm-alert err">The report could not be loaded. Please try again.</div>;

  const qs = new URLSearchParams({ range: range.key, ...(range.key === "custom" ? { from: range.from, to: range.to } : {}) }).toString();
  const e = r.enquiries;
  const rate = e.total ? Math.round((e.converted / e.total) * 1000) / 10 : 0;
  const rows = r.enquiries_by_month.map((m) => ({ label: MonthLabel(m.month), total: m.total, converted: m.converted }));
  const Export = ({ kind }) => <a className="adm-chip" href={`/admin/reports/export?kind=${kind}&${qs}`}>Export CSV</a>;

  return (
    <>
      <div className="adm-page-head">
        <div><h1>Reports</h1><p>{fmtDate(range.from)} to {fmtDate(range.to)}. Money is shown per currency and never added together.</p></div>
        <div className="adm-filters">
          <div className="adm-chips" role="group" aria-label="Date range">
            {RANGES.map((x) => <Link key={x.key} href={`/admin/reports?range=${x.key}`} className={`adm-chip${range.key === x.key ? " on" : ""}`}>{x.label}</Link>)}
          </div>
          <form className="range-form" action="/admin/reports" method="get">
            <input type="hidden" name="range" value="custom" />
            <label><span>From</span><input type="date" name="from" defaultValue={range.from} required /></label>
            <label><span>To</span><input type="date" name="to" defaultValue={range.to} required /></label>
            <button className={`adm-chip${range.key === "custom" ? " on" : ""}`}>Apply</button>
          </form>
        </div>
      </div>

      <section className="kpi-grid" aria-label="Enquiries">
        <div className="kpi"><span className="kpi-l">Enquiries received</span><span className="kpi-v">{e.total}</span><span className="kpi-h">{e.open} still open</span></div>
        <div className="kpi"><span className="kpi-l">Converted to bookings</span><span className="kpi-v">{e.converted}</span><span className="kpi-h">Enquiries marked converted</span></div>
        <div className="kpi"><span className="kpi-l">Enquiry-to-booking rate</span><span className="kpi-v">{rate}%</span><span className="kpi-h">{e.converted} of {e.total} enquiries received in this period</span></div>
        <div className="kpi"><span className="kpi-l">Lost enquiries</span><span className="kpi-v">{e.lost}</span><span className="kpi-h">See the reasons below</span></div>
      </section>

      <div className="adm-card">
        <div className="adm-actions" style={{ justifyContent: "space-between" }}><h2>Enquiries by month</h2><Export kind="enquiries_by_month" /></div>
        <BarChart title="Enquiries and conversions" series={[{ key: "total", label: "Enquiries", color: S1 }, { key: "converted", label: "Converted", color: S2 }]} rows={rows} empty="No enquiries in this period." />
      </div>

      <h2 className="adm-h2">Money</h2>
      <section className="kpi-grid money" aria-label="Money">
        <div className="kpi"><span className="kpi-l">Confirmed booking value</span><span className="kpi-money"><Money obj={r.confirmed_value} /></span><span className="kpi-h">Bookings confirmed, in preparation, in progress or completed, created in this period. Not profit.</span></div>
        <div className="kpi"><span className="kpi-l">Money collected</span><span className="kpi-money"><Money obj={r.collected} /></span><span className="kpi-h">Confirmed payments received in this period</span></div>
        <div className="kpi"><span className="kpi-l">Outstanding balances</span><span className="kpi-money"><Money obj={r.outstanding} none="Nothing owed" /></span><span className="kpi-h">Still owed on confirmed bookings, as of today</span></div>
        <div className="kpi"><span className="kpi-l">Quoted value</span><span className="kpi-money"><Money obj={r.quoted_value} /></span><span className="kpi-h">Quotations emailed in this period. Not a promise of revenue.</span></div>
      </section>
      <div className="adm-alert info">Profit is not shown. This system does not record what you pay suppliers, so any profit figure would be invented. Confirmed value and money collected are what clients agreed to pay and what they have paid.</div>
      <p><Export kind="money" /></p>

      <div className="adm-two">
        <div className="adm-card">
          <div className="adm-actions" style={{ justifyContent: "space-between" }}><h2>Bookings by destination</h2><Export kind="destinations" /></div>
          {!r.bookings_by_destination.length ? <p className="adm-empty">No confirmed bookings in this period.</p> : (
            <div className="adm-scroll"><table className="adm-table compact"><thead><tr><th>Destination</th><th>Bookings</th><th>Value</th></tr></thead>
              <tbody>{r.bookings_by_destination.map((d) => <tr key={d.name}><td data-l="Destination">{d.name}</td><td data-l="Bookings">{d.bookings}</td><td data-l="Value"><Money obj={d.value} /></td></tr>)}</tbody></table></div>
          )}
        </div>
        <div className="adm-card">
          <div className="adm-actions" style={{ justifyContent: "space-between" }}><h2>Bookings by package</h2><Export kind="packages" /></div>
          {!r.bookings_by_package.length ? <p className="adm-empty">No confirmed bookings in this period.</p> : (
            <div className="adm-scroll"><table className="adm-table compact"><thead><tr><th>Package</th><th>Bookings</th><th>Value</th></tr></thead>
              <tbody>{r.bookings_by_package.map((d) => <tr key={d.name}><td data-l="Package">{d.name}</td><td data-l="Bookings">{d.bookings}</td><td data-l="Value"><Money obj={d.value} /></td></tr>)}</tbody></table></div>
          )}
        </div>
      </div>

      <div className="adm-two">
        <div className="adm-card">
          <div className="adm-actions" style={{ justifyContent: "space-between" }}><h2>Lost enquiries and reasons</h2><Export kind="lost" /></div>
          {!r.lost_reasons.length ? <p className="adm-empty">No lost enquiries in this period.</p> : (
            <div className="adm-scroll"><table className="adm-table compact"><thead><tr><th>Reason</th><th>Enquiries</th></tr></thead>
              <tbody>{r.lost_reasons.map((d) => <tr key={d.reason}><td data-l="Reason">{d.reason}</td><td data-l="Enquiries">{d.count}</td></tr>)}</tbody></table></div>
          )}
          <p className="adm-sub" style={{ marginTop: 10 }}>Record a reason on each lost enquiry so this list becomes useful.</p>
        </div>
        <div className="adm-card">
          <div className="adm-actions" style={{ justifyContent: "space-between" }}><h2>Upcoming departures</h2><Export kind="departures" /></div>
          {!r.upcoming_departures.length ? <p className="adm-empty">No confirmed trips are scheduled.</p> : (
            <div className="adm-scroll"><table className="adm-table compact"><thead><tr><th>Departs</th><th>Trip</th><th>Client</th></tr></thead>
              <tbody>{r.upcoming_departures.map((d) => <tr key={d.reference}><td data-l="Departs">{fmtDate(d.start_date)}</td><td data-l="Trip">{d.title}<small>{d.reference} · {statusLabel(d.status)}</small></td><td data-l="Client">{d.client_name}<small>{d.adults + d.children} traveller{d.adults + d.children === 1 ? "" : "s"}</small></td></tr>)}</tbody></table></div>
          )}
        </div>
      </div>
    </>
  );
}

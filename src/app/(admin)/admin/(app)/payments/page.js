import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { pageNum, oneOf, dateStr, searchTerm } from "@/lib/admin/validate";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/admin/constants";
import { fmtDate, money, statusLabel } from "@/lib/admin/format";
import Pager from "../../_components/Pager";

export const metadata = { title: "Payments" };
const PER = 30;
const methodLabel = Object.fromEntries(PAYMENT_METHODS);

export default async function PaymentsPage({ searchParams }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const q = searchTerm(sp.q);
  const status = oneOf(sp.status, PAYMENT_STATUSES, "");
  const from = dateStr(sp.from) || "", to = dateStr(sp.to) || "";
  const page = pageNum(sp.page);

  let query = s.supabase.from("payments")
    .select("id, reference, amount, currency, method, status, paid_at, external_ref, booking_id, bookings(reference, title), clients(full_name)", { count: "exact" });
  if (status) query = query.eq("status", status);
  if (from) query = query.gte("paid_at", from);
  if (to) query = query.lte("paid_at", to);
  if (q) query = query.or(`reference.ilike.%${q}%,external_ref.ilike.%${q}%`);
  const { data: rows, count, error } = await query.order("paid_at", { ascending: false }).order("created_at", { ascending: false }).range((page - 1) * PER, page * PER - 1);
  const params = { q, status, from, to };

  // totals for the filtered range, per currency (confirmed only)
  let tq = s.supabase.from("payments").select("amount, currency").eq("status", "confirmed").limit(5000);
  if (from) tq = tq.gte("paid_at", from);
  if (to) tq = tq.lte("paid_at", to);
  const { data: tot } = await tq;
  const sums = {};
  for (const t of tot || []) sums[t.currency] = (sums[t.currency] || 0) + Number(t.amount);

  return (
    <>
      <div className="adm-page-head">
        <div><h1>Payments</h1><p>Every payment recorded against a booking. Record new payments on the booking itself.</p></div>
      </div>
      <section className="kpi-grid">
        <div className="kpi"><span className="kpi-l">Confirmed payments received{from || to ? " (in range)" : ""}</span>
          <span className="kpi-money">{Object.keys(sums).length ? Object.entries(sums).map(([c, v]) => <span key={c} className="kpi-v sm">{money(v, c)}</span>) : <span className="kpi-v kpi-none">None yet</span>}</span></div>
      </section>
      <form className="adm-toolbar" method="get" action="/admin/payments">
        <input name="q" defaultValue={q} placeholder="Search payment or bank reference" aria-label="Search" />
        <select name="status" defaultValue={status} aria-label="Status"><option value="">All statuses</option>{PAYMENT_STATUSES.map((x) => <option key={x} value={x}>{statusLabel(x)}</option>)}</select>
        <label className="inl"><span>From</span><input type="date" name="from" defaultValue={from} /></label>
        <label className="inl"><span>To</span><input type="date" name="to" defaultValue={to} /></label>
        <button className="adm-chip on">Filter</button>
      </form>
      {error ? <div className="adm-alert err">The list could not be loaded.</div> : null}
      {!rows?.length ? <div className="adm-card"><p className="adm-empty">No payments recorded yet.</p></div> : (
        <div className="adm-card flush"><div className="adm-scroll">
          <table className="adm-table">
            <thead><tr><th>Date</th><th>Client</th><th>Booking</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
            <tbody>{rows.map((p) => (
              <tr key={p.id}>
                <td data-l="Date">{fmtDate(p.paid_at)}<small>{p.reference}</small></td>
                <td data-l="Client">{p.clients?.full_name}</td>
                <td data-l="Booking"><Link href={`/admin/bookings/${p.booking_id}`}>{p.bookings?.reference}</Link><small>{p.bookings?.title}</small></td>
                <td data-l="Amount">{money(p.amount, p.currency)}{p.external_ref ? <small>Ref {p.external_ref}</small> : null}</td>
                <td data-l="Method">{methodLabel[p.method] || p.method}</td>
                <td data-l="Status"><span className={`adm-badge ab-${p.status}`}>{statusLabel(p.status)}</span></td>
              </tr>))}
            </tbody>
          </table>
        </div></div>
      )}
      <Pager base="/admin/payments" params={params} page={page} perPage={PER} total={count ?? 0} />
    </>
  );
}

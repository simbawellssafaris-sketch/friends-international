import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { pageNum, oneOf } from "@/lib/admin/validate";
import { INVOICE_STATUSES } from "@/lib/admin/constants";
import { fmtDate, money, statusLabel } from "@/lib/admin/format";
import Pager from "../../_components/Pager";

export const metadata = { title: "Invoices" };
const PER = 30;

export default async function InvoicesPage({ searchParams }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const status = oneOf(sp.status, INVOICE_STATUSES, "");
  const page = pageNum(sp.page);
  let query = s.supabase.from("invoices").select("id, reference, status, total, currency, issue_date, due_date, booking_id, bookings(reference), clients(full_name)", { count: "exact" });
  if (status) query = query.eq("status", status);
  const { data: rows, count } = await query.order("created_at", { ascending: false }).range((page - 1) * PER, page * PER - 1);
  return (
    <>
      <div className="adm-page-head"><div><h1>Invoices</h1><p>Requests for payment. Create one from a booking.</p></div></div>
      <form className="adm-toolbar" method="get" action="/admin/invoices">
        <select name="status" defaultValue={status} aria-label="Status"><option value="">All statuses</option>{INVOICE_STATUSES.map((x) => <option key={x} value={x}>{statusLabel(x)}</option>)}</select>
        <button className="adm-chip on">Filter</button>
      </form>
      {!rows?.length ? <div className="adm-card"><p className="adm-empty">No invoices yet.</p></div> : (
        <div className="adm-card flush"><div className="adm-scroll"><table className="adm-table">
          <thead><tr><th>Invoice</th><th>Client</th><th>Booking</th><th>Issued</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>{rows.map((i) => (
            <tr key={i.id}>
              <td data-l="Invoice"><Link href={`/admin/invoices/${i.id}`}><b>{i.reference}</b></Link></td>
              <td data-l="Client">{i.clients?.full_name}</td>
              <td data-l="Booking"><Link href={`/admin/bookings/${i.booking_id}`}>{i.bookings?.reference}</Link></td>
              <td data-l="Issued">{fmtDate(i.issue_date)}{i.due_date ? <small>due {fmtDate(i.due_date)}</small> : null}</td>
              <td data-l="Total">{money(i.total, i.currency)}</td>
              <td data-l="Status"><span className={`adm-badge ab-${i.status}`}>{statusLabel(i.status)}</span></td>
            </tr>))}
          </tbody>
        </table></div></div>
      )}
      <Pager base="/admin/invoices" params={{ status }} page={page} perPage={PER} total={count ?? 0} />
    </>
  );
}

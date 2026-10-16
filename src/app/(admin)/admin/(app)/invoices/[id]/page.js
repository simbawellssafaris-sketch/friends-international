import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { uuid } from "@/lib/admin/validate";
import { INVOICE_STATUSES } from "@/lib/admin/constants";
import { fmtDate, money, statusLabel } from "@/lib/admin/format";
import Flash from "../../../_components/Flash";
import PrintButton from "../../../_components/PrintButton";
import { setInvoiceStatus } from "../actions";

export const metadata = { title: "Invoice" };

// An invoice asks for payment. Receipts (for money actually received) are issued from the booking's payments.
export default async function InvoicePage({ params, searchParams }) {
  const s = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  if (!uuid(id)) notFound();
  const { data: inv } = await s.supabase.from("invoices").select("*, clients(full_name, email, phone), bookings(reference, title, start_date, end_date)").eq("id", id).maybeSingle();
  if (!inv) notFound();
  const [{ data: items }, { data: fin }] = await Promise.all([
    s.supabase.from("invoice_items").select("description, quantity, unit_price").eq("invoice_id", id).order("sort"),
    s.supabase.from("booking_financials").select("amount_paid, balance").eq("booking_id", inv.booking_id).maybeSingle(),
  ]);
  return (
    <div className="doc">
      <div className="no-print doc-bar">
        <Link href={`/admin/bookings/${inv.booking_id}`} className="adm-chip">Back to booking</Link>
        <PrintButton />
        <form action={setInvoiceStatus} className="inl-form">
          <input type="hidden" name="id" value={id} />
          <select name="status" defaultValue={inv.status} aria-label="Invoice status">{INVOICE_STATUSES.map((x) => <option key={x} value={x}>{statusLabel(x)}</option>)}</select>
          <button className="adm-chip">Update status</button>
        </form>
      </div>
      <div className="no-print"><Flash ok={sp.ok} err={sp.err} /></div>
      <header className="doc-head">
        <div><h1>Invoice</h1><p>{inv.reference} · issued {fmtDate(inv.issue_date)}{inv.due_date ? ` · due ${fmtDate(inv.due_date)}` : ""}</p></div>
        <div className="doc-co"><b>Friends International Limited</b><span>{process.env.NEXT_PUBLIC_SITE_URL || ""}</span></div>
      </header>
      <section><h2>Billed to</h2><p><b>{inv.clients.full_name}</b>{inv.clients.email ? <><br />{inv.clients.email}</> : null}</p>
        <p>For booking {inv.bookings.reference}: {inv.bookings.title}{inv.bookings.start_date ? ` (${fmtDate(inv.bookings.start_date)})` : ""}</p></section>
      <section>
        <table className="doc-table lines">
          <thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Amount</th></tr></thead>
          <tbody>{(items || []).map((i, n) => (<tr key={n}><td>{i.description}</td><td>{Number(i.quantity)}</td><td>{money(i.unit_price, inv.currency)}</td><td>{money(i.quantity * i.unit_price, inv.currency)}</td></tr>))}</tbody>
          <tfoot><tr><th colSpan={3}>Invoice total</th><td><b>{money(inv.total, inv.currency)}</b></td></tr>
            <tr><th colSpan={3}>Paid to date on this booking</th><td>{money(fin?.amount_paid ?? 0, inv.currency)}</td></tr>
            <tr><th colSpan={3}>Balance on booking</th><td>{money(Math.max(0, fin?.balance ?? 0), inv.currency)}</td></tr></tfoot>
        </table>
      </section>
      {inv.notes ? <section><h2>Payment details and terms</h2><p className="pre">{inv.notes}</p></section> : null}
    </div>
  );
}

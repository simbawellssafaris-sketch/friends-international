import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { uuid } from "@/lib/admin/validate";
import { PAYMENT_METHODS } from "@/lib/admin/constants";
import { fmtDate, money } from "@/lib/admin/format";
import PrintButton from "../../../_components/PrintButton";

export const metadata = { title: "Receipt" };
const methodLabel = Object.fromEntries(PAYMENT_METHODS);

// A receipt confirms money that has actually been received. It is not an invoice or a quotation.
export default async function ReceiptPage({ params }) {
  const s = await requireAdmin();
  const { id } = await params;
  if (!uuid(id)) notFound();
  const { data: r } = await s.supabase
    .from("receipts").select("reference, issued_at, payments(reference, amount, currency, method, paid_at, external_ref, status, booking_id, bookings(reference, title), clients(full_name, email))")
    .eq("id", id).maybeSingle();
  if (!r || !r.payments) notFound();
  const p = r.payments;
  const { data: fin } = await s.supabase.from("booking_financials").select("total_value, amount_paid, balance").eq("booking_id", p.booking_id).maybeSingle();
  return (
    <div className="doc">
      <div className="no-print doc-bar"><Link href={`/admin/bookings/${p.booking_id}`} className="adm-chip">Back to booking</Link><PrintButton /></div>
      <header className="doc-head">
        <div><h1>Receipt</h1><p>{r.reference} · {fmtDate(r.issued_at)}</p></div>
        <div className="doc-co"><b>Friends International Limited</b><span>{process.env.NEXT_PUBLIC_SITE_URL || ""}</span></div>
      </header>
      <section><h2>Received from</h2><p><b>{p.clients?.full_name}</b>{p.clients?.email ? <><br />{p.clients.email}</> : null}</p></section>
      <section>
        <table className="doc-table"><tbody>
          <tr><th>Amount received</th><td><b>{money(p.amount, p.currency)}</b></td></tr>
          <tr><th>Date received</th><td>{fmtDate(p.paid_at)}</td></tr>
          <tr><th>Payment method</th><td>{methodLabel[p.method] || p.method}</td></tr>
          {p.external_ref ? <tr><th>Reference</th><td>{p.external_ref}</td></tr> : null}
          <tr><th>For booking</th><td>{p.bookings?.reference} · {p.bookings?.title}</td></tr>
          <tr><th>Payment number</th><td>{p.reference}</td></tr>
          <tr><th>Balance remaining on booking</th><td>{money(Math.max(0, fin?.balance ?? 0), p.currency)}</td></tr>
        </tbody></table>
      </section>
      <p className="doc-foot">Thank you for your payment.</p>
    </div>
  );
}

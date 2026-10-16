import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { uuid } from "@/lib/admin/validate";
import { fmtDate, money, statusLabel } from "@/lib/admin/format";
import PrintButton from "../../../../_components/PrintButton";

export const metadata = { title: "Booking summary" };

// Printable booking summary. Internal notes are deliberately left out so this page can be shown to a client.
export default async function BookingPrint({ params }) {
  const s = await requireAdmin();
  const { id } = await params;
  if (!uuid(id)) notFound();
  const { data: b } = await s.supabase.from("bookings").select("*, clients(full_name, email, phone, country)").eq("id", id).maybeSingle();
  if (!b) notFound();
  const [{ data: fin }, { data: pays }] = await Promise.all([
    s.supabase.from("booking_financials").select("total_value, amount_paid, balance").eq("booking_id", id).maybeSingle(),
    s.supabase.from("payments").select("reference, amount, currency, paid_at, method").eq("booking_id", id).eq("status", "confirmed").order("paid_at"),
  ]);
  return (
    <div className="doc">
      <div className="no-print doc-bar"><Link href={`/admin/bookings/${id}`} className="adm-chip">Back</Link><PrintButton /></div>
      <header className="doc-head">
        <div><h1>Booking summary</h1><p>{b.reference}</p></div>
        <div className="doc-co"><b>Friends International Limited</b><span>{process.env.NEXT_PUBLIC_SITE_URL || ""}</span></div>
      </header>
      <section><h2>Client</h2><p><b>{b.clients.full_name}</b><br />{[b.clients.email, b.clients.phone, b.clients.country].filter(Boolean).join(" · ")}</p></section>
      <section>
        <h2>Trip</h2>
        <table className="doc-table"><tbody>
          <tr><th>Service</th><td>{b.title}</td></tr>
          <tr><th>Destination</th><td>{b.destination || "-"}</td></tr>
          <tr><th>Dates</th><td>{b.start_date ? `${fmtDate(b.start_date)}${b.end_date ? ` to ${fmtDate(b.end_date)}` : ""}` : "To be confirmed"}</td></tr>
          <tr><th>Travellers</th><td>{b.adults} adult{b.adults === 1 ? "" : "s"}{b.children ? `, ${b.children} child${b.children === 1 ? "" : "ren"}` : ""}</td></tr>
          <tr><th>Accommodation</th><td className="pre">{b.accommodation || "-"}</td></tr>
          <tr><th>Transport</th><td className="pre">{b.transport || "-"}</td></tr>
          <tr><th>Status</th><td>{statusLabel(b.status)}</td></tr>
        </tbody></table>
      </section>
      <section>
        <h2>Payment</h2>
        <table className="doc-table"><tbody>
          <tr><th>Trip value</th><td>{money(fin?.total_value ?? 0, b.currency)}</td></tr>
          <tr><th>Deposit required</th><td>{b.deposit_required > 0 ? money(b.deposit_required, b.currency) : "None"}</td></tr>
          <tr><th>Paid so far</th><td>{money(fin?.amount_paid ?? 0, b.currency)}</td></tr>
          <tr><th>Balance due</th><td><b>{money(Math.max(0, fin?.balance ?? 0), b.currency)}</b>{b.payment_deadline ? ` by ${fmtDate(b.payment_deadline)}` : ""}</td></tr>
        </tbody></table>
        {pays?.length ? (<><h3>Payments received</h3><table className="doc-table"><tbody>{pays.map((p) => (<tr key={p.reference}><th>{fmtDate(p.paid_at)}</th><td>{money(p.amount, p.currency)} <small>({p.reference})</small></td></tr>))}</tbody></table></>) : null}
      </section>
    </div>
  );
}

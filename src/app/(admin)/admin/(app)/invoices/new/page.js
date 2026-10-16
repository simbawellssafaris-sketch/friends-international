import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { uuid } from "@/lib/admin/validate";
import { todayEAT } from "@/lib/admin/format";
import Flash from "../../../_components/Flash";
import { createInvoice } from "../actions";

export const metadata = { title: "New invoice" };

export default async function NewInvoice({ searchParams }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const id = uuid(sp.booking);
  if (!id) notFound();
  const { data: b } = await s.supabase.from("bookings").select("id, quotation_id, reference, title, currency, agreed_total, quoted_total, deposit_required, payment_deadline, clients(full_name)").eq("id", id).maybeSingle();
  if (!b) notFound();
  // start from the agreed (or quoted) price as one line; add or change lines as needed
  // Lines from the linked quotation, with its discounts applied and its tax added as a line, so the invoice total matches the quotation total.
  let lines = null;
  if (b.quotation_id) {
    const [{ data: qi }, { data: qq }] = await Promise.all([
      s.supabase.from("quotation_items").select("description, quantity, unit_price, discount_pct").eq("quotation_id", b.quotation_id).order("sort"),
      s.supabase.from("quotations").select("tax_rate, tax_total").eq("id", b.quotation_id).maybeSingle(),
    ]);
    if (qi?.length) {
      lines = qi.map((i) => ({ description: i.description + (Number(i.discount_pct) ? ` (after ${Number(i.discount_pct)}% discount)` : ""), quantity: i.quantity, unit_price: Math.round(i.unit_price * (1 - i.discount_pct / 100) * 100) / 100 }));
      if (Number(qq?.tax_total) > 0) lines.push({ description: `Tax (${Number(qq.tax_rate)}%)`, quantity: 1, unit_price: Number(qq.tax_total) });
    }
  }
  lines = lines || [{ description: b.title, quantity: 1, unit_price: b.agreed_total ?? b.quoted_total ?? 0 }];
  const rows = [...lines, ...Array.from({ length: Math.max(0, 5 - lines.length) }, () => ({}))].slice(0, 12);
  return (
    <>
      <p className="adm-crumb"><Link href={`/admin/bookings/${id}`}>{b.reference}</Link> / New invoice</p>
      <div className="adm-page-head"><div><h1>New invoice</h1><p>{b.title} · {b.clients.full_name} · amounts in {b.currency}</p></div></div>
      <Flash err={sp.err} />
      <form className="adm-card adm-form" action={createInvoice}>
        <input type="hidden" name="booking_id" value={id} />
        <div className="adm-items head"><span>Description</span><span>Qty</span><span>Unit price ({b.currency})</span></div>
        {rows.map((r, i) => (
          <div className="adm-items" key={i}>
            <input name="description" maxLength={500} defaultValue={r.description || ""} aria-label={`Line ${i + 1} description`} />
            <input name="quantity" inputMode="decimal" defaultValue={r.quantity ?? ""} aria-label={`Line ${i + 1} quantity`} />
            <input name="unit_price" inputMode="decimal" defaultValue={r.unit_price ?? ""} aria-label={`Line ${i + 1} unit price`} />
          </div>
        ))}
        <div className="adm-row2">
          <label className="adm-field"><span>Issue date</span><input type="date" name="issue_date" defaultValue={todayEAT()} /></label>
          <label className="adm-field"><span>Due date</span><input type="date" name="due_date" defaultValue={b.payment_deadline || ""} /></label>
        </div>
        <label className="adm-field"><span>Notes shown on the invoice (bank details, terms)</span><textarea name="notes" rows={3} maxLength={3000} /></label>
        <p className="adm-sub">An invoice is a request for payment. It does not mean anything has been paid; record payments on the booking.</p>
        <button className="adm-btn inline">Create invoice</button>
      </form>
    </>
  );
}

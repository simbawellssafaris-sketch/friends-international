import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { uuid } from "@/lib/admin/validate";
import { CURRENCIES, ITEM_CATEGORIES } from "@/lib/admin/constants";
import { fmtDate, fmtDateTime, money, statusLabel } from "@/lib/admin/format";
import Flash from "../../../_components/Flash";
import QuoteFields from "../../../_components/QuoteFields";
import QuoteLines from "../../../_components/QuoteLines";
import { updateQuotation, reviseQuotation, sendQuotation, setQuotationStatus, convertQuotation } from "../actions";

export const metadata = { title: "Quotation" };
const catLabel = Object.fromEntries(ITEM_CATEGORIES);

export default async function QuotationPage({ params, searchParams }) {
  const s = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  if (!uuid(id)) notFound();
  const { data: q } = await s.supabase.from("quotations").select("*, clients(id, full_name, email)").eq("id", id).maybeSingle();
  if (!q) notFound();
  const [{ data: items }, { data: versions }, { data: booking }] = await Promise.all([
    s.supabase.from("quotation_items").select("*").eq("quotation_id", id).order("sort"),
    s.supabase.from("quotations").select("id, version, status").eq("reference", q.reference).order("version"),
    s.supabase.from("bookings").select("id, reference").eq("quotation_id", id).limit(1),
  ]);
  const draft = q.status === "draft";

  return (
    <>
      <p className="adm-crumb"><Link href="/admin/quotations">Quotations</Link> / {q.reference}</p>
      <div className="adm-page-head">
        <div>
          <h1>{q.title}</h1>
          <p>{q.reference} · version {q.version} · <Link href={`/admin/clients/${q.clients.id}`}>{q.clients.full_name}</Link> · <span className={`adm-badge ab-${q.status}`}>{statusLabel(q.status)}</span></p>
        </div>
        <div className="adm-actions">
          <a className="adm-chip" href={`/admin/quotations/${id}/pdf`} target="_blank" rel="noreferrer">Download PDF</a>
          {["draft", "sent"].includes(q.status) ? (
            <form action={sendQuotation}><input type="hidden" name="id" value={id} /><button className="adm-chip on" disabled={!q.clients.email} title={q.clients.email ? "" : "This client has no email address"}>{q.status === "sent" ? "Send again" : "Email to client"}</button></form>
          ) : null}
          {!draft ? <form action={reviseQuotation}><input type="hidden" name="id" value={id} /><button className="adm-chip">Create revised version</button></form> : null}
        </div>
      </div>
      <Flash ok={sp.ok} err={sp.err} />
      {!q.clients.email && ["draft", "sent"].includes(q.status) ? <div className="adm-alert info">This client has no email address, so the quotation cannot be emailed. Add one on the client page, or download the PDF and send it yourself.</div> : null}

      {versions?.length > 1 ? (
        <p className="adm-sub">Versions: {versions.map((v) => (v.id === id ? <b key={v.id}>v{v.version} (this one) </b> : <Link key={v.id} href={`/admin/quotations/${v.id}`}>v{v.version} ({statusLabel(v.status)}) </Link>))}</p>
      ) : null}

      {q.status === "sent" || q.status === "accepted" || q.status === "declined" || q.status === "expired" ? (
        <div className="adm-card">
          <h2>Client response</h2>
          <p className="adm-sub">{q.sent_at ? `Sent ${fmtDateTime(q.sent_at)}. ` : ""}{q.accepted_at ? `Accepted ${fmtDateTime(q.accepted_at)}.` : "Record what the client decides. Nothing becomes a booking until you convert it."}</p>
          <div className="adm-actions">
            {q.status === "sent" ? (
              <>
                <form action={setQuotationStatus}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value="accepted" /><button className="adm-chip on">Mark accepted</button></form>
                <form action={setQuotationStatus}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value="declined" /><button className="adm-chip">Mark declined</button></form>
                <form action={setQuotationStatus}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value="expired" /><button className="adm-chip">Mark expired</button></form>
              </>
            ) : null}
            {q.status === "accepted" ? (booking?.[0] ? <Link className="adm-chip on" href={`/admin/bookings/${booking[0].id}`}>Open booking {booking[0].reference}</Link> : (
              <form action={convertQuotation}><input type="hidden" name="id" value={id} /><button className="adm-chip on">Convert to booking</button></form>)) : null}
          </div>
        </div>
      ) : null}

      {draft ? (
        <form className="adm-card adm-form" action={updateQuotation}>
          <h2>Edit draft</h2>
          <input type="hidden" name="id" value={id} />
          <QuoteFields q={q} />
          <QuoteLines initial={items} currencies={CURRENCIES} currency={q.currency} taxRate={q.tax_rate} />
          <button className="adm-btn inline">Save draft</button>
        </form>
      ) : (
        <div className="adm-card">
          <h2>Quotation</h2>
          <p className="adm-sub">Issued {fmtDate(q.issue_date)}{q.valid_until ? ` · valid until ${fmtDate(q.valid_until)}` : ""}. A quotation that has been sent cannot be edited; create a revised version instead.</p>
          <div className="adm-scroll"><table className="adm-table compact">
            <thead><tr><th>Type</th><th>Description</th><th>Qty</th><th>Unit price</th><th>Disc.</th><th>Amount</th></tr></thead>
            <tbody>{(items || []).map((i) => (<tr key={i.id}><td data-l="Type">{catLabel[i.category]}</td><td data-l="Description">{i.description}</td><td data-l="Qty">{Number(i.quantity)}</td><td data-l="Unit price">{money(i.unit_price, q.currency)}</td><td data-l="Disc.">{Number(i.discount_pct) ? `${Number(i.discount_pct)}%` : "-"}</td><td data-l="Amount">{money(i.quantity * i.unit_price * (1 - i.discount_pct / 100), q.currency)}</td></tr>))}</tbody>
          </table></div>
          <dl className="adm-totals">
            <dt>Subtotal</dt><dd>{money(q.subtotal, q.currency)}</dd>
            {Number(q.discount_total) > 0 ? (<><dt>Discounts</dt><dd>- {money(q.discount_total, q.currency)}</dd></>) : null}
            {Number(q.tax_rate) > 0 ? (<><dt>Tax ({Number(q.tax_rate)}%)</dt><dd>{money(q.tax_total, q.currency)}</dd></>) : null}
            <dt className="big">Total</dt><dd className="big">{money(q.total, q.currency)}</dd>
          </dl>
          {q.inclusions ? (<><h3 className="adm-h3">Included</h3><p className="pre">{q.inclusions}</p></>) : null}
          {q.exclusions ? (<><h3 className="adm-h3">Not included</h3><p className="pre">{q.exclusions}</p></>) : null}
          {q.payment_terms ? (<><h3 className="adm-h3">Payment terms</h3><p className="pre">{q.payment_terms}</p></>) : null}
          {q.cancellation_terms ? (<><h3 className="adm-h3">Cancellation terms</h3><p className="pre">{q.cancellation_terms}</p></>) : null}
          {q.notes ? (<><h3 className="adm-h3">Internal notes</h3><p className="pre">{q.notes}</p></>) : null}
        </div>
      )}
    </>
  );
}

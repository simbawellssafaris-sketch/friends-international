import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { uuid } from "@/lib/admin/validate";
import { ACTIVITY_KINDS, ACTIVITY_LABEL, PAYMENT_METHODS, PAYMENT_STATUSES, CURRENCIES } from "@/lib/admin/constants";
import { fmtDate, fmtDateTime, money, statusLabel, todayEAT } from "@/lib/admin/format";
import Flash from "../../../_components/Flash";
import BookingFields from "../../../_components/BookingFields";
import Documents from "../../../_components/Documents";
import { updateBooking, archiveBooking, addBookingNote, recordPayment, setPaymentStatus, issueReceipt } from "../actions";

export const metadata = { title: "Booking" };
const methodLabel = Object.fromEntries(PAYMENT_METHODS);

export default async function BookingPage({ params, searchParams }) {
  const s = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  if (!uuid(id)) notFound();
  const { data: b } = await s.supabase.from("bookings").select("*, clients(id, full_name, email, phone)").eq("id", id).maybeSingle();
  if (!b) notFound();

  const [{ data: statuses }, { data: fin }, { data: pays }, { data: acts }, { data: quote }, { data: invs }, { data: docs }] = await Promise.all([
    s.supabase.from("booking_statuses").select("code, label").eq("active", true).order("sort"),
    s.supabase.from("booking_financials").select("total_value, amount_paid, balance").eq("booking_id", id).maybeSingle(),
    s.supabase.from("payments").select("id, reference, amount, currency, method, status, paid_at, external_ref, notes, receipts(id, reference)").eq("booking_id", id).order("paid_at", { ascending: false }),
    s.supabase.from("activities").select("id, kind, body, created_at").eq("booking_id", id).order("created_at", { ascending: false }).limit(50),
    b.quotation_id ? s.supabase.from("quotations").select("id, reference, version, total, currency").eq("id", b.quotation_id).maybeSingle() : Promise.resolve({ data: null }),
    s.supabase.from("invoices").select("id, reference, status, total, currency, issue_date").eq("booking_id", id).order("created_at", { ascending: false }),
    s.supabase.from("documents").select("id, kind, filename, sensitive, created_at").eq("booking_id", id).order("created_at", { ascending: false }),
  ]);
  const total = Number(fin?.total_value ?? 0), paid = Number(fin?.amount_paid ?? 0), balance = Number(fin?.balance ?? 0);
  const label = Object.fromEntries((statuses || []).map((x) => [x.code, x.label]));
  const depositDue = Math.max(0, Number(b.deposit_required || 0) - paid);

  return (
    <>
      <p className="adm-crumb"><Link href="/admin/bookings">Bookings</Link> / {b.reference}</p>
      <div className="adm-page-head">
        <div>
          <h1>{b.title}</h1>
          <p>{b.reference} · <Link href={`/admin/clients/${b.clients.id}`}>{b.clients.full_name}</Link> · <span className={`adm-badge ab-${b.status}`}>{label[b.status] || statusLabel(b.status)}</span>{b.archived_at ? " · Archived" : ""}</p>
        </div>
        <div className="adm-actions">
          <Link className="adm-chip" href={`/admin/bookings/${id}/print`}>Printable summary</Link>
          <Link className="adm-chip" href={`/admin/invoices/new?booking=${id}`}>Create invoice</Link>
          {b.enquiry_id ? <Link className="adm-chip" href={`/admin/enquiries/${b.enquiry_id}`}>Original enquiry</Link> : null}
        </div>
      </div>
      <Flash ok={sp.ok} err={sp.err} />

      <section className="kpi-grid">
        <div className="kpi"><span className="kpi-l">Trip value</span><span className="kpi-v sm">{money(total, b.currency)}</span><span className="kpi-h">{b.agreed_total != null ? "Agreed price" : b.quoted_total != null ? "Quoted price (not yet agreed)" : "No price set"}</span></div>
        <div className="kpi"><span className="kpi-l">Paid</span><span className="kpi-v sm">{money(paid, b.currency)}</span><span className="kpi-h">Confirmed payments only</span></div>
        <div className="kpi"><span className="kpi-l">Balance</span><span className="kpi-v sm">{balance < 0 ? `Overpaid ${money(-balance, b.currency)}` : money(balance, b.currency)}</span><span className="kpi-h">{b.payment_deadline ? `Due by ${fmtDate(b.payment_deadline)}` : "No payment deadline set"}</span></div>
        <div className="kpi"><span className="kpi-l">Deposit</span><span className="kpi-v sm">{b.deposit_required > 0 ? money(b.deposit_required, b.currency) : "None required"}</span><span className="kpi-h">{b.deposit_required > 0 ? (depositDue > 0 ? `${money(depositDue, b.currency)} still due` : "Deposit received") : ""}</span></div>
      </section>

      <div className="adm-two wide-left">
        <div className="adm-stack">
          <div className="adm-card">
            <h2>Trip details</h2>
            <dl className="adm-dl">
              <dt>Destination</dt><dd>{b.destination || "-"}</dd>
              <dt>Dates</dt><dd>{b.start_date ? `${fmtDate(b.start_date)}${b.end_date ? ` to ${fmtDate(b.end_date)}` : ""}` : "To be confirmed"}</dd>
              <dt>Travellers</dt><dd>{b.adults} adult{b.adults === 1 ? "" : "s"}{b.children ? `, ${b.children} child${b.children === 1 ? "" : "ren"}` : ""}</dd>
              <dt>Accommodation</dt><dd className="pre">{b.accommodation || "-"}</dd>
              <dt>Transport</dt><dd className="pre">{b.transport || "-"}</dd>
              <dt>Guide / supplier</dt><dd>{b.guide_or_supplier || "-"}</dd>
              <dt>Client contact</dt><dd>{[b.clients.email, b.clients.phone].filter(Boolean).join(" · ") || "-"}</dd>
              {quote ? (<><dt>Quotation</dt><dd><Link href={`/admin/quotations/${quote.id}`}>{quote.reference} v{quote.version}</Link> ({money(quote.total, quote.currency)})</dd></>) : null}
            </dl>
          </div>

          <div className="adm-card" id="pay">
            <h2>Payments</h2>
            {!pays?.length ? <p className="adm-empty">No payments recorded yet.</p> : (
              <div className="adm-scroll"><table className="adm-table compact">
                <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th><th /></tr></thead>
                <tbody>{pays.map((p) => (
                  <tr key={p.id}>
                    <td data-l="Date">{fmtDate(p.paid_at)}<small>{p.reference}</small></td>
                    <td data-l="Amount">{money(p.amount, p.currency)}{p.external_ref ? <small>Ref {p.external_ref}</small> : null}</td>
                    <td data-l="Method">{methodLabel[p.method] || p.method}</td>
                    <td data-l="Status"><span className={`adm-badge ab-${p.status}`}>{statusLabel(p.status)}</span></td>
                    <td className="acts">
                      {p.status === "pending" ? (
                        <>
                          <form action={setPaymentStatus}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="booking_id" value={id} /><input type="hidden" name="status" value="confirmed" /><button className="adm-chip on">Confirm received</button></form>
                          <form action={setPaymentStatus}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="booking_id" value={id} /><input type="hidden" name="status" value="failed" /><button className="adm-chip">Mark failed</button></form>
                        </>
                      ) : null}
                      {p.status === "confirmed" ? (
                        <>
                          {p.receipts?.[0] ? <Link className="adm-chip" href={`/admin/receipts/${p.receipts[0].id}`}>Receipt</Link> : (
                            <form action={issueReceipt}><input type="hidden" name="payment_id" value={p.id} /><input type="hidden" name="booking_id" value={id} /><button className="adm-chip">Issue receipt</button></form>
                          )}
                          <form action={setPaymentStatus}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="booking_id" value={id} /><input type="hidden" name="status" value="refunded" /><button className="adm-chip">Mark refunded</button></form>
                        </>
                      ) : null}
                    </td>
                  </tr>))}
                </tbody>
              </table></div>
            )}
            <h3 className="adm-h3">Record a payment</h3>
            <p className="adm-sub">Record money you have actually received. This does not change the booking status; update that yourself.</p>
            <form className="adm-form" action={recordPayment}>
              <input type="hidden" name="booking_id" value={id} />
              <div className="adm-row3">
                <label className="adm-field"><span>Amount</span><input name="amount" inputMode="decimal" required placeholder="0.00" /></label>
                <label className="adm-field"><span>Currency</span><select name="currency" defaultValue={b.currency}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></label>
                <label className="adm-field"><span>Date received</span><input type="date" name="paid_at" required defaultValue={todayEAT()} max={todayEAT()} /></label>
              </div>
              <div className="adm-row3">
                <label className="adm-field"><span>Method</span><select name="method">{PAYMENT_METHODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
                <label className="adm-field"><span>Status</span><select name="status" defaultValue="confirmed">{PAYMENT_STATUSES.filter((x) => x !== "refunded").map((x) => <option key={x} value={x}>{statusLabel(x)}</option>)}</select></label>
                <label className="adm-field"><span>Bank / transaction reference</span><input name="external_ref" maxLength={120} /></label>
              </div>
              <label className="adm-field"><span>Notes</span><input name="notes" maxLength={2000} /></label>
              <button className="adm-btn inline">Record payment</button>
            </form>
          </div>

          {invs?.length ? (
            <div className="adm-card"><h2>Invoices</h2>
              <ul className="rows">{invs.map((i) => (<li key={i.id}><div><Link href={`/admin/invoices/${i.id}`}><b>{i.reference}</b></Link><small>{fmtDate(i.issue_date)}</small></div><div className="r"><span className={`adm-badge ab-${i.status}`}>{statusLabel(i.status)}</span><small>{money(i.total, i.currency)}</small></div></li>))}</ul>
            </div>
          ) : null}

          <Documents docs={docs} clientId={b.client_id} bookingId={id} />

          <div className="adm-card">
            <h2>Notes and history</h2>
            <form className="adm-form" action={addBookingNote}>
              <input type="hidden" name="id" value={id} />
              <label className="adm-field"><span>Type</span><select name="kind">{ACTIVITY_KINDS.map((k) => <option key={k} value={k}>{ACTIVITY_LABEL[k]}</option>)}</select></label>
              <label className="adm-field"><span>What happened?</span><textarea name="body" rows={2} maxLength={4000} required /></label>
              <button className="adm-btn inline">Add to history</button>
            </form>
            {!acts?.length ? <p className="adm-empty">Nothing recorded yet.</p> : (
              <ul className="rows timeline">{acts.map((a) => (<li key={a.id}><div><b>{ACTIVITY_LABEL[a.kind] || a.kind}</b><span className="pre">{a.body}</span></div><div className="r"><small>{fmtDateTime(a.created_at)}</small></div></li>))}</ul>
            )}
          </div>
        </div>

        <div className="adm-stack">
          <form className="adm-card adm-form" action={updateBooking}>
            <h2>Edit booking</h2>
            <input type="hidden" name="id" value={id} />
            <BookingFields b={b} statuses={statuses || []} />
            <button className="adm-btn inline">Save changes</button>
          </form>
          <form className="adm-card" action={archiveBooking}>
            <input type="hidden" name="id" value={id} /><input type="hidden" name="archive" value={b.archived_at ? "0" : "1"} />
            <p className="adm-sub">{b.archived_at ? "This booking is archived." : "Archiving hides this booking from the main list. Payments and history are kept."}</p>
            <button className="adm-chip">{b.archived_at ? "Restore booking" : "Archive booking"}</button>
          </form>
        </div>
      </div>
    </>
  );
}

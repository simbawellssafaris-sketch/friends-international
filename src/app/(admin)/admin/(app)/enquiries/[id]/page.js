import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { uuid } from "@/lib/admin/validate";
import { ENQUIRY_STATUSES, ACTIVITY_KINDS, ACTIVITY_LABEL } from "@/lib/admin/constants";
import { fmtDate, fmtDateTime, statusLabel } from "@/lib/admin/format";
import Flash from "../../../_components/Flash";
import { updateEnquiry, addActivity, setArchived, convertEnquiry, retryEnquiryEmail } from "../actions";

export const metadata = { title: "Enquiry" };

// <input type="datetime-local"> wants Nairobi local time as YYYY-MM-DDTHH:mm
const local = (iso) => (iso ? new Date(new Date(iso).getTime() + 3 * 3600e3).toISOString().slice(0, 16) : "");
const digits = (p) => String(p || "").replace(/[^\d]/g, "");

export default async function EnquiryPage({ params, searchParams }) {
  const s = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  if (!uuid(id)) notFound();

  const { data: e } = await s.supabase.from("enquiries").select("*").eq("id", id).maybeSingle();
  if (!e) notFound();
  if (!e.is_read) await s.supabase.from("enquiries").update({ is_read: true }).eq("id", id);

  const [{ data: acts }, { data: staff }, { data: bookings }, { data: quotes }] = await Promise.all([
    s.supabase.from("activities").select("id, kind, body, created_at, created_by").eq("enquiry_id", id).order("created_at", { ascending: false }).limit(100),
    s.supabase.from("admin_profiles").select("user_id, full_name, email").eq("active", true),
    s.supabase.from("bookings").select("id, reference, title, status").eq("enquiry_id", id),
    s.supabase.from("quotations").select("id, reference, version, title, status, total, currency").eq("enquiry_id", id).order("created_at", { ascending: false }),
  ]);
  const who = Object.fromEntries((staff || []).map((p) => [p.user_id, p.full_name || p.email]));
  const wa = digits(e.whatsapp || e.phone);

  return (
    <>
      <p className="adm-crumb"><Link href="/admin/enquiries">Enquiries</Link> / {e.reference}</p>
      <div className="adm-page-head">
        <div>
          <h1>{e.full_name}</h1>
          <p>{e.reference} · received {fmtDateTime(e.created_at)} · <span className={`adm-badge ab-${e.status}`}>{statusLabel(e.status)}</span>{e.archived_at ? " · Archived" : ""}</p>
        </div>
        <div className="adm-actions">
          {bookings?.[0] ? <Link className="adm-chip on" href={`/admin/bookings/${bookings[0].id}`}>Open booking {bookings[0].reference}</Link> : (
            <form action={convertEnquiry}><input type="hidden" name="id" value={id} /><button className="adm-chip on">Convert to booking</button></form>
          )}
          <Link className="adm-chip" href={`/admin/quotations/new?enquiry=${id}`}>Create quotation</Link>
          <form action={setArchived}><input type="hidden" name="id" value={id} /><input type="hidden" name="archive" value={e.archived_at ? "0" : "1"} /><button className="adm-chip">{e.archived_at ? "Restore" : "Archive"}</button></form>
        </div>
      </div>
      <Flash ok={sp.ok} err={sp.err} />
      {e.email_status === "failed" ? (
        <div className="adm-alert info" role="status">
          The notification email for this enquiry was not delivered{e.email_error ? ` (${e.email_error})` : ""}. The enquiry is safe here.
          <form action={retryEnquiryEmail} style={{ display: "inline", marginLeft: 8 }}><input type="hidden" name="id" value={id} /><button className="adm-chip">Retry email</button></form>
        </div>
      ) : null}

      <div className="adm-two wide-left">
        <div className="adm-stack">
          <div className="adm-card">
            <h2>Contact</h2>
            <dl className="adm-dl">
              <dt>Email</dt><dd>{e.email ? <a href={`mailto:${e.email}`}>{e.email}</a> : "-"}</dd>
              <dt>Phone</dt><dd>{e.phone ? <a href={`tel:${e.phone}`}>{e.phone}</a> : "-"}</dd>
              <dt>WhatsApp</dt><dd>{wa ? <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">Message on WhatsApp</a> : "-"}</dd>
              <dt>Country</dt><dd>{e.country || "-"}</dd>
            </dl>
          </div>
          <div className="adm-card">
            <h2>Trip</h2>
            <dl className="adm-dl">
              <dt>Interested in</dt><dd>{e.trip_title || e.destination || "General enquiry"}</dd>
              <dt>Request type</dt><dd>{e.kind === "book" ? "Booking request" : e.kind === "customize" ? "Customise a trip" : "Enquiry"} via {e.channel}</dd>
              <dt>Preferred dates</dt><dd>{e.preferred_start ? `${fmtDate(e.preferred_start)}${e.preferred_end ? ` to ${fmtDate(e.preferred_end)}` : ""}` : "-"}</dd>
              <dt>Travellers</dt><dd>{e.adults ? `${e.adults} adult${e.adults === 1 ? "" : "s"}${e.children ? `, ${e.children} child${e.children === 1 ? "" : "ren"}${e.child_ages ? ` (ages ${e.child_ages})` : ""}` : ""}` : "-"}</dd>
              <dt>Travel style</dt><dd>{e.accommodation_pref || "-"}</dd>
              <dt>Budget</dt><dd>{e.budget_range || "-"}</dd>
              {e.changes_wanted?.length ? (<><dt>Changes wanted</dt><dd>{e.changes_wanted.join(", ")}</dd></>) : null}
              <dt>Message</dt><dd className="pre">{e.special_requests || "-"}</dd>
              <dt>Sent from</dt><dd className="clip">{e.source_page || "-"}</dd>
            </dl>
          </div>
          {quotes?.length ? (
            <div className="adm-card">
              <h2>Quotations</h2>
              <ul className="rows">{quotes.map((q) => (<li key={q.id}><div><Link href={`/admin/quotations/${q.id}`}><b>{q.reference} v{q.version}</b></Link><small>{q.title}</small></div><div className="r"><span className={`adm-badge ab-${q.status}`}>{statusLabel(q.status)}</span></div></li>))}</ul>
            </div>
          ) : null}
        </div>

        <div className="adm-stack">
          <form className="adm-card adm-form" action={updateEnquiry}>
            <h2>Manage</h2>
            <input type="hidden" name="id" value={id} />
            <label className="adm-field"><span>Status</span>
              <select name="status" defaultValue={e.status}>{ENQUIRY_STATUSES.map((x) => <option key={x} value={x}>{statusLabel(x)}</option>)}</select>
            </label>
            <label className="adm-field"><span>If lost: reason</span><input name="lost_reason" maxLength={300} defaultValue={e.lost_reason || ""} placeholder="e.g. chose another operator, dates changed" /></label>
            <div className="adm-row2">
              <label className="adm-field"><span>Last contact</span><input type="datetime-local" name="last_contact_at" defaultValue={local(e.last_contact_at)} /></label>
              <label className="adm-field"><span>Next follow-up</span><input type="datetime-local" name="next_follow_up_at" defaultValue={local(e.next_follow_up_at)} /></label>
            </div>
            <label className="adm-field"><span>Assigned to</span>
              <select name="assigned_to" defaultValue={e.assigned_to || ""}><option value="">Unassigned</option>{(staff || []).map((p) => <option key={p.user_id} value={p.user_id}>{p.full_name || p.email}</option>)}</select>
            </label>
            <label className="adm-field"><span>Private notes (never shown to the client)</span><textarea name="internal_notes" rows={4} maxLength={4000} defaultValue={e.internal_notes || ""} /></label>
            <button className="adm-btn inline">Save changes</button>
          </form>

          <div className="adm-card">
            <h2>Communication history</h2>
            <form className="adm-form" action={addActivity}>
              <input type="hidden" name="id" value={id} />
              <div className="adm-row2">
                <label className="adm-field"><span>Type</span><select name="kind">{ACTIVITY_KINDS.map((k) => <option key={k} value={k}>{ACTIVITY_LABEL[k]}</option>)}</select></label>
              </div>
              <label className="adm-field"><span>What happened?</span><textarea name="body" rows={2} maxLength={4000} required /></label>
              <button className="adm-btn inline">Add to history</button>
            </form>
            {!acts?.length ? <p className="adm-empty">Nothing recorded yet.</p> : (
              <ul className="rows timeline">
                {acts.map((a) => (<li key={a.id}><div><b>{ACTIVITY_LABEL[a.kind] || a.kind}</b><span className="pre">{a.body}</span></div><div className="r"><small>{fmtDateTime(a.created_at)}</small><small>{a.created_by ? who[a.created_by] || "Staff" : "System"}</small></div></li>))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

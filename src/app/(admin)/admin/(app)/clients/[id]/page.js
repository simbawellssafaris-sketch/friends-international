import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { uuid } from "@/lib/admin/validate";
import { ACTIVITY_KINDS, ACTIVITY_LABEL } from "@/lib/admin/constants";
import { fmtDate, fmtDateTime, money, statusLabel, moneyEntries } from "@/lib/admin/format";
import Flash from "../../../_components/Flash";
import Documents from "../../../_components/Documents";
import { updateClient, archiveClient, addClientNote } from "../actions";

export const metadata = { title: "Client" };
const CONFIRMED = ["confirmed", "in_preparation", "in_progress", "completed"];

export default async function ClientPage({ params, searchParams }) {
  const s = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  if (!uuid(id)) notFound();
  const { data: c } = await s.supabase.from("clients").select("*").eq("id", id).maybeSingle();
  if (!c) notFound();

  const [{ data: enquiries }, { data: bookings }, { data: acts }, { data: quotes }, { data: docs }] = await Promise.all([
    s.supabase.from("enquiries").select("id, reference, trip_title, destination, status, created_at").eq("client_id", id).order("created_at", { ascending: false }),
    s.supabase.from("bookings").select("id, reference, title, status, currency, start_date, end_date, agreed_total, quoted_total").eq("client_id", id).order("start_date", { ascending: false, nullsFirst: true }),
    s.supabase.from("activities").select("id, kind, body, created_at").eq("client_id", id).order("created_at", { ascending: false }).limit(50),
    s.supabase.from("quotations").select("id, reference, version, title, status, total, currency").eq("client_id", id).order("created_at", { ascending: false }),
    s.supabase.from("documents").select("id, kind, filename, sensitive, created_at").eq("client_id", id).order("created_at", { ascending: false }),
  ]);
  const ids = (bookings || []).map((b) => b.id);
  const { data: fin } = ids.length ? await s.supabase.from("booking_financials").select("booking_id, amount_paid, balance").in("booking_id", ids) : { data: [] };
  const finBy = Object.fromEntries((fin || []).map((f) => [f.booking_id, f]));

  const value = {}, paid = {}, owing = {};
  for (const b of bookings || []) {
    if (!CONFIRMED.includes(b.status)) continue;
    const f = finBy[b.id] || {};
    value[b.currency] = (value[b.currency] || 0) + Number(b.agreed_total ?? b.quoted_total ?? 0);
    paid[b.currency] = (paid[b.currency] || 0) + Number(f.amount_paid || 0);
    owing[b.currency] = (owing[b.currency] || 0) + Math.max(0, Number(f.balance || 0));
  }
  const line = (o, none) => (moneyEntries(o).length ? moneyEntries(o).map(([cur, v]) => money(v, cur)).join(" · ") : none);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (bookings || []).filter((b) => b.start_date && b.start_date >= today && CONFIRMED.includes(b.status));

  return (
    <>
      <p className="adm-crumb"><Link href="/admin/clients">Clients</Link> / {c.full_name}</p>
      <div className="adm-page-head">
        <div><h1>{c.full_name}</h1><p>{[c.country, c.email, c.phone].filter(Boolean).join(" · ")}{c.archived_at ? " · Archived" : ""}</p></div>
        <div className="adm-actions">
          <Link className="adm-chip" href={`/admin/quotations/new?client=${id}`}>New quotation</Link>
          <Link className="adm-chip on" href={`/admin/bookings/new?client=${id}`}>New booking</Link>
        </div>
      </div>
      <Flash ok={sp.ok} err={sp.err} />

      <section className="kpi-grid">
        <div className="kpi"><span className="kpi-l">Confirmed booking value</span><span className="kpi-v sm">{line(value, "None yet")}</span></div>
        <div className="kpi"><span className="kpi-l">Payments received</span><span className="kpi-v sm">{line(paid, "None yet")}</span></div>
        <div className="kpi"><span className="kpi-l">Outstanding balance</span><span className="kpi-v sm">{line(owing, "Nothing owed")}</span></div>
        <div className="kpi"><span className="kpi-l">Upcoming trips</span><span className="kpi-v">{upcoming.length}</span></div>
      </section>

      <div className="adm-two wide-left">
        <div className="adm-stack">
          <div className="adm-card">
            <h2>Bookings</h2>
            {!bookings?.length ? <p className="adm-empty">No bookings yet.</p> : (
              <ul className="rows">{bookings.map((b) => (
                <li key={b.id}><div><Link href={`/admin/bookings/${b.id}`}><b>{b.title}</b></Link><small>{b.reference}{b.start_date ? ` · ${fmtDate(b.start_date)}` : ""}</small></div>
                  <div className="r"><span className={`adm-badge ab-${b.status}`}>{statusLabel(b.status)}</span><small>{money(b.agreed_total ?? b.quoted_total ?? 0, b.currency)}{finBy[b.id] ? ` · owing ${money(Math.max(0, finBy[b.id].balance), b.currency)}` : ""}</small></div></li>))}
              </ul>)}
          </div>
          <div className="adm-card">
            <h2>Enquiries</h2>
            {!enquiries?.length ? <p className="adm-empty">No enquiries linked to this client.</p> : (
              <ul className="rows">{enquiries.map((e) => (
                <li key={e.id}><div><Link href={`/admin/enquiries/${e.id}`}><b>{e.trip_title || e.destination || "General enquiry"}</b></Link><small>{e.reference}</small></div>
                  <div className="r"><span className={`adm-badge ab-${e.status}`}>{statusLabel(e.status)}</span><small>{fmtDate(e.created_at)}</small></div></li>))}
              </ul>)}
          </div>
          <div className="adm-card">
            <h2>Quotations</h2>
            {!quotes?.length ? <p className="adm-empty">No quotations yet.</p> : (
              <ul className="rows">{quotes.map((q) => (
                <li key={q.id}><div><Link href={`/admin/quotations/${q.id}`}><b>{q.reference} v{q.version}</b></Link><small>{q.title}</small></div>
                  <div className="r"><span className={`adm-badge ab-${q.status}`}>{statusLabel(q.status)}</span><small>{money(q.total, q.currency)}</small></div></li>))}
              </ul>)}
          </div>
          <Documents docs={docs} clientId={id} />
          <div className="adm-card">
            <h2>Communication history</h2>
            <form className="adm-form" action={addClientNote}>
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
          <form className="adm-card adm-form" action={updateClient}>
            <h2>Details</h2>
            <input type="hidden" name="id" value={id} />
            <label className="adm-field"><span>Full name</span><input name="full_name" required maxLength={120} defaultValue={c.full_name} /></label>
            <label className="adm-field"><span>Email</span><input type="email" name="email" maxLength={200} defaultValue={c.email || ""} /></label>
            <div className="adm-row2">
              <label className="adm-field"><span>Phone</span><input name="phone" maxLength={40} defaultValue={c.phone || ""} /></label>
              <label className="adm-field"><span>WhatsApp</span><input name="whatsapp" maxLength={40} defaultValue={c.whatsapp || ""} /></label>
            </div>
            <label className="adm-field"><span>Country</span><input name="country" maxLength={80} defaultValue={c.country || ""} /></label>
            <label className="adm-field"><span>Travel preferences</span><textarea name="preferences" rows={3} maxLength={2000} defaultValue={c.preferences || ""} /></label>
            <label className="adm-field"><span>Private notes</span><textarea name="notes" rows={3} maxLength={4000} defaultValue={c.notes || ""} /></label>
            <button className="adm-btn inline">Save changes</button>
          </form>
          <form className="adm-card" action={archiveClient}>
            <input type="hidden" name="id" value={id} /><input type="hidden" name="archive" value={c.archived_at ? "0" : "1"} />
            <p className="adm-sub">{c.archived_at ? "This client is archived and hidden from the main list." : "Archiving hides this client from the main list. Their history is kept."}</p>
            <button className="adm-chip">{c.archived_at ? "Restore client" : "Archive client"}</button>
          </form>
        </div>
      </div>
    </>
  );
}

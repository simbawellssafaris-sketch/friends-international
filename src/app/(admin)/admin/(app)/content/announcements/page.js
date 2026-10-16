import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { fmtDateTime } from "@/lib/admin/format";
import Flash from "../../../_components/Flash";
import { saveAnnouncement, deleteAnnouncement } from "../actions";

export const metadata = { title: "Announcements" };
const local = (iso) => (iso ? new Date(new Date(iso).getTime() + 3 * 3600e3).toISOString().slice(0, 16) : "");

function Fields({ a = {} }) {
  return (
    <>
      <label className="adm-field"><span>Message (one short line)</span><input name="message" required maxLength={240} defaultValue={a.message || ""} placeholder="e.g. Book a 2027 migration safari before 30 November and get free airport transfers" /></label>
      <div className="adm-row2">
        <label className="adm-field"><span>Link address (optional)</span><input name="link_url" maxLength={300} defaultValue={a.link_url || ""} placeholder="/#packages or https://..." /></label>
        <label className="adm-field"><span>Link text</span><input name="link_label" maxLength={40} defaultValue={a.link_label || ""} placeholder="See the offer" /></label>
      </div>
      <div className="adm-row2">
        <label className="adm-field"><span>Show from (optional, Nairobi time)</span><input type="datetime-local" name="starts_at" defaultValue={local(a.starts_at)} /></label>
        <label className="adm-field"><span>Hide after (optional)</span><input type="datetime-local" name="ends_at" defaultValue={local(a.ends_at)} /></label>
      </div>
    </>
  );
}

export default async function AnnouncementContent({ searchParams }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const { data: rows } = await s.supabase.from("announcements").select("*").order("created_at", { ascending: false });
  return (
    <>
      <p className="adm-crumb"><Link href="/admin/content">Website content</Link> / Announcements</p>
      <div className="adm-page-head"><div><h1>Announcements</h1><p>A slim banner at the top of every page. If several are live, the newest one shows.</p></div></div>
      <Flash ok={sp.ok} err={sp.err} />
      <form className="adm-card adm-form" action={saveAnnouncement}>
        <h2>New announcement</h2>
        <Fields />
        <div className="adm-actions"><button className="adm-btn inline" name="intent" value="publish">Publish</button><button className="adm-chip" name="intent" value="draft">Save as draft</button></div>
      </form>
      <h2 className="adm-h2">Your announcements</h2>
      {!rows?.length ? <div className="adm-card"><p className="adm-empty">None yet.</p></div> : (
        <div className="adm-stack">{rows.map((a) => {
          const now = Date.now();
          const live = a.status === "published" && (!a.starts_at || new Date(a.starts_at) <= now) && (!a.ends_at || new Date(a.ends_at) > now);
          return (
            <details key={a.id} className="adm-card adm-acc">
              <summary><b>{a.message}</b> <span className={`adm-badge ${live ? "ab-confirmed" : "ab-pending"}`}>{live ? "Live now" : a.status === "published" ? (a.starts_at && new Date(a.starts_at) > now ? `Starts ${fmtDateTime(a.starts_at)}` : "Ended") : "Draft"}</span></summary>
              <form className="adm-form" action={saveAnnouncement}>
                <input type="hidden" name="id" value={a.id} />
                <Fields a={a} />
                <div className="adm-actions">
                  <button className="adm-btn inline" name="intent" value="publish">{a.status === "published" ? "Save and keep published" : "Publish"}</button>
                  <button className="adm-chip" name="intent" value="draft">{a.status === "published" ? "Unpublish (save as draft)" : "Save draft"}</button>
                </div>
              </form>
              <form action={deleteAnnouncement}><input type="hidden" name="id" value={a.id} /><button className="adm-chip">Delete</button></form>
            </details>);
        })}</div>
      )}
    </>
  );
}

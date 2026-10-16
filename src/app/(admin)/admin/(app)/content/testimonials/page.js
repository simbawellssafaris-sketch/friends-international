import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import Flash from "../../../_components/Flash";
import { saveTestimonial, deleteTestimonial } from "../actions";

export const metadata = { title: "Testimonials" };

function Fields({ t = {} }) {
  return (
    <>
      <div className="adm-row2">
        <label className="adm-field"><span>Name</span><input name="author" required maxLength={120} defaultValue={t.author || ""} /></label>
        <label className="adm-field"><span>Trip or country (optional)</span><input name="detail" maxLength={160} defaultValue={t.detail || ""} placeholder="e.g. Family from London, Maasai Mara" /></label>
      </div>
      <label className="adm-field"><span>What they said</span><textarea name="quote" rows={4} required maxLength={1500} defaultValue={t.quote || ""} /></label>
      <div className="adm-row2">
        <label className="adm-field"><span>Stars (optional)</span><select name="rating" defaultValue={t.rating ?? ""}><option value="">No stars</option>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        <label className="adm-field"><span>Order (lower numbers first)</span><input type="number" name="sort" min="0" max="9999" defaultValue={t.sort ?? 0} /></label>
      </div>
    </>
  );
}

export default async function TestimonialContent({ searchParams }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const { data: rows } = await s.supabase.from("testimonials").select("*").order("sort").order("created_at");
  return (
    <>
      <p className="adm-crumb"><Link href="/admin/content">Website content</Link> / Testimonials</p>
      <div className="adm-page-head"><div><h1>Testimonials</h1><p>Shown on the homepage once at least one is published. Only publish real reviews, with the traveller&apos;s permission.</p></div></div>
      <Flash ok={sp.ok} err={sp.err} />
      <form className="adm-card adm-form" action={saveTestimonial}>
        <h2>Add a testimonial</h2>
        <Fields />
        <div className="adm-actions"><button className="adm-btn inline" name="intent" value="publish">Publish</button><button className="adm-chip" name="intent" value="draft">Save as draft</button></div>
      </form>
      <h2 className="adm-h2">Your testimonials</h2>
      {!rows?.length ? <div className="adm-card"><p className="adm-empty">None yet.</p></div> : (
        <div className="adm-stack">{rows.map((t) => (
          <details key={t.id} className="adm-card adm-acc">
            <summary><b>{t.author}</b> <span className={`adm-badge ${t.status === "published" ? "ab-confirmed" : "ab-pending"}`}>{t.status === "published" ? "Published" : "Draft"}</span></summary>
            <form className="adm-form" action={saveTestimonial}>
              <input type="hidden" name="id" value={t.id} />
              <Fields t={t} />
              <div className="adm-actions">
                <button className="adm-btn inline" name="intent" value="publish">{t.status === "published" ? "Save and keep published" : "Publish"}</button>
                <button className="adm-chip" name="intent" value="draft">{t.status === "published" ? "Unpublish (save as draft)" : "Save draft"}</button>
              </div>
            </form>
            <form action={deleteTestimonial}><input type="hidden" name="id" value={t.id} /><button className="adm-chip">Delete</button></form>
          </details>))}
        </div>
      )}
    </>
  );
}

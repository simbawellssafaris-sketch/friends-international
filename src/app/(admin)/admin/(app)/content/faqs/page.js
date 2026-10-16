import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import Flash from "../../../_components/Flash";
import { saveFaq, deleteFaq } from "../actions";

export const metadata = { title: "FAQs" };

function Fields({ f = {} }) {
  return (
    <>
      <label className="adm-field"><span>Question</span><input name="question" required maxLength={300} defaultValue={f.question || ""} /></label>
      <label className="adm-field"><span>Answer</span><textarea name="answer" rows={4} required maxLength={3000} defaultValue={f.answer || ""} /></label>
      <label className="adm-field"><span>Order (lower numbers first)</span><input type="number" name="sort" min="0" max="9999" defaultValue={f.sort ?? 0} /></label>
    </>
  );
}

export default async function FaqContent({ searchParams }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const { data: faqs } = await s.supabase.from("faqs").select("*").order("sort").order("created_at");
  return (
    <>
      <p className="adm-crumb"><Link href="/admin/content">Website content</Link> / FAQs</p>
      <div className="adm-page-head"><div><h1>FAQs</h1><p>Shown on the homepage once at least one is published.</p></div></div>
      <Flash ok={sp.ok} err={sp.err} />
      <form className="adm-card adm-form" action={saveFaq}>
        <h2>Add a question</h2>
        <Fields />
        <div className="adm-actions"><button className="adm-btn inline" name="intent" value="publish">Publish</button><button className="adm-chip" name="intent" value="draft">Save as draft</button></div>
      </form>
      <h2 className="adm-h2">Your questions</h2>
      {!faqs?.length ? <div className="adm-card"><p className="adm-empty">None yet.</p></div> : (
        <div className="adm-stack">{faqs.map((f) => (
          <details key={f.id} className="adm-card adm-acc">
            <summary><b>{f.question}</b> <span className={`adm-badge ${f.status === "published" ? "ab-confirmed" : "ab-pending"}`}>{f.status === "published" ? "Published" : "Draft"}</span></summary>
            <form className="adm-form" action={saveFaq}>
              <input type="hidden" name="id" value={f.id} />
              <Fields f={f} />
              <div className="adm-actions">
                <button className="adm-btn inline" name="intent" value="publish">{f.status === "published" ? "Save and keep published" : "Publish"}</button>
                <button className="adm-chip" name="intent" value="draft">{f.status === "published" ? "Unpublish (save as draft)" : "Save draft"}</button>
              </div>
            </form>
            <form action={deleteFaq}><input type="hidden" name="id" value={f.id} /><button className="adm-chip">Delete</button></form>
          </details>))}
        </div>
      )}
    </>
  );
}

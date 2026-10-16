import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { PACKAGES, DINFO, destByKey } from "@/data/site";
import Flash from "../../../_components/Flash";
import { saveDestination } from "../actions";

export const metadata = { title: "Destination descriptions" };

export default async function DestinationContent({ searchParams }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const { data: rows } = await s.supabase.from("destination_content").select("dest, draft_about, published_about");
  const by = Object.fromEntries((rows || []).map((r) => [r.dest, r]));
  const dests = [...new Set(PACKAGES.flatMap((p) => p.route.map((r) => r.d)))].sort();
  const builtin = (d) => (DINFO[d] || {}).about || (destByKey(d) || {}).blurb || "";
  return (
    <>
      <p className="adm-crumb"><Link href="/admin/content">Website content</Link> / Destinations</p>
      <div className="adm-page-head"><div><h1>Destination descriptions</h1><p>The paragraph about each place, shown on every package that visits it.</p></div></div>
      <Flash ok={sp.ok} err={sp.err} />
      <div className="adm-stack">
        {dests.map((d) => {
          const r = by[d];
          const text = r?.draft_about ?? r?.published_about ?? "";
          return (
            <details key={d} className="adm-card adm-acc" id={`d-${d.replace(/\W+/g, "-")}`} open={sp.ok && false}>
              <summary><b>{d}</b> <span className={`adm-badge ${r?.published_about ? "ab-confirmed" : ""}`}>{r?.published_about ? "Your text is live" : "Built-in text"}</span></summary>
              <form className="adm-form" action={saveDestination}>
                <input type="hidden" name="dest" value={d} />
                <p className="adm-sub"><b>Built-in text:</b> {builtin(d)}</p>
                <label className="adm-field"><span>Your description</span><textarea name="about" rows={5} maxLength={4000} defaultValue={text} /></label>
                <div className="adm-actions">
                  <button className="adm-btn inline" name="intent" value="publish">Publish</button>
                  <button className="adm-chip" name="intent" value="draft">Save draft</button>
                  {r?.published_about ? <button className="adm-chip" name="intent" value="unpublish" formNoValidate>Unpublish (use built-in)</button> : null}
                </div>
              </form>
            </details>
          );
        })}
      </div>
    </>
  );
}

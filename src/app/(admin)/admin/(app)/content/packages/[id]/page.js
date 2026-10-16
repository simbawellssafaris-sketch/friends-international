import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { fmtDateTime } from "@/lib/admin/format";
import { buildPackageView, findPackage } from "@/lib/package-view";
import { safeImage } from "@/lib/content";
import Flash from "../../../../_components/Flash";
import { savePackage } from "../../actions";

export const metadata = { title: "Edit package content" };
const join = (a) => (a || []).join("\n");

export default async function PackageEditor({ params, searchParams }) {
  const s = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const p = findPackage(id);
  if (!p) notFound();
  const { data: row } = await s.supabase.from("package_content").select("listed, draft, published, published_at, updated_at").eq("package_id", id).maybeSingle();
  const d = row?.draft ?? row?.published ?? {};
  const live = !!row?.published;
  const listed = row?.listed !== false;
  const v = buildPackageView(p);
  const image = safeImage(d.image_url) || null;

  return (
    <>
      <p className="adm-crumb"><Link href="/admin/content">Website content</Link> / <Link href="/admin/content/packages">Packages</Link> / {p.title}</p>
      <div className="adm-page-head">
        <div>
          <h1>{p.title}</h1>
          <p>{v.routeText} · {p.days} days · {v.tierLabel} · {live ? `published ${fmtDateTime(row.published_at)}` : "using the built-in text"}{listed ? "" : " · HIDDEN from the site"}</p>
        </div>
        <div className="adm-actions">
          <Link className="adm-chip" href={`/preview/packages/${p.id}`} target="_blank">Preview draft</Link>
          {listed ? <Link className="adm-chip" href={`/packages/${p.id}`} target="_blank">View live page</Link> : null}
        </div>
      </div>
      <Flash ok={sp.ok} err={sp.err} />
      <p className="adm-sub">Leave a field empty to keep the built-in text, which is shown faintly inside each box. Save as draft to keep working; Publish makes it live.</p>

      <form className="adm-card adm-form" action={savePackage} encType="multipart/form-data">
        <input type="hidden" name="package_id" value={p.id} />
        <input type="hidden" name="current_image" value={image || ""} />

        <label className="adm-field"><span>Title</span><input name="title" maxLength={150} defaultValue={d.title || ""} placeholder={p.title} /></label>
        <label className="adm-field"><span>Price label (shown on the card and the booking box)</span><input name="price_label" maxLength={80} defaultValue={d.price_label || ""} placeholder="On request" />
          <small className="adm-hint">For example &quot;On request&quot; or &quot;From USD 1,600 per person sharing&quot;. Only publish a price you will honour.</small></label>
        <label className="adm-field"><span>Introduction (top of the Overview)</span><textarea name="intro" rows={4} maxLength={2000} defaultValue={d.intro || ""} placeholder={v.intro} /></label>
        <label className="adm-field"><span>Highlights (one per line, up to 12)</span><textarea name="highlights" rows={5} maxLength={3000} defaultValue={join(d.highlights)} placeholder={join(v.highlights.slice(0, 5))} /></label>
        <div className="adm-row2">
          <label className="adm-field"><span>Extra things included (one per line)</span><textarea name="extra_included" rows={4} defaultValue={join(d.extra_included)} placeholder="Added to the built-in included list" /></label>
          <label className="adm-field"><span>Extra things not included (one per line)</span><textarea name="extra_excluded" rows={4} defaultValue={join(d.extra_excluded)} placeholder="Added to the built-in not-included list" /></label>
        </div>
        <details className="adm-ref"><summary>Show the built-in included / not included lists</summary>
          <div className="adm-row2"><ul>{v.inclusions.inc.map((x) => <li key={x}>{x}</li>)}</ul><ul>{v.inclusions.exc.map((x) => <li key={x}>{x}</li>)}</ul></div></details>

        <label className="adm-field"><span>Note above the itinerary</span><textarea name="itinerary_notes" rows={2} maxLength={2000} defaultValue={d.itinerary_notes || ""} placeholder="Optional, for example: flights are subject to schedule" /></label>
        <details className="adm-ref"><summary>Edit individual days ({p.days} days)</summary>
          {v.itinerary.map((day) => (
            <div className="adm-day" key={day.n}>
              <b>Day {day.n}</b>
              <input name={`day_title_${day.n}`} maxLength={150} defaultValue={d.day_overrides?.[day.n]?.title || ""} placeholder={day.title} aria-label={`Day ${day.n} title`} />
              <textarea name={`day_text_${day.n}`} rows={2} maxLength={1000} defaultValue={d.day_overrides?.[day.n]?.text || ""} placeholder={day.travel} aria-label={`Day ${day.n} text`} />
            </div>
          ))}
        </details>

        <div className="adm-field"><span>Main picture</span>
          <div className="adm-pic"><img src={image || p.img} alt="" width="180" height="110" /><div>
            <input type="file" name="image" accept="image/jpeg,image/png,image/webp" />
            <small className="adm-hint">JPG, PNG or WebP, up to 5 MB, landscape works best. {image ? "A custom picture is set." : "Using the built-in picture."}</small>
            {image ? <label className="adm-check"><input type="checkbox" name="remove_image" value="1" /> Remove my picture and use the built-in one</label> : null}
          </div></div>
        </div>

        <div className="adm-actions">
          <button className="adm-btn inline" name="intent" value="publish">Publish</button>
          <button className="adm-chip" name="intent" value="draft">Save draft</button>
          {live ? <button className="adm-chip" name="intent" value="unpublish" formNoValidate>Unpublish my edits</button> : null}
        </div>
      </form>

      <form className="adm-card" action={savePackage}>
        <input type="hidden" name="package_id" value={p.id} />
        <h2>{listed ? "Hide this package" : "This package is hidden"}</h2>
        <p className="adm-sub">{listed ? "Hiding removes it from every list and makes its page unavailable to visitors. Your edits are kept." : "Visitors cannot see this package. Show it again to put it back on the site."}</p>
        <button className="adm-chip" name="intent" value={listed ? "hide" : "show"}>{listed ? "Hide from the website" : "Show on the website"}</button>
      </form>
    </>
  );
}

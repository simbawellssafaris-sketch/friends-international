import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { searchTerm, pageNum, oneOf } from "@/lib/admin/validate";
import { PACKAGES } from "@/data/site";
import Pager from "../../../_components/Pager";
import Flash from "../../../_components/Flash";

export const metadata = { title: "Package content" };
const PER = 25;
const tierName = { budget: "Budget", mid: "Mid-range", luxury: "Luxury" };

// built-in | draft | published | changed (draft differs from what is live)
const stateOf = (row) => {
  if (!row || (!row.draft && !row.published)) return "builtin";
  if (!row.published) return "draft";
  return JSON.stringify(row.draft ?? null) === JSON.stringify(row.published) ? "published" : "changed";
};
const LABEL = { builtin: "Built-in text", draft: "Draft only", published: "Published edits", changed: "Published + unpublished changes", hidden: "Hidden from site" };

export default async function PackageContentList({ searchParams }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const q = searchTerm(sp.q).toLowerCase();
  const filter = oneOf(sp.state, ["builtin", "draft", "published", "changed", "hidden"], "");
  const page = pageNum(sp.page);
  const { data: rows } = await s.supabase.from("package_content").select("package_id, listed, draft, published");
  const by = Object.fromEntries((rows || []).map((r) => [r.package_id, r]));

  let list = PACKAGES.map((p) => ({ p, row: by[p.id], state: by[p.id]?.listed === false ? "hidden" : stateOf(by[p.id]) }));
  if (q) list = list.filter(({ p }) => `${p.title} ${p.id} ${p.route.map((r) => r.d).join(" ")}`.toLowerCase().includes(q));
  if (filter) list = list.filter((x) => x.state === filter);
  const total = list.length;
  list = list.slice((page - 1) * PER, page * PER);

  return (
    <>
      <p className="adm-crumb"><Link href="/admin/content">Website content</Link> / Packages</p>
      <div className="adm-page-head"><div><h1>Package content</h1><p>Your {PACKAGES.length} packages. Open one to edit its text, picture and price label.</p></div></div>
      <Flash ok={sp.ok} err={sp.err} />
      <form className="adm-toolbar" method="get" action="/admin/content/packages">
        <input name="q" defaultValue={sp.q || ""} placeholder="Search by name or destination" aria-label="Search" />
        <select name="state" defaultValue={filter} aria-label="State"><option value="">All</option>{Object.entries(LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <button className="adm-chip on">Filter</button>
      </form>
      {!list.length ? <div className="adm-card"><p className="adm-empty">No packages match.</p></div> : (
        <div className="adm-card flush"><div className="adm-scroll"><table className="adm-table">
          <thead><tr><th>Package</th><th>Level</th><th>Days</th><th>Content</th><th /></tr></thead>
          <tbody>{list.map(({ p, state }) => (
            <tr key={p.id}>
              <td data-l="Package"><Link href={`/admin/content/packages/${p.id}`}><b>{p.title}</b></Link><small>{p.route.map((r) => r.d).join(" · ")}</small></td>
              <td data-l="Level">{tierName[p.tier]}</td><td data-l="Days">{p.days}</td>
              <td data-l="Content"><span className={`adm-badge ${state === "published" ? "ab-confirmed" : state === "hidden" ? "ab-lost" : state === "builtin" ? "" : "ab-pending"}`}>{LABEL[state]}</span></td>
              <td><Link className="adm-chip" href={`/admin/content/packages/${p.id}`}>Edit</Link></td>
            </tr>))}
          </tbody>
        </table></div></div>
      )}
      <Pager base="/admin/content/packages" params={{ q: sp.q || "", state: filter }} page={page} perPage={PER} total={total} />
    </>
  );
}

import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { pageNum, oneOf, searchTerm } from "@/lib/admin/validate";
import { QUOTE_STATUSES } from "@/lib/admin/constants";
import { fmtDate, money, statusLabel } from "@/lib/admin/format";
import Pager from "../../_components/Pager";
import Flash from "../../_components/Flash";

export const metadata = { title: "Quotations" };
const PER = 25;

export default async function QuotationsPage({ searchParams }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const q = searchTerm(sp.q);
  const status = oneOf(sp.status, QUOTE_STATUSES, "");
  const page = pageNum(sp.page);
  let query = s.supabase.from("quotations").select("id, reference, version, title, status, total, currency, issue_date, valid_until, sent_at, clients(full_name)", { count: "exact" });
  if (status) query = query.eq("status", status);
  if (q) {
    const { data: cl } = await s.supabase.from("clients").select("id").ilike("full_name", `%${q}%`).limit(50);
    const parts = ["title", "reference"].map((c) => `${c}.ilike.%${q}%`);
    if (cl?.length) parts.push(`client_id.in.(${cl.map((c) => c.id).join(",")})`);
    query = query.or(parts.join(","));
  }
  const { data: rows, count } = await query.order("created_at", { ascending: false }).range((page - 1) * PER, page * PER - 1);
  return (
    <>
      <div className="adm-page-head">
        <div><h1>Quotations</h1><p>Priced proposals. A quotation is not a booking until it is accepted and converted.</p></div>
        <Link className="adm-chip on" href="/admin/quotations/new">New quotation</Link>
      </div>
      <Flash ok={sp.ok} err={sp.err} />
      <form className="adm-toolbar" method="get" action="/admin/quotations">
        <input name="q" defaultValue={q} placeholder="Search client, title or reference" aria-label="Search" />
        <select name="status" defaultValue={status} aria-label="Status"><option value="">All statuses</option>{QUOTE_STATUSES.map((x) => <option key={x} value={x}>{statusLabel(x)}</option>)}</select>
        <button className="adm-chip on">Filter</button>
      </form>
      {!rows?.length ? <div className="adm-card"><p className="adm-empty">{q || status ? "No quotations match." : "No quotations yet. Create one from an enquiry or a client."}</p></div> : (
        <div className="adm-card flush"><div className="adm-scroll"><table className="adm-table">
          <thead><tr><th>Quotation</th><th>Client</th><th>Total</th><th>Issued</th><th>Valid until</th><th>Status</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.id}>
              <td data-l="Quotation"><Link href={`/admin/quotations/${r.id}`}><b>{r.reference} v{r.version}</b></Link><small>{r.title}</small></td>
              <td data-l="Client">{r.clients?.full_name}</td>
              <td data-l="Total">{money(r.total, r.currency)}</td>
              <td data-l="Issued">{fmtDate(r.issue_date)}</td>
              <td data-l="Valid until">{r.valid_until ? fmtDate(r.valid_until) : "-"}</td>
              <td data-l="Status"><span className={`adm-badge ab-${r.status}`}>{statusLabel(r.status)}</span></td>
            </tr>))}
          </tbody>
        </table></div></div>
      )}
      <Pager base="/admin/quotations" params={{ q, status }} page={page} perPage={PER} total={count ?? 0} />
    </>
  );
}

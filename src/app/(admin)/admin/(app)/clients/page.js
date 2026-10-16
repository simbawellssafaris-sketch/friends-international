import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { searchTerm, pageNum, oneOf } from "@/lib/admin/validate";
import { fmtDate } from "@/lib/admin/format";
import Pager from "../../_components/Pager";
import Flash from "../../_components/Flash";

export const metadata = { title: "Clients" };
const PER = 25;

export default async function ClientsPage({ searchParams }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const q = searchTerm(sp.q);
  const view = oneOf(sp.view, ["active", "archived"], "active");
  const page = pageNum(sp.page);

  let query = s.supabase.from("clients").select("id, full_name, email, phone, country, created_at", { count: "exact" });
  query = view === "archived" ? query.not("archived_at", "is", null) : query.is("archived_at", null);
  if (q) query = query.or(["full_name", "email", "phone", "whatsapp", "country"].map((c) => `${c}.ilike.%${q}%`).join(","));
  const { data: rows, count, error } = await query.order("full_name").range((page - 1) * PER, page * PER - 1);
  const params = { q, view: view === "active" ? "" : view };
  const exportQs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();

  return (
    <>
      <div className="adm-page-head">
        <div><h1>Clients</h1><p>Everyone you have quoted or booked, with their full history.</p></div>
        <div className="adm-actions">
          <a className="adm-chip" href={`/admin/clients/export${exportQs ? `?${exportQs}` : ""}`}>Export CSV</a>
          <Link className="adm-chip on" href="/admin/clients/new">Add client</Link>
        </div>
      </div>
      <Flash ok={sp.ok} err={sp.err} />
      <form className="adm-toolbar" method="get" action="/admin/clients">
        <input name="q" defaultValue={q} placeholder="Search name, email, phone or country" aria-label="Search" />
        <select name="view" defaultValue={view} aria-label="View"><option value="active">Active</option><option value="archived">Archived</option></select>
        <button className="adm-chip on">Filter</button>
      </form>
      {error ? <div className="adm-alert err">The list could not be loaded. Please try again.</div> : null}
      {!rows?.length ? (
        <div className="adm-card"><p className="adm-empty">{q ? "No clients match your search." : "No clients yet. They are added automatically when you convert an enquiry into a booking, or you can add one yourself."}</p></div>
      ) : (
        <div className="adm-card flush"><div className="adm-scroll">
          <table className="adm-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Country</th><th>Added</th><th /></tr></thead>
            <tbody>{rows.map((c) => (
              <tr key={c.id}>
                <td data-l="Name"><Link href={`/admin/clients/${c.id}`}><b>{c.full_name}</b></Link></td>
                <td data-l="Email">{c.email || "-"}</td><td data-l="Phone">{c.phone || "-"}</td><td data-l="Country">{c.country || "-"}</td>
                <td data-l="Added">{fmtDate(c.created_at)}</td>
                <td><Link className="adm-chip" href={`/admin/clients/${c.id}`}>Open</Link></td>
              </tr>))}
            </tbody>
          </table>
        </div></div>
      )}
      <Pager base="/admin/clients" params={params} page={page} perPage={PER} total={count ?? 0} />
    </>
  );
}

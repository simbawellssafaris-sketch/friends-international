import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { searchTerm, pageNum, oneOf } from "@/lib/admin/validate";
import { fmtDate, timeAgo, statusLabel } from "@/lib/admin/format";
import Pager from "../../_components/Pager";
import Flash from "../../_components/Flash";
import { ENQUIRY_STATUSES } from "@/lib/admin/constants";

export const metadata = { title: "Enquiries" };

const PER = 25;

const SORTS = { newest: ["created_at", false], oldest: ["created_at", true], followup: ["next_follow_up_at", true] };

export default async function EnquiriesPage({ searchParams }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const q = searchTerm(sp.q);
  const status = oneOf(sp.status, ENQUIRY_STATUSES, "");
  const sort = oneOf(sp.sort, Object.keys(SORTS), "newest");
  const view = oneOf(sp.view, ["active", "archived", "unread"], "active");
  const page = pageNum(sp.page);

  let query = s.supabase
    .from("enquiries")
    .select("id, reference, full_name, email, phone, trip_title, destination, status, is_read, created_at, next_follow_up_at, preferred_start, adults, children, email_status", { count: "exact" });
  query = view === "archived" ? query.not("archived_at", "is", null) : query.is("archived_at", null);
  if (view === "unread") query = query.eq("is_read", false);
  if (status) query = query.eq("status", status);
  if (q) query = query.or(["full_name", "email", "phone", "reference", "trip_title", "destination"].map((c) => `${c}.ilike.%${q}%`).join(","));
  const [col, asc] = SORTS[sort];
  query = query.order(col, { ascending: asc, nullsFirst: false }).range((page - 1) * PER, page * PER - 1);
  const { data: rows, count, error } = await query;

  const params = { q, status, sort: sort === "newest" ? "" : sort, view: view === "active" ? "" : view };
  const exportQs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();

  return (
    <>
      <div className="adm-page-head">
        <div><h1>Enquiries</h1><p>Every request from your website, in one place.</p></div>
        <a className="adm-chip" href={`/admin/enquiries/export${exportQs ? `?${exportQs}` : ""}`}>Export CSV</a>
      </div>
      <Flash ok={sp.ok} err={sp.err} />

      <form className="adm-toolbar" method="get" action="/admin/enquiries">
        <input name="q" defaultValue={q} placeholder="Search name, email, phone, reference or trip" aria-label="Search" />
        <select name="status" defaultValue={status} aria-label="Status">
          <option value="">All statuses</option>
          {ENQUIRY_STATUSES.map((x) => <option key={x} value={x}>{statusLabel(x)}</option>)}
        </select>
        <select name="view" defaultValue={view} aria-label="View">
          <option value="active">Active</option><option value="unread">Unread only</option><option value="archived">Archived</option>
        </select>
        <select name="sort" defaultValue={sort} aria-label="Sort">
          <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="followup">Follow-up date</option>
        </select>
        <button className="adm-chip on">Filter</button>
      </form>

      {error ? <div className="adm-alert err">The list could not be loaded. Please try again.</div> : null}
      {!rows?.length ? (
        <div className="adm-card"><p className="adm-empty">{q || status || view !== "active" ? "No enquiries match these filters." : "No enquiries yet. They appear here as soon as someone submits a form on your website."}</p></div>
      ) : (
        <div className="adm-card flush">
          <div className="adm-scroll">
            <table className="adm-table">
              <thead><tr><th>Received</th><th>Name</th><th>Interested in</th><th>Travellers</th><th>Status</th><th>Follow-up</th><th /></tr></thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id} className={e.is_read ? "" : "unread"}>
                    <td data-l="Received">{timeAgo(e.created_at)}<small>{e.reference}</small></td>
                    <td data-l="Name"><Link href={`/admin/enquiries/${e.id}`}><b>{e.full_name}</b></Link><small>{e.email || e.phone}</small></td>
                    <td data-l="Interested in">{e.trip_title || e.destination || "General enquiry"}{e.preferred_start ? <small>from {fmtDate(e.preferred_start)}</small> : null}</td>
                    <td data-l="Travellers">{e.adults ? `${e.adults} adult${e.adults === 1 ? "" : "s"}${e.children ? `, ${e.children} child${e.children === 1 ? "" : "ren"}` : ""}` : "-"}</td>
                    <td data-l="Status"><span className={`adm-badge ab-${e.status}`}>{statusLabel(e.status)}</span>{e.email_status === "failed" ? <small className="late">Email not sent</small> : null}</td>
                    <td data-l="Follow-up">{e.next_follow_up_at ? fmtDate(e.next_follow_up_at) : "-"}</td>
                    <td><Link className="adm-chip" href={`/admin/enquiries/${e.id}`}>Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pager base="/admin/enquiries" params={params} page={page} perPage={PER} total={count ?? 0} />
    </>
  );
}

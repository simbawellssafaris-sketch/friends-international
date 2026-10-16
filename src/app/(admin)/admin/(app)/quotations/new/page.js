import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { uuid } from "@/lib/admin/validate";
import { CURRENCIES } from "@/lib/admin/constants";
import Flash from "../../../_components/Flash";
import QuoteFields from "../../../_components/QuoteFields";
import QuoteLines from "../../../_components/QuoteLines";
import { findClient } from "@/lib/admin/clients";
import { createQuotation } from "../actions";

export const metadata = { title: "New quotation" };

export default async function NewQuotation({ searchParams }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  let clientId = uuid(sp.client);
  const enquiryId = uuid(sp.enquiry);
  let enquiry = null;
  if (enquiryId) {
    const { data } = await s.supabase.from("enquiries").select("*").eq("id", enquiryId).maybeSingle();
    enquiry = data;
    // starting from an enquiry: preselect the matching client if there is one (nothing is created just by opening this page)
    if (enquiry && !clientId) clientId = enquiry.client_id || (await findClient(s.supabase, enquiry));
  }
  const { data: clients } = await s.supabase.from("clients").select("id, full_name, email").is("archived_at", null).order("full_name").limit(500);
  return (
    <>
      <p className="adm-crumb"><Link href="/admin/quotations">Quotations</Link> / New</p>
      <div className="adm-page-head"><div><h1>New quotation</h1><p>{enquiry ? `From enquiry ${enquiry.reference}` : "Build a priced proposal for a client."}</p></div></div>
      <Flash err={sp.err} />
      {!clients?.length && !enquiry ? (
        <div className="adm-card"><p className="adm-empty">Add a client first. <Link href="/admin/clients/new" className="adm-chip on">Add client</Link></p></div>
      ) : (
        <form className="adm-card adm-form" action={createQuotation}>
          {enquiryId ? <input type="hidden" name="enquiry_id" value={enquiryId} /> : null}
          <label className="adm-field"><span>Client</span>
            <select name="client_id" required defaultValue={clientId || (enquiry ? "new" : "")}>
              <option value="" disabled>Choose a client</option>
              {enquiry && !clientId ? <option value="new">Create a new client from this enquiry ({enquiry.full_name})</option> : null}
              {clients.map((c) => <option key={c.id} value={c.id}>{c.full_name}{c.email ? ` (${c.email})` : ""}</option>)}
            </select>
          </label>
          <QuoteFields q={{ title: enquiry?.trip_title || enquiry?.destination || "" }} />
          <QuoteLines currencies={CURRENCIES} currency="USD" taxRate={0} />
          <button className="adm-btn inline">Save as draft</button>
        </form>
      )}
    </>
  );
}

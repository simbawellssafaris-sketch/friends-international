import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { uuid } from "@/lib/admin/validate";
import Flash from "../../../_components/Flash";
import BookingFields from "../../../_components/BookingFields";
import { createBooking } from "../actions";

export const metadata = { title: "New booking" };

export default async function NewBooking({ searchParams }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const clientId = uuid(sp.client);
  const [{ data: clients }, { data: statuses }] = await Promise.all([
    s.supabase.from("clients").select("id, full_name, email").is("archived_at", null).order("full_name").limit(500),
    s.supabase.from("booking_statuses").select("code, label").eq("active", true).order("sort"),
  ]);
  return (
    <>
      <p className="adm-crumb"><Link href="/admin/bookings">Bookings</Link> / New</p>
      <div className="adm-page-head"><div><h1>New booking</h1></div></div>
      <Flash err={sp.err} />
      {!clients?.length ? (
        <div className="adm-card"><p className="adm-empty">Add a client first, then create their booking. <Link href="/admin/clients/new" className="adm-chip on">Add client</Link></p></div>
      ) : (
        <form className="adm-card adm-form narrow" action={createBooking}>
          <label className="adm-field"><span>Client</span>
            <select name="client_id" required defaultValue={clientId || ""}>
              <option value="" disabled>Choose a client</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.full_name}{c.email ? ` (${c.email})` : ""}</option>)}
            </select>
          </label>
          <BookingFields statuses={statuses || []} />
          <button className="adm-btn inline">Create booking</button>
        </form>
      )}
    </>
  );
}

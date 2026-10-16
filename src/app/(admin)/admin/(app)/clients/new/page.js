import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import Flash from "../../../_components/Flash";
import { createClient } from "../actions";

export const metadata = { title: "Add client" };

export default async function NewClient({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  return (
    <>
      <p className="adm-crumb"><Link href="/admin/clients">Clients</Link> / New</p>
      <div className="adm-page-head"><div><h1>Add client</h1></div></div>
      <Flash err={sp.err} />
      <form className="adm-card adm-form narrow" action={createClient}>
        <label className="adm-field"><span>Full name</span><input name="full_name" required maxLength={120} /></label>
        <div className="adm-row2">
          <label className="adm-field"><span>Email</span><input type="email" name="email" maxLength={200} /></label>
          <label className="adm-field"><span>Phone</span><input name="phone" maxLength={40} /></label>
        </div>
        <div className="adm-row2">
          <label className="adm-field"><span>WhatsApp</span><input name="whatsapp" maxLength={40} /></label>
          <label className="adm-field"><span>Country</span><input name="country" maxLength={80} /></label>
        </div>
        <label className="adm-field"><span>Travel preferences</span><textarea name="preferences" rows={3} maxLength={2000} /></label>
        <label className="adm-field"><span>Private notes</span><textarea name="notes" rows={3} maxLength={4000} /></label>
        <p className="adm-sub">An email address or a phone number is needed so you can reach this person.</p>
        <button className="adm-btn inline">Save client</button>
      </form>
    </>
  );
}

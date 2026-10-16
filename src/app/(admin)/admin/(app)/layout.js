import { requireAdmin } from "@/lib/admin/session";
import { signOutAction } from "../actions";
import AdminNav from "../_components/AdminNav";

// Every signed-in admin page goes through this layout, which checks authorisation on the server first.
export default async function AppLayout({ children }) {
  const s = await requireAdmin();
  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="adm-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.png" alt="" width="46" height="44" />
          <div><b>Friends International</b><span>ADMIN</span></div>
        </div>
        <AdminNav />
        <div className="adm-side-foot">
          <span>Signed in as</span>
          <b>{s.profile.full_name || s.profile.email}</b>
          <form action={signOutAction}><button className="adm-btn">Sign out</button></form>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}

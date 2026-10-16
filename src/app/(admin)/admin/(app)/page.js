import { requireAdmin } from "@/lib/admin/session";

export const metadata = { title: "Dashboard" };

const count = async (s, table) => {
  const { count: n } = await s.supabase.from(table).select("id", { count: "exact", head: true });
  return n ?? 0;
};

// Stage 2 placeholder-free starting page: real record counts, read through the signed-in administrator's permissions.
export default async function Dashboard() {
  const s = await requireAdmin();
  const [enquiries, clients, bookings] = await Promise.all([count(s, "enquiries"), count(s, "clients"), count(s, "bookings")]);
  return (
    <>
      <div className="adm-page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back{s.profile.full_name ? `, ${s.profile.full_name}` : ""}.</p>
        </div>
      </div>
      <div className="adm-grid">
        {[["Enquiries", enquiries], ["Clients", clients], ["Bookings", bookings]].map(([label, n]) => (
          <div className="adm-card" key={label}>
            <p className="adm-sub" style={{ margin: 0 }}>{label}</p>
            <h2 style={{ fontSize: "2rem", margin: 0 }}>{n}</h2>
            {n === 0 ? <p className="adm-empty">Nothing here yet.</p> : null}
          </div>
        ))}
      </div>
    </>
  );
}

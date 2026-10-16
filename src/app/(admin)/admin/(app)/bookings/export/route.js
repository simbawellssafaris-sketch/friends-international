import { requireAdmin, audit } from "@/lib/admin/session";
import { searchTerm, oneOf } from "@/lib/admin/validate";
import { toCsv, csvResponse } from "@/lib/admin/csv";
import { todayEAT } from "@/lib/admin/format";

export async function GET(request) {
  const s = await requireAdmin();
  const sp = Object.fromEntries(new URL(request.url).searchParams);
  const q = searchTerm(sp.q);
  const { data: statuses } = await s.supabase.from("booking_statuses").select("code");
  const status = oneOf(sp.status, (statuses || []).map((x) => x.code), "");
  const when = oneOf(sp.when, ["all", "upcoming", "past"], "all");
  const view = oneOf(sp.view, ["active", "archived"], "active");

  let query = s.supabase.from("bookings").select("*, clients(full_name, email)").order("start_date", { ascending: false, nullsFirst: false }).limit(5000);
  query = view === "archived" ? query.not("archived_at", "is", null) : query.is("archived_at", null);
  if (status) query = query.eq("status", status);
  if (when === "upcoming") query = query.gte("start_date", todayEAT());
  if (when === "past") query = query.lt("start_date", todayEAT());
  if (q) query = query.or(["title", "reference", "destination"].map((c) => `${c}.ilike.%${q}%`).join(","));
  const { data, error } = await query;
  if (error) return new Response("Export failed", { status: 500 });
  const { data: fin } = await s.supabase.from("booking_financials").select("booking_id, amount_paid, balance").in("booking_id", data.map((b) => b.id).slice(0, 1000));
  const finBy = Object.fromEntries((fin || []).map((f) => [f.booking_id, f]));

  await audit(s, "booking.export", "booking", null, { rows: data.length });
  return csvResponse("bookings", toCsv(data, [
    ["Reference", "reference"], ["Status", "status"], ["Client", (r) => r.clients?.full_name], ["Client email", (r) => r.clients?.email],
    ["Trip", "title"], ["Destination", "destination"], ["Start", "start_date"], ["End", "end_date"], ["Adults", "adults"], ["Children", "children"],
    ["Currency", "currency"], ["Quoted price", "quoted_total"], ["Agreed price", "agreed_total"], ["Deposit required", "deposit_required"],
    ["Paid", (r) => finBy[r.id]?.amount_paid], ["Balance", (r) => finBy[r.id]?.balance], ["Payment deadline", "payment_deadline"],
    ["Guide / supplier", "guide_or_supplier"], ["Created", "created_at"],
  ]));
}

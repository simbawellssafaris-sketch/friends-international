import { requireAdmin, audit } from "@/lib/admin/session";
import { searchTerm, oneOf } from "@/lib/admin/validate";
import { ENQUIRY_STATUSES } from "@/lib/admin/constants";
import { toCsv, csvResponse } from "@/lib/admin/csv";

// CSV of the enquiries matching the same filters as the list (administrators only, capped at 5,000 rows).
export async function GET(request) {
  const s = await requireAdmin();
  const sp = Object.fromEntries(new URL(request.url).searchParams);
  const q = searchTerm(sp.q);
  const status = oneOf(sp.status, ENQUIRY_STATUSES, "");
  const view = oneOf(sp.view, ["active", "archived", "unread"], "active");

  let query = s.supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(5000);
  query = view === "archived" ? query.not("archived_at", "is", null) : query.is("archived_at", null);
  if (view === "unread") query = query.eq("is_read", false);
  if (status) query = query.eq("status", status);
  if (q) query = query.or(["full_name", "email", "phone", "reference", "trip_title", "destination"].map((c) => `${c}.ilike.%${q}%`).join(","));
  const { data, error } = await query;
  if (error) return new Response("Export failed", { status: 500 });

  await audit(s, "enquiry.export", "enquiry", null, { rows: data.length, status, view, q });
  return csvResponse("enquiries", toCsv(data, [
    ["Reference", "reference"], ["Received", "created_at"], ["Status", "status"], ["Name", "full_name"], ["Email", "email"], ["Phone", "phone"],
    ["WhatsApp", "whatsapp"], ["Country", "country"], ["Interested in", (r) => r.trip_title || r.destination], ["Request type", "kind"], ["Channel", "channel"],
    ["Preferred start", "preferred_start"], ["Preferred end", "preferred_end"], ["Adults", "adults"], ["Children", "children"],
    ["Travel style", "accommodation_pref"], ["Budget", "budget_range"], ["Message", "special_requests"], ["Last contact", "last_contact_at"],
    ["Next follow-up", "next_follow_up_at"], ["Lost reason", "lost_reason"], ["Source page", "source_page"],
  ]));
}

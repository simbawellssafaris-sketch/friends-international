import { requireAdmin, audit } from "@/lib/admin/session";
import { searchTerm, oneOf } from "@/lib/admin/validate";
import { toCsv, csvResponse } from "@/lib/admin/csv";

export async function GET(request) {
  const s = await requireAdmin();
  const sp = Object.fromEntries(new URL(request.url).searchParams);
  const q = searchTerm(sp.q);
  const view = oneOf(sp.view, ["active", "archived"], "active");
  let query = s.supabase.from("clients").select("*").order("full_name").limit(5000);
  query = view === "archived" ? query.not("archived_at", "is", null) : query.is("archived_at", null);
  if (q) query = query.or(["full_name", "email", "phone", "whatsapp", "country"].map((c) => `${c}.ilike.%${q}%`).join(","));
  const { data, error } = await query;
  if (error) return new Response("Export failed", { status: 500 });
  await audit(s, "client.export", "client", null, { rows: data.length, view, q });
  return csvResponse("clients", toCsv(data, [
    ["Name", "full_name"], ["Email", "email"], ["Phone", "phone"], ["WhatsApp", "whatsapp"], ["Country", "country"],
    ["Preferences", "preferences"], ["Notes", "notes"], ["Added", "created_at"],
  ]));
}

import { requireAdmin, audit } from "@/lib/admin/session";
import { uuid } from "@/lib/admin/validate";
import { quotationPdf } from "@/lib/pdf/quotation";

export const runtime = "nodejs";

// Branded PDF of a quotation (administrators only).
export async function GET(_request, { params }) {
  const s = await requireAdmin();
  const { id } = await params;
  if (!uuid(id)) return new Response("Not found", { status: 404 });
  const { data: q } = await s.supabase.from("quotations").select("*, clients(full_name, email, phone)").eq("id", id).maybeSingle();
  if (!q) return new Response("Not found", { status: 404 });
  const { data: items } = await s.supabase.from("quotation_items").select("*").eq("quotation_id", id).order("sort");
  try {
    const pdf = await quotationPdf({ q, items: items || [], client: q.clients });
    await audit(s, "quotation.pdf", "quotation", id);
    return new Response(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${q.reference}-v${q.version}.pdf"`, "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[quotation] pdf failed:", e?.message);
    return new Response("The PDF could not be created", { status: 500 });
  }
}

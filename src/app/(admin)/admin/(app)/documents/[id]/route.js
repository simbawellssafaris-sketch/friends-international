import { NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/admin/session";
import { uuid } from "@/lib/admin/validate";

// Opens a private document through a signed link that expires after one minute. Administrators only; every open is logged.
export async function GET(request, { params }) {
  const s = await requireAdmin();
  const { id } = await params;
  if (!uuid(id)) return new Response("Not found", { status: 404 });
  const { data: d } = await s.supabase.from("documents").select("id, filename, storage_path").eq("id", id).maybeSingle();
  if (!d) return new Response("Not found", { status: 404 });
  const { data, error } = await s.supabase.storage.from("client-documents").createSignedUrl(d.storage_path, 60, { download: false });
  if (error || !data?.signedUrl) return new Response("The file could not be opened", { status: 500 });
  await audit(s, "document.view", "document", id);
  const res = NextResponse.redirect(data.signedUrl);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

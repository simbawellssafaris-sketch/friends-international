"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { requireAdmin, audit } from "@/lib/admin/session";
import { oneOf, uuid } from "@/lib/admin/validate";
import { DOC_KINDS } from "@/lib/admin/constants";

const MAX_BYTES = 10 * 1024 * 1024;
const TYPES = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Where to return after an upload / delete: only the client or booking page the file belongs to.
const home = (clientId, bookingId, qs) => (bookingId ? `/admin/bookings/${bookingId}` : `/admin/clients/${clientId}`) + (qs ? `?${qs}` : "");

export async function uploadDocument(formData) {
  const s = await requireAdmin();
  const clientId = uuid(formData.get("client_id"));
  const bookingId = uuid(formData.get("booking_id"));
  if (!clientId) redirect("/admin/clients?err=notfound");
  const kind = oneOf(formData.get("kind"), DOC_KINDS.map(([k]) => k), "other");
  const file = formData.get("file");
  if (!file || typeof file === "string" || !file.size) redirect(home(clientId, bookingId, "err=invalid"));
  const ext = TYPES[file.type];
  if (!ext || file.size > MAX_BYTES) redirect(home(clientId, bookingId, "err=invalid"));

  // the file is stored under a random name; the original name is kept only as a label
  const path = `${clientId}/${randomUUID()}.${ext}`;
  const filename = String(file.name || `document.${ext}`).replace(/[^\w.\- ()]/g, "_").slice(0, 120);
  const { error } = await s.supabase.storage.from("client-documents").upload(path, file, { contentType: file.type, upsert: false });
  if (error) redirect(home(clientId, bookingId, "err=failed"));
  const { data: d, error: e2 } = await s.supabase.from("documents").insert({
    client_id: clientId, booking_id: bookingId, kind, filename, storage_path: path, sensitive: ["passport", "visa"].includes(kind), uploaded_by: s.claims.sub,
  }).select("id").single();
  if (e2) {
    await s.supabase.storage.from("client-documents").remove([path]);
    redirect(home(clientId, bookingId, "err=failed"));
  }
  await audit(s, "document.upload", "document", d.id, { kind });
  redirect(home(clientId, bookingId, "ok=uploaded"));
}

export async function deleteDocument(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  if (!id) redirect("/admin/clients?err=notfound");
  const { data: d } = await s.supabase.from("documents").select("id, client_id, booking_id, storage_path").eq("id", id).maybeSingle();
  if (!d) redirect("/admin/clients?err=notfound");
  await s.supabase.storage.from("client-documents").remove([d.storage_path]);
  const { error } = await s.supabase.from("documents").delete().eq("id", id);
  if (error) redirect(home(d.client_id, d.booking_id, "err=failed"));
  await audit(s, "document.delete", "document", id);
  redirect(home(d.client_id, d.booking_id, "ok=deleted"));
}

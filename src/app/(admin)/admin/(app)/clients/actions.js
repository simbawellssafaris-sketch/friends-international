"use server";

import { redirect } from "next/navigation";
import { requireAdmin, audit } from "@/lib/admin/session";
import { text, oneLine, uuid, email } from "@/lib/admin/validate";
import { ACTIVITY_KINDS } from "@/lib/admin/constants";

function fields(formData) {
  return {
    full_name: oneLine(formData.get("full_name"), 120),
    email: email(formData.get("email")),
    phone: oneLine(formData.get("phone"), 40),
    whatsapp: oneLine(formData.get("whatsapp"), 40),
    country: oneLine(formData.get("country"), 80),
    preferences: text(formData.get("preferences"), 2000),
    notes: text(formData.get("notes"), 4000),
  };
}
const valid = (f) => f.full_name && (f.email || f.phone || f.whatsapp);

export async function createClient(formData) {
  const s = await requireAdmin();
  const f = fields(formData);
  if (!valid(f)) redirect("/admin/clients/new?err=invalid");
  const { data, error } = await s.supabase.from("clients").insert(f).select("id").single();
  if (error) redirect(`/admin/clients/new?err=${error.code === "23505" ? "duplicate" : "failed"}`);
  await audit(s, "client.create", "client", data.id);
  redirect(`/admin/clients/${data.id}?ok=created`);
}

export async function updateClient(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  if (!id) redirect("/admin/clients?err=notfound");
  const f = fields(formData);
  if (!valid(f)) redirect(`/admin/clients/${id}?err=invalid`);
  const { error } = await s.supabase.from("clients").update(f).eq("id", id);
  if (error) redirect(`/admin/clients/${id}?err=${error.code === "23505" ? "duplicate" : "failed"}`);
  await audit(s, "client.update", "client", id);
  redirect(`/admin/clients/${id}?ok=saved`);
}

export async function archiveClient(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  if (!id) redirect("/admin/clients?err=notfound");
  const archive = formData.get("archive") === "1";
  const { error } = await s.supabase.from("clients").update({ archived_at: archive ? new Date().toISOString() : null }).eq("id", id);
  if (error) redirect(`/admin/clients/${id}?err=${error.code === "23505" ? "duplicate" : "failed"}`);
  await audit(s, archive ? "client.archive" : "client.restore", "client", id);
  redirect(archive ? "/admin/clients?ok=archived" : `/admin/clients/${id}?ok=restored`);
}

export async function addClientNote(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  const body = text(formData.get("body"), 4000);
  const kind = ACTIVITY_KINDS.includes(formData.get("kind")) ? formData.get("kind") : "note";
  if (!id) redirect("/admin/clients?err=notfound");
  if (!body) redirect(`/admin/clients/${id}?err=invalid`);
  const { error } = await s.supabase.from("activities").insert({ client_id: id, kind, body, created_by: s.claims.sub });
  if (error) redirect(`/admin/clients/${id}?err=failed`);
  await audit(s, "client.note", "client", id);
  redirect(`/admin/clients/${id}?ok=noted`);
}

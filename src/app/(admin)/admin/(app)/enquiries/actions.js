"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, audit } from "@/lib/admin/session";
import { text, oneOf, uuid, dateTimeLocal } from "@/lib/admin/validate";
import { ENQUIRY_STATUSES, ACTIVITY_KINDS } from "@/lib/admin/constants";
import { findOrCreateClient } from "@/lib/admin/clients";
import { sendEnquiryEmail } from "@/lib/mail";

const back = (id, qs) => redirect(`/admin/enquiries/${id}${qs ? `?${qs}` : ""}`);

export async function updateEnquiry(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  if (!id) redirect("/admin/enquiries?err=notfound");
  const status = oneOf(formData.get("status"), ENQUIRY_STATUSES);
  if (!status) back(id, "err=invalid");

  const { data: old } = await s.supabase.from("enquiries").select("status").eq("id", id).maybeSingle();
  if (!old) redirect("/admin/enquiries?err=notfound");

  const assigned = uuid(formData.get("assigned_to"));
  const patch = {
    status,
    lost_reason: status === "lost" ? text(formData.get("lost_reason"), 300) : null,
    next_follow_up_at: dateTimeLocal(formData.get("next_follow_up_at")),
    last_contact_at: dateTimeLocal(formData.get("last_contact_at")),
    assigned_to: assigned,
    internal_notes: text(formData.get("internal_notes"), 4000),
  };
  const { error } = await s.supabase.from("enquiries").update(patch).eq("id", id);
  if (error) back(id, "err=failed");

  if (old.status !== status) {
    await s.supabase.from("activities").insert({ enquiry_id: id, kind: "status_change", body: `Status changed from ${old.status} to ${status}`, created_by: s.claims.sub });
  }
  await audit(s, "enquiry.update", "enquiry", id, { status });
  revalidatePath("/admin");
  back(id, "ok=saved");
}

export async function addActivity(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  const kind = oneOf(formData.get("kind"), ACTIVITY_KINDS, "note");
  const body = text(formData.get("body"), 4000);
  if (!id) redirect("/admin/enquiries?err=notfound");
  if (!body) back(id, "err=invalid");
  const { error } = await s.supabase.from("activities").insert({ enquiry_id: id, kind, body, created_by: s.claims.sub });
  if (error) back(id, "err=failed");
  if (kind !== "note") await s.supabase.from("enquiries").update({ last_contact_at: new Date().toISOString() }).eq("id", id);
  await audit(s, "enquiry.activity", "enquiry", id, { kind });
  back(id, "ok=noted");
}

export async function setArchived(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  if (!id) redirect("/admin/enquiries?err=notfound");
  const archive = formData.get("archive") === "1";
  const { error } = await s.supabase.from("enquiries").update({ archived_at: archive ? new Date().toISOString() : null }).eq("id", id);
  if (error) back(id, "err=failed");
  await audit(s, archive ? "enquiry.archive" : "enquiry.restore", "enquiry", id);
  revalidatePath("/admin");
  redirect(`/admin/enquiries?ok=${archive ? "archived" : "restored"}`);
}

// Turns an enquiry into a booking. The client is matched by email or phone, so the same person is never duplicated.
export async function convertEnquiry(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  if (!id) redirect("/admin/enquiries?err=notfound");
  const { data: e } = await s.supabase.from("enquiries").select("*").eq("id", id).maybeSingle();
  if (!e) redirect("/admin/enquiries?err=notfound");

  // already converted? go to the booking that exists instead of creating a second one
  const { data: existing } = await s.supabase.from("bookings").select("id").eq("enquiry_id", id).limit(1);
  if (existing?.[0]) redirect(`/admin/bookings/${existing[0].id}`);

  let clientId;
  try {
    clientId = await findOrCreateClient(s.supabase, e, s.claims.sub);
  } catch {
    back(id, "err=failed");
  }
  const { data: b, error } = await s.supabase
    .from("bookings")
    .insert({
      client_id: clientId, enquiry_id: id, title: e.trip_title || e.destination || "Safari booking", package_ref: e.package_ref,
      destination: e.destination, start_date: e.preferred_start, end_date: e.preferred_end,
      adults: e.adults || 1, children: e.children || 0, currency: "USD", status: "enquiry", created_by: s.claims.sub,
    })
    .select("id")
    .single();
  if (error) back(id, "err=failed");

  await s.supabase.from("enquiries").update({ status: "converted", client_id: clientId }).eq("id", id);
  await s.supabase.from("activities").insert([
    { enquiry_id: id, booking_id: b.id, client_id: clientId, kind: "system", body: "Enquiry converted to a booking", created_by: s.claims.sub },
  ]);
  await audit(s, "enquiry.convert", "enquiry", id, { booking_id: b.id });
  revalidatePath("/admin");
  redirect(`/admin/bookings/${b.id}?ok=converted`);
}

export async function retryEnquiryEmail(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  if (!id) redirect("/admin/enquiries?err=notfound");
  const { data: e } = await s.supabase.from("enquiries").select("*").eq("id", id).maybeSingle();
  if (!e) redirect("/admin/enquiries?err=notfound");
  const r = await sendEnquiryEmail(e);
  await s.supabase.from("enquiries").update({
    email_status: r.ok ? "sent" : "failed", email_error: r.ok ? null : String(r.error || "").slice(0, 500), email_attempts: (e.email_attempts || 0) + 1,
  }).eq("id", id);
  await audit(s, "enquiry.email_retry", "enquiry", id, { ok: r.ok });
  back(id, r.ok ? "ok=retried" : "err=mail");
}

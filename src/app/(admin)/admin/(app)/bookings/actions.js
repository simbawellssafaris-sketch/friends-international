"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, audit } from "@/lib/admin/session";
import { text, oneLine, oneOf, uuid, dateStr, intIn, money } from "@/lib/admin/validate";
import { CURRENCIES, PAYMENT_METHODS, PAYMENT_STATUSES, ACTIVITY_KINDS } from "@/lib/admin/constants";

const go = (path, qs) => redirect(qs ? `${path}?${qs}` : path);

async function statusCodes(s) {
  const { data } = await s.supabase.from("booking_statuses").select("code").eq("active", true);
  return (data || []).map((x) => x.code);
}

function bookingFields(formData, codes) {
  const total = money(formData.get("agreed_total")), quoted = money(formData.get("quoted_total"));
  return {
    title: oneLine(formData.get("title"), 200),
    destination: oneLine(formData.get("destination"), 200),
    package_ref: oneLine(formData.get("package_ref"), 120),
    start_date: dateStr(formData.get("start_date")),
    end_date: dateStr(formData.get("end_date")),
    adults: intIn(formData.get("adults"), 1, 50) ?? 1,
    children: intIn(formData.get("children"), 0, 30) ?? 0,
    accommodation: text(formData.get("accommodation"), 2000),
    transport: text(formData.get("transport"), 2000),
    guide_or_supplier: oneLine(formData.get("guide_or_supplier"), 300),
    status: oneOf(formData.get("status"), codes, "enquiry"),
    currency: oneOf(formData.get("currency"), CURRENCIES, "USD"),
    quoted_total: quoted,
    agreed_total: total,
    deposit_required: money(formData.get("deposit_required")) ?? 0,
    payment_deadline: dateStr(formData.get("payment_deadline")),
    notes: text(formData.get("notes"), 4000),
  };
}

export async function createBooking(formData) {
  const s = await requireAdmin();
  const clientId = uuid(formData.get("client_id"));
  const f = bookingFields(formData, await statusCodes(s));
  if (!clientId || !f.title) go("/admin/bookings/new", `${clientId ? `client=${clientId}&` : ""}err=invalid`);
  if (f.start_date && f.end_date && f.end_date < f.start_date) go("/admin/bookings/new", `client=${clientId}&err=invalid`);
  const { data, error } = await s.supabase.from("bookings").insert({ ...f, client_id: clientId, enquiry_id: uuid(formData.get("enquiry_id")), created_by: s.claims.sub }).select("id").single();
  if (error) go("/admin/bookings/new", `client=${clientId}&err=failed`);
  await audit(s, "booking.create", "booking", data.id);
  revalidatePath("/admin");
  go(`/admin/bookings/${data.id}`, "ok=created");
}

export async function updateBooking(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  if (!id) go("/admin/bookings", "err=notfound");
  const f = bookingFields(formData, await statusCodes(s));
  if (!f.title || (f.start_date && f.end_date && f.end_date < f.start_date)) go(`/admin/bookings/${id}`, "err=invalid");
  const { data: old } = await s.supabase.from("bookings").select("status").eq("id", id).maybeSingle();
  if (!old) go("/admin/bookings", "err=notfound");
  const { error } = await s.supabase.from("bookings").update(f).eq("id", id);
  if (error) go(`/admin/bookings/${id}`, "err=failed");
  if (old.status !== f.status) {
    await s.supabase.from("activities").insert({ booking_id: id, kind: "status_change", body: `Status changed from ${old.status} to ${f.status}`, created_by: s.claims.sub });
  }
  await audit(s, "booking.update", "booking", id, { status: f.status });
  revalidatePath("/admin");
  go(`/admin/bookings/${id}`, "ok=saved");
}

export async function archiveBooking(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  if (!id) go("/admin/bookings", "err=notfound");
  const archive = formData.get("archive") === "1";
  const { error } = await s.supabase.from("bookings").update({ archived_at: archive ? new Date().toISOString() : null }).eq("id", id);
  if (error) go(`/admin/bookings/${id}`, "err=failed");
  await audit(s, archive ? "booking.archive" : "booking.restore", "booking", id);
  revalidatePath("/admin");
  go(archive ? "/admin/bookings" : `/admin/bookings/${id}`, `ok=${archive ? "archived" : "restored"}`);
}

export async function addBookingNote(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  const body = text(formData.get("body"), 4000);
  const kind = oneOf(formData.get("kind"), ACTIVITY_KINDS, "note");
  if (!id) go("/admin/bookings", "err=notfound");
  if (!body) go(`/admin/bookings/${id}`, "err=invalid");
  const { error } = await s.supabase.from("activities").insert({ booking_id: id, kind, body, created_by: s.claims.sub });
  if (error) go(`/admin/bookings/${id}`, "err=failed");
  await audit(s, "booking.note", "booking", id);
  go(`/admin/bookings/${id}`, "ok=noted");
}

// Manual payment recording. Nothing here confirms or pays a booking by itself: the booking status stays as you set it.
export async function recordPayment(formData) {
  const s = await requireAdmin();
  const bookingId = uuid(formData.get("booking_id"));
  if (!bookingId) go("/admin/bookings", "err=notfound");
  const { data: b } = await s.supabase.from("bookings").select("id, client_id, currency").eq("id", bookingId).maybeSingle();
  if (!b) go("/admin/bookings", "err=notfound");

  const amount = money(formData.get("amount"));
  const currency = oneOf(formData.get("currency"), CURRENCIES);
  const method = oneOf(formData.get("method"), PAYMENT_METHODS.map(([k]) => k));
  const status = oneOf(formData.get("status"), PAYMENT_STATUSES, "confirmed");
  const paidAt = dateStr(formData.get("paid_at"));
  const today = new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10);
  if (!amount || amount <= 0 || !method || !paidAt || paidAt > today || status === "refunded") go(`/admin/bookings/${bookingId}`, "err=invalid#pay");
  if (currency !== b.currency) go(`/admin/bookings/${bookingId}`, "err=currency");

  const externalRef = oneLine(formData.get("external_ref"), 120);
  // same amount, date and method already recorded for this booking (and no reference to tell them apart) = probably a double entry
  if (!externalRef && formData.get("allow_duplicate") !== "1") {
    const { data: same } = await s.supabase.from("payments").select("id").eq("booking_id", bookingId).eq("amount", amount).eq("paid_at", paidAt).eq("method", method).limit(1);
    if (same?.length) go(`/admin/bookings/${bookingId}`, "err=duplicate");
  }
  const { data: p, error } = await s.supabase.from("payments").insert({
    booking_id: bookingId, client_id: b.client_id, amount, currency, method, status, paid_at: paidAt,
    external_ref: externalRef, notes: text(formData.get("notes"), 2000), recorded_by: s.claims.sub,
  }).select("id, reference").single();
  if (error) go(`/admin/bookings/${bookingId}`, `err=${error.code === "23505" ? "duplicate" : "failed"}`);
  await audit(s, "payment.record", "payment", p.id, { booking_id: bookingId, amount, currency, status });
  revalidatePath("/admin");
  go(`/admin/bookings/${bookingId}`, "ok=paid");
}

// Staff confirm a pending payment (once the money is really in the account) or mark it failed / refunded.
export async function setPaymentStatus(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  const status = oneOf(formData.get("status"), PAYMENT_STATUSES);
  const bookingId = uuid(formData.get("booking_id"));
  if (!id || !status || !bookingId) go("/admin/bookings", "err=notfound");
  const { error } = await s.supabase.from("payments").update({ status }).eq("id", id);
  if (error) go(`/admin/bookings/${bookingId}`, "err=failed");
  await audit(s, "payment.status", "payment", id, { status });
  revalidatePath("/admin");
  go(`/admin/bookings/${bookingId}`, "ok=saved");
}

// Receipt = proof of a payment that was actually received. Only confirmed payments get one.
export async function issueReceipt(formData) {
  const s = await requireAdmin();
  const paymentId = uuid(formData.get("payment_id"));
  const bookingId = uuid(formData.get("booking_id"));
  if (!paymentId || !bookingId) go("/admin/bookings", "err=notfound");
  const { data: p } = await s.supabase.from("payments").select("id, status").eq("id", paymentId).maybeSingle();
  if (!p || p.status !== "confirmed") go(`/admin/bookings/${bookingId}`, "err=invalid");
  const { data: existing } = await s.supabase.from("receipts").select("id").eq("payment_id", paymentId).maybeSingle();
  if (existing) go(`/admin/receipts/${existing.id}`);
  const { data: r, error } = await s.supabase.from("receipts").insert({ payment_id: paymentId, issued_by: s.claims.sub }).select("id").single();
  if (error) go(`/admin/bookings/${bookingId}`, "err=failed");
  await audit(s, "receipt.issue", "receipt", r.id, { payment_id: paymentId });
  go(`/admin/receipts/${r.id}`);
}

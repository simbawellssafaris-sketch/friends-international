"use server";

import { redirect } from "next/navigation";
import { requireAdmin, audit } from "@/lib/admin/session";
import { oneLine, oneOf, uuid, dateStr, money, text } from "@/lib/admin/validate";
import { INVOICE_STATUSES } from "@/lib/admin/constants";

const MAX_ITEMS = 12;

// Reads description[] / quantity[] / unit_price[] rows from the form, ignoring empty rows.
function readItems(formData) {
  const d = formData.getAll("description"), q = formData.getAll("quantity"), p = formData.getAll("unit_price");
  const items = [];
  for (let i = 0; i < Math.min(d.length, MAX_ITEMS); i++) {
    const description = oneLine(d[i], 500);
    if (!description) continue;
    const qty = Number(String(q[i] || "1").replace(/,/g, ""));
    const price = money(p[i]);
    if (!Number.isFinite(qty) || qty <= 0 || qty > 100000 || price === null) return null;
    items.push({ description, quantity: Math.round(qty * 100) / 100, unit_price: price, sort: i });
  }
  return items;
}

export async function createInvoice(formData) {
  const s = await requireAdmin();
  const bookingId = uuid(formData.get("booking_id"));
  if (!bookingId) redirect("/admin/bookings?err=notfound");
  const { data: b } = await s.supabase.from("bookings").select("id, client_id, currency").eq("id", bookingId).maybeSingle();
  if (!b) redirect("/admin/bookings?err=notfound");
  const items = readItems(formData);
  if (!items || !items.length) redirect(`/admin/invoices/new?booking=${bookingId}&err=invalid`);
  const total = Math.round(items.reduce((a, i) => a + i.quantity * i.unit_price, 0) * 100) / 100;
  const { data: inv, error } = await s.supabase.from("invoices").insert({
    booking_id: bookingId, client_id: b.client_id, currency: b.currency, status: "issued", total,
    issue_date: dateStr(formData.get("issue_date")) || undefined, due_date: dateStr(formData.get("due_date")),
    notes: text(formData.get("notes"), 3000), created_by: s.claims.sub,
  }).select("id").single();
  if (error) redirect(`/admin/invoices/new?booking=${bookingId}&err=failed`);
  const { error: e2 } = await s.supabase.from("invoice_items").insert(items.map((i) => ({ ...i, invoice_id: inv.id })));
  if (e2) {
    await s.supabase.from("invoices").delete().eq("id", inv.id);
    redirect(`/admin/invoices/new?booking=${bookingId}&err=failed`);
  }
  await audit(s, "invoice.create", "invoice", inv.id, { booking_id: bookingId, total });
  redirect(`/admin/invoices/${inv.id}?ok=created`);
}

export async function setInvoiceStatus(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  const status = oneOf(formData.get("status"), INVOICE_STATUSES);
  if (!id || !status) redirect("/admin/invoices?err=notfound");
  const { error } = await s.supabase.from("invoices").update({ status }).eq("id", id);
  if (error) redirect(`/admin/invoices/${id}?err=failed`);
  await audit(s, "invoice.status", "invoice", id, { status });
  redirect(`/admin/invoices/${id}?ok=saved`);
}

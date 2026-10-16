"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, audit } from "@/lib/admin/session";
import { text, oneLine, oneOf, uuid, dateStr, money } from "@/lib/admin/validate";
import { CURRENCIES, ITEM_CATEGORIES } from "@/lib/admin/constants";
import { sendMail, esc } from "@/lib/mail";
import { quotationPdf } from "@/lib/pdf/quotation";
import { findOrCreateClient } from "@/lib/admin/clients";

const MAX_ITEMS = 30;
const CATS = ITEM_CATEGORIES.map(([k]) => k);
const go = (path, qs) => redirect(qs ? `${path}?${qs}` : path);

function readItems(formData) {
  const c = formData.getAll("category"), d = formData.getAll("description"), q = formData.getAll("quantity"), p = formData.getAll("unit_price"), x = formData.getAll("discount_pct");
  const items = [];
  for (let i = 0; i < Math.min(d.length, MAX_ITEMS); i++) {
    const description = oneLine(d[i], 500);
    if (!description) continue;
    const qty = Number(String(q[i] || "1").replace(/,/g, ""));
    const price = money(p[i]);
    const disc = Number(String(x[i] || "0").replace(/,/g, ""));
    if (!Number.isFinite(qty) || qty <= 0 || qty > 100000 || price === null || !Number.isFinite(disc) || disc < 0 || disc > 100) return null;
    items.push({ category: oneOf(c[i], CATS, "other"), description, quantity: Math.round(qty * 100) / 100, unit_price: price, discount_pct: Math.round(disc * 100) / 100, sort: items.length });
  }
  return items;
}

function readQuote(formData) {
  const tax = Number(String(formData.get("tax_rate") || "0").replace(/,/g, ""));
  return {
    title: oneLine(formData.get("title"), 200),
    currency: oneOf(formData.get("currency"), CURRENCIES, "USD"),
    valid_until: dateStr(formData.get("valid_until")),
    tax_rate: Number.isFinite(tax) && tax >= 0 && tax <= 100 ? Math.round(tax * 100) / 100 : 0,
    inclusions: text(formData.get("inclusions"), 6000),
    exclusions: text(formData.get("exclusions"), 6000),
    payment_terms: text(formData.get("payment_terms"), 3000),
    cancellation_terms: text(formData.get("cancellation_terms"), 3000),
    notes: text(formData.get("notes"), 3000),
  };
}

export async function createQuotation(formData) {
  const s = await requireAdmin();
  const enquiryId = uuid(formData.get("enquiry_id"));
  let clientId = uuid(formData.get("client_id"));
  if (!clientId && formData.get("client_id") === "new" && enquiryId) {
    const { data: enq } = await s.supabase.from("enquiries").select("*").eq("id", enquiryId).maybeSingle();
    if (enq) {
      clientId = await findOrCreateClient(s.supabase, enq, s.claims.sub).catch(() => null);
      if (clientId && !enq.client_id) await s.supabase.from("enquiries").update({ client_id: clientId }).eq("id", enquiryId);
    }
  }
  const f = readQuote(formData);
  const items = readItems(formData);
  const back = `${clientId ? `client=${clientId}&` : ""}${enquiryId ? `enquiry=${enquiryId}&` : ""}err=invalid`;
  if (!clientId || !f.title || !items || !items.length) go("/admin/quotations/new", back);
  const { data: q, error } = await s.supabase.from("quotations").insert({ ...f, client_id: clientId, enquiry_id: enquiryId, created_by: s.claims.sub }).select("id").single();
  if (error) go("/admin/quotations/new", back.replace("err=invalid", "err=failed"));
  const { error: e2 } = await s.supabase.from("quotation_items").insert(items.map((i) => ({ ...i, quotation_id: q.id })));
  if (e2) {
    await s.supabase.from("quotations").delete().eq("id", q.id);
    go("/admin/quotations/new", back.replace("err=invalid", "err=failed"));
  }
  await audit(s, "quotation.create", "quotation", q.id);
  revalidatePath("/admin");
  go(`/admin/quotations/${q.id}`, "ok=created");
}

// Edits are only allowed on drafts. A sent quotation is changed by making a new version, so what the client saw is never rewritten.
export async function updateQuotation(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  if (!id) go("/admin/quotations", "err=notfound");
  const { data: cur } = await s.supabase.from("quotations").select("status").eq("id", id).maybeSingle();
  if (!cur) go("/admin/quotations", "err=notfound");
  if (cur.status !== "draft") go(`/admin/quotations/${id}`, "err=invalid");
  const f = readQuote(formData);
  const items = readItems(formData);
  if (!f.title || !items || !items.length) go(`/admin/quotations/${id}`, "err=invalid");

  const { data: old } = await s.supabase.from("quotation_items").select("category, description, quantity, unit_price, discount_pct, sort").eq("quotation_id", id);
  await s.supabase.from("quotation_items").delete().eq("quotation_id", id);
  const { error: e2 } = await s.supabase.from("quotation_items").insert(items.map((i) => ({ ...i, quotation_id: id })));
  if (e2) {
    if (old?.length) await s.supabase.from("quotation_items").insert(old.map((i) => ({ ...i, quotation_id: id })));
    go(`/admin/quotations/${id}`, "err=failed");
  }
  const { error } = await s.supabase.from("quotations").update(f).eq("id", id);
  if (error) go(`/admin/quotations/${id}`, "err=failed");
  await audit(s, "quotation.update", "quotation", id);
  go(`/admin/quotations/${id}`, "ok=saved");
}

export async function reviseQuotation(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  if (!id) go("/admin/quotations", "err=notfound");
  const { data: q } = await s.supabase.from("quotations").select("*").eq("id", id).maybeSingle();
  if (!q) go("/admin/quotations", "err=notfound");
  const { data: items } = await s.supabase.from("quotation_items").select("category, description, quantity, unit_price, discount_pct, sort").eq("quotation_id", id).order("sort");
  const { data: latest } = await s.supabase.from("quotations").select("version").eq("reference", q.reference).order("version", { ascending: false }).limit(1);
  const nextVersion = (latest?.[0]?.version || q.version) + 1;
  const { data: nq, error } = await s.supabase.from("quotations").insert({
    reference: q.reference, version: nextVersion, parent_id: q.id, client_id: q.client_id, enquiry_id: q.enquiry_id, title: q.title, currency: q.currency,
    valid_until: q.valid_until, tax_rate: q.tax_rate, inclusions: q.inclusions, exclusions: q.exclusions, payment_terms: q.payment_terms,
    cancellation_terms: q.cancellation_terms, notes: q.notes, created_by: s.claims.sub,
  }).select("id").single();
  if (error) go(`/admin/quotations/${id}`, "err=failed");
  if (items?.length) await s.supabase.from("quotation_items").insert(items.map((i) => ({ ...i, quotation_id: nq.id })));
  await s.supabase.from("quotations").update({ status: "superseded" }).eq("id", id).in("status", ["draft", "sent"]);
  await audit(s, "quotation.revise", "quotation", nq.id, { from: id, version: nextVersion });
  go(`/admin/quotations/${nq.id}`, "ok=created");
}

// Emails the quotation (with the PDF) to the client. It is only marked "sent" if the email really went out.
export async function sendQuotation(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  if (!id) go("/admin/quotations", "err=notfound");
  const { data: q } = await s.supabase.from("quotations").select("*, clients(full_name, email, phone)").eq("id", id).maybeSingle();
  if (!q) go("/admin/quotations", "err=notfound");
  if (!q.clients?.email || !["draft", "sent"].includes(q.status)) go(`/admin/quotations/${id}`, "err=invalid");
  const { data: items } = await s.supabase.from("quotation_items").select("*").eq("quotation_id", id).order("sort");
  if (!items?.length) go(`/admin/quotations/${id}`, "err=invalid");

  let pdf;
  try { pdf = await quotationPdf({ q, items, client: q.clients }); } catch (e) { console.error("[quotation] pdf failed:", e?.message); go(`/admin/quotations/${id}`, "err=failed"); }

  const first = q.clients.full_name.split(" ")[0];
  const body = `Dear ${first},\n\nThank you for your interest in travelling with Friends International Limited. Please find your quotation ${q.reference} (version ${q.version}) attached: ${q.title}.\n\nThe total is ${q.currency} ${Number(q.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}${q.valid_until ? `, valid until ${q.valid_until}` : ""}.\n\nReply to this email or message us on WhatsApp with any questions or changes, and we will be glad to help.\n\nKind regards,\nFriends International Limited`;
  const r = await sendMail({
    to: q.clients.email, subject: `Your quotation ${q.reference}: ${q.title}`, text: body,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5">${esc(body).replace(/\n/g, "<br>")}</div>`,
    attachments: [{ filename: `${q.reference}-v${q.version}.pdf`, content: pdf, contentType: "application/pdf" }],
    replyTo: process.env.MAIL_TO || undefined,
  });
  if (!r.ok) {
    await audit(s, "quotation.send_failed", "quotation", id, { error: r.error });
    go(`/admin/quotations/${id}`, "err=mail");
  }
  await s.supabase.from("quotations").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", id);
  await s.supabase.from("activities").insert({ client_id: q.client_id, enquiry_id: q.enquiry_id, kind: "email", body: `Quotation ${q.reference} v${q.version} emailed to ${q.clients.email}`, created_by: s.claims.sub });
  if (q.enquiry_id) await s.supabase.from("enquiries").update({ status: "quoted" }).eq("id", q.enquiry_id).in("status", ["new", "contacted", "qualified"]);
  await audit(s, "quotation.send", "quotation", id, { to: q.clients.email });
  revalidatePath("/admin");
  go(`/admin/quotations/${id}`, "ok=sent");
}

export async function setQuotationStatus(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  const status = oneOf(formData.get("status"), ["sent", "accepted", "declined", "expired"]);
  if (!id || !status) go("/admin/quotations", "err=notfound");
  const patch = { status, ...(status === "accepted" ? { accepted_at: new Date().toISOString() } : {}) };
  const { error } = await s.supabase.from("quotations").update(patch).eq("id", id);
  if (error) go(`/admin/quotations/${id}`, "err=failed");
  await audit(s, "quotation.status", "quotation", id, { status });
  revalidatePath("/admin");
  go(`/admin/quotations/${id}`, "ok=saved");
}

// An accepted quotation becomes a booking. The agreed price is the quotation total; the booking waits for the deposit.
export async function convertQuotation(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  if (!id) go("/admin/quotations", "err=notfound");
  const { data: q } = await s.supabase.from("quotations").select("*").eq("id", id).maybeSingle();
  if (!q) go("/admin/quotations", "err=notfound");
  const { data: existing } = await s.supabase.from("bookings").select("id").eq("quotation_id", id).limit(1);
  if (existing?.[0]) go(`/admin/bookings/${existing[0].id}`);
  if (q.status !== "accepted") go(`/admin/quotations/${id}`, "err=invalid");

  let enquiry = null;
  if (q.enquiry_id) enquiry = (await s.supabase.from("enquiries").select("destination, preferred_start, preferred_end, adults, children, package_ref").eq("id", q.enquiry_id).maybeSingle()).data;
  const { data: b, error } = await s.supabase.from("bookings").insert({
    client_id: q.client_id, enquiry_id: q.enquiry_id, quotation_id: id, title: q.title, currency: q.currency, quoted_total: q.total, agreed_total: q.total,
    status: "awaiting_deposit", destination: enquiry?.destination ?? null, start_date: enquiry?.preferred_start ?? null, end_date: enquiry?.preferred_end ?? null,
    adults: enquiry?.adults || 1, children: enquiry?.children || 0, package_ref: enquiry?.package_ref ?? null, payment_deadline: null, created_by: s.claims.sub,
  }).select("id").single();
  if (error) go(`/admin/quotations/${id}`, "err=failed");
  if (q.enquiry_id) await s.supabase.from("enquiries").update({ status: "converted", client_id: q.client_id }).eq("id", q.enquiry_id);
  await s.supabase.from("activities").insert({ booking_id: b.id, client_id: q.client_id, kind: "system", body: `Booking created from accepted quotation ${q.reference} v${q.version}`, created_by: s.claims.sub });
  await audit(s, "quotation.convert", "quotation", id, { booking_id: b.id });
  revalidatePath("/admin");
  go(`/admin/bookings/${b.id}`, "ok=converted");
}

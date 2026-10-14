import { createClient } from "@/lib/supabase/client";

const clean = (v, max) => {
  const s = String(v ?? "").trim();
  return s ? s.slice(0, max) : null;
};
const int = (v, min, max) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : null;
};

// Saves a form submission to Supabase (table booking_requests). Anyone may submit; no sign-in.
// Never throws and never blocks for long: the visitor's WhatsApp/email flow must not depend on it.
// r: { kind: "book"|"customize"|"enquiry", channel: "whatsapp"|"email"|"form", trip, name, phone, email,
//      date, adults, children, level, childAges, changes[], details, notes }
export async function submitRequest(r) {
  try {
    const supabase = createClient();
    if (!supabase) return { ok: false, error: "Supabase is not configured" };
    const row = {
      kind: r.kind,
      channel: r.channel,
      trip: clean(r.trip, 200),
      name: clean(r.name, 120),
      phone: clean(r.phone, 40),
      email: clean(r.email, 200),
      travel_date: clean(r.date, 10),
      adults: int(r.adults, 1, 50),
      children: int(r.children, 0, 30),
      travel_level: clean(r.level, 40),
      child_ages: clean(r.childAges, 100),
      changes: r.changes && r.changes.length ? r.changes.map((c) => String(c).slice(0, 100)) : null,
      details: clean(r.details, 2000),
      notes: clean(r.notes, 2000),
      page_url: clean(typeof window !== "undefined" ? window.location.href : "", 500),
    };
    const timeout = new Promise((resolve) => setTimeout(() => resolve({ error: { message: "timed out" } }), 8000));
    const { error } = await Promise.race([supabase.from("booking_requests").insert(row), timeout]);
    return error ? { ok: false, error: error.message } : { ok: true };
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e) };
  }
}

const LOADED = Date.now();

// Emails a request to the business through the server (/api/enquiry, Hostinger SMTP). Never throws.
// Takes the same fields as submitRequest plus `website` (the hidden spam-trap value).
export async function emailRequest(r) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...r, openedAt: LOADED, page: typeof window !== "undefined" ? window.location.href : "" }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    const data = await res.json().catch(() => ({}));
    return res.ok && data.ok ? { ok: true } : { ok: false, error: data.error || "Could not send." };
  } catch (e) {
    return { ok: false, error: "Could not reach the server." };
  }
}

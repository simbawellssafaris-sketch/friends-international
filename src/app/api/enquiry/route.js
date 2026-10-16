import { createHash } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEnquiryEmail, mailConfigured } from "@/lib/mail";
import { dateStr } from "@/lib/admin/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Receives every public form (booking pop-up, customise, homepage enquiry, WhatsApp button).
// 1) checks spam traps and limits, 2) validates, 3) saves to the database (server-side, secret key),
// 4) emails the business and records whether that worked. A failed email never loses a saved enquiry.

const KINDS = ["book", "customize", "enquiry"];
const CHANNELS = ["whatsapp", "email", "form"];

// Per-visitor limit (resets when the server restarts): 5 submissions per 10 minutes.
const hits = new Map();
const WINDOW = 10 * 60 * 1000, LIMIT = 5;
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  if (list.length >= LIMIT) { hits.set(ip, list); return true; }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW)) hits.delete(k);
  return false;
}

const str = (v, max) => String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
const oneLine = (v, max) => str(v, max).replace(/[\r\n]+/g, " ");
const json = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return json({ ok: false, error: "Invalid request." }, 400); }
  if (!b || typeof b !== "object") return json({ ok: false, error: "Invalid request." }, 400);

  // Spam protection: hidden field must be empty, and a human takes more than ~2 seconds to fill a form.
  if (b.website) return json({ ok: true });
  const opened = Number(b.openedAt);
  if (Number.isFinite(opened) && Date.now() - opened < 2000) return json({ ok: true });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  if (limited(ip)) return json({ ok: false, error: "Too many requests. Please wait a few minutes or contact us on WhatsApp." }, 429);

  const kind = KINDS.includes(b.kind) ? b.kind : "enquiry";
  const channel = CHANNELS.includes(b.channel) ? b.channel : "form";
  const adults = parseInt(b.adults, 10), children = parseInt(b.children, 10);
  const d = {
    full_name: oneLine(b.name, 120), phone: oneLine(b.phone, 40), email: oneLine(b.email, 200).toLowerCase(),
    trip_title: oneLine(b.trip, 200), accommodation_pref: oneLine(b.level, 100), child_ages: oneLine(b.childAges, 100),
    special_requests: [str(b.details, 2000), str(b.notes, 2000)].filter(Boolean).join("\n\n").slice(0, 4000),
    source_page: oneLine(b.page, 500),
    preferred_start: dateStr(oneLine(b.date, 10)),
    adults: Number.isFinite(adults) ? Math.min(50, Math.max(1, adults)) : null,
    children: Number.isFinite(children) ? Math.min(30, Math.max(0, children)) : null,
    changes_wanted: Array.isArray(b.changes) ? b.changes.slice(0, 30).map((c) => oneLine(c, 100)).filter(Boolean) : [],
  };

  if (!d.full_name) return json({ ok: false, error: "Please enter your name." }, 400);
  if (!d.phone && !d.email) return json({ ok: false, error: "Please add a phone number or an email so we can reply." }, 400);
  if (d.email && !/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(d.email)) return json({ ok: false, error: "That email address does not look right." }, 400);

  // The same person sending the same request twice on the same day is saved once.
  const day = new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10);
  // (a visitor who changes the message or dates and sends again creates a new record; an accidental double click does not)
  const dedupe_key = createHash("sha256")
    .update([(d.email || d.phone).toLowerCase(), d.trip_title.toLowerCase(), kind, day, d.preferred_start || "", d.adults || "", d.special_requests].join("|"))
    .digest("hex");

  const row = { ...d, kind, channel, dedupe_key, email: d.email || null, phone: d.phone || null, trip_title: d.trip_title || null,
    accommodation_pref: d.accommodation_pref || null, child_ages: d.child_ages || null, special_requests: d.special_requests || null,
    source_page: d.source_page || null, changes_wanted: d.changes_wanted.length ? d.changes_wanted : null };

  let saved = null, duplicate = false;
  const db = createServiceClient();
  if (db) {
    const { data, error } = await db.from("enquiries").insert(row).select("*").single();
    if (error && error.code === "23505") duplicate = true;
    else if (error) console.error("[enquiry] save failed:", error.code, error.message);
    else saved = data;
  } else {
    console.error("[enquiry] SUPABASE_SECRET_KEY is not set: the enquiry cannot be saved to the database.");
  }
  if (duplicate) return json({ ok: true, duplicate: true });

  let mailed = { ok: false, error: "Email is not configured" };
  if (mailConfigured()) mailed = await sendEnquiryEmail(saved || { ...row, id: null, reference: null });

  if (saved && db) {
    await db.from("enquiries").update({
      email_status: mailed.ok ? "sent" : "failed", email_error: mailed.ok ? null : String(mailed.error || "").slice(0, 500), email_attempts: 1,
    }).eq("id", saved.id);
  }
  if (!saved && !mailed.ok) return json({ ok: false, error: "We could not send your message just now. Please use WhatsApp or try again." }, 502);
  return json({ ok: true, reference: saved?.reference || null });
}

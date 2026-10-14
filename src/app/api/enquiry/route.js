import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Server-side email for contact forms and booking requests, sent over SMTP (Hostinger).
// All credentials come from server environment variables and never reach the browser:
//   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO

const KINDS = { book: "Booking request", customize: "Customise trip", enquiry: "Trip enquiry" };
const MAX = { name: 120, phone: 40, email: 200, trip: 200, date: 10, level: 40, childAges: 100, details: 2000, notes: 2000 };

// Simple per-visitor limit (resets when the server restarts): 5 emails per 10 minutes.
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
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const json = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return json({ ok: false, error: "Invalid request." }, 400); }
  if (!b || typeof b !== "object") return json({ ok: false, error: "Invalid request." }, 400);

  // Spam protection: hidden field must be empty, and a human takes more than ~2 seconds to fill a form.
  if (b.website) return json({ ok: true }); // pretend success so bots learn nothing
  const opened = Number(b.openedAt);
  if (Number.isFinite(opened) && Date.now() - opened < 2000) return json({ ok: true });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  if (limited(ip)) return json({ ok: false, error: "Too many requests. Please wait a few minutes or contact us on WhatsApp." }, 429);

  const kind = KINDS[b.kind] ? b.kind : "enquiry";
  const d = {
    name: oneLine(b.name, MAX.name), phone: oneLine(b.phone, MAX.phone), email: oneLine(b.email, MAX.email),
    trip: oneLine(b.trip, MAX.trip), date: oneLine(b.date, MAX.date), level: oneLine(b.level, MAX.level),
    childAges: oneLine(b.childAges, MAX.childAges), details: str(b.details, MAX.details), notes: str(b.notes, MAX.notes),
    adults: Number.isFinite(parseInt(b.adults, 10)) ? Math.min(50, Math.max(1, parseInt(b.adults, 10))) : "",
    children: Number.isFinite(parseInt(b.children, 10)) ? Math.min(30, Math.max(0, parseInt(b.children, 10))) : "",
    changes: Array.isArray(b.changes) ? b.changes.slice(0, 30).map((c) => oneLine(c, 100)).filter(Boolean) : [],
    page: oneLine(b.page, 300),
  };

  if (!d.name) return json({ ok: false, error: "Please enter your name." }, 400);
  if (!d.phone && !d.email) return json({ ok: false, error: "Please add a phone number or an email so we can reply." }, 400);
  if (d.email && !/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(d.email)) return json({ ok: false, error: "That email address does not look right." }, 400);

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_TO) {
    console.error("[enquiry] SMTP is not configured (SMTP_HOST, SMTP_USER, SMTP_PASS, MAIL_TO).");
    return json({ ok: false, error: "Email is not available right now. Please use WhatsApp." }, 503);
  }

  const rows = [
    ["Type", KINDS[kind]], ["Trip", d.trip], ["Name", d.name], ["Phone", d.phone], ["Email", d.email],
    ["Travel date", d.date], ["Adults", d.adults], ["Children", d.children], ["Travel style", d.level],
    ["Children's ages", d.childAges], ["Changes wanted", d.changes.join(", ")], ["Details", d.details], ["Message", d.notes], ["Sent from", d.page],
  ].filter(([, v]) => v !== "" && v != null);

  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#666;vertical-align:top"><b>${esc(k)}</b></td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`).join("")}</table>`;

  try {
    const port = Number(SMTP_PORT) || 465;
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST, port,
      secure: SMTP_SECURE ? SMTP_SECURE === "true" : port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    });
    await transporter.sendMail({
      from: MAIL_FROM || SMTP_USER,
      to: MAIL_TO,
      ...(d.email ? { replyTo: { name: d.name, address: d.email } } : {}),
      subject: `${KINDS[kind]}: ${d.trip || "New enquiry"} (${d.name})`,
      text, html,
    });
    return json({ ok: true });
  } catch (e) {
    console.error("[enquiry] send failed:", e && e.code, e && e.message);
    return json({ ok: false, error: "We could not send your message by email just now. Please use WhatsApp or try again." }, 502);
  }
}

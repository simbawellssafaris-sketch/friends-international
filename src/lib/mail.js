import "server-only";
import nodemailer from "nodemailer";

// All outgoing email goes through here (Hostinger SMTP). Credentials come from server environment variables:
//   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO
// Every function returns { ok, error? } and never throws, so a mail problem can never lose a saved record.

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

export function mailConfigured() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, MAIL_TO } = process.env;
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS && MAIL_TO);
}

export async function sendMail({ to, subject, text, html, replyTo, attachments, bcc }) {
  if (!mailConfigured()) return { ok: false, error: "Email is not configured" };
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
  try {
    const port = Number(SMTP_PORT) || 465;
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST, port,
      secure: SMTP_SECURE ? SMTP_SECURE === "true" : port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
    });
    await transporter.sendMail({ from: MAIL_FROM || SMTP_USER, to: to || process.env.MAIL_TO, bcc, subject, text, html, replyTo, attachments });
    return { ok: true };
  } catch (e) {
    console.error("[mail] send failed:", e && e.code, e && e.message);
    return { ok: false, error: `${(e && e.code) || "ERROR"}: ${(e && e.message) || "send failed"}`.slice(0, 300) };
  }
}

const KINDS = { book: "Booking request", customize: "Customise trip", enquiry: "Trip enquiry" };

// The notification you receive when someone submits a form. Includes the reference and a link that needs login to open.
export function sendEnquiryEmail(e) {
  const rows = [
    ["Reference", e.reference], ["Type", KINDS[e.kind] || "Trip enquiry"], ["Trip", e.trip_title || e.destination], ["Name", e.full_name],
    ["Phone", e.phone], ["Email", e.email], ["Preferred start", e.preferred_start], ["Adults", e.adults], ["Children", e.children],
    ["Travel style", e.accommodation_pref], ["Children's ages", e.child_ages], ["Changes wanted", (e.changes_wanted || []).join(", ")],
    ["Details", e.special_requests], ["Sent from", e.source_page],
  ].filter(([, v]) => v !== "" && v != null);
  const link = siteUrl() && e.id ? `${siteUrl()}/admin/enquiries/${e.id}` : "";
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n") + (link ? `\n\nOpen in the admin area (sign-in required):\n${link}` : "");
  const html = `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#666;vertical-align:top"><b>${esc(k)}</b></td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`).join("")}</table>` +
    (link ? `<p style="font-family:Arial,sans-serif;font-size:14px"><a href="${esc(link)}">Open this enquiry in the admin area</a> (sign-in required)</p>` : "");
  return sendMail({
    subject: `${KINDS[e.kind] || "Trip enquiry"} ${e.reference ? `[${e.reference}] ` : ""}${e.trip_title || e.destination || "New enquiry"} (${e.full_name})`,
    text, html,
    replyTo: e.email ? { name: e.full_name, address: e.email } : undefined,
  });
}

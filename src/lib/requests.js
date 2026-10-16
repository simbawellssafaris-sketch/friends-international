// Sends a public form submission to the server (/api/enquiry), which saves it to the database and emails the business.
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

// Server-side input cleaning for admin forms. Never trust what the browser sends.
export const text = (v, max = 200) => {
  const s = String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
  return s ? s.slice(0, max) : null;
};
export const oneLine = (v, max = 200) => {
  const t = text(v, max);
  return t ? t.replace(/[\r\n]+/g, " ") : null;
};
export const oneOf = (v, list, fallback = null) => (list.includes(v) ? v : fallback);
export const uuid = (v) => (typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v) ? v : null);
export const dateStr = (v) => {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T12:00:00Z`);
  const y = d.getUTCFullYear();
  return Number.isNaN(d.getTime()) || y < 2000 || y > 2100 || d.toISOString().slice(0, 10) !== v ? null : v;
};
// <input type="datetime-local"> value (Nairobi time) -> ISO timestamp
export const dateTimeLocal = (v) => {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const d = new Date(`${v}:00+03:00`);
  return Number.isNaN(d.getTime()) || !dateStr(v.slice(0, 10)) ? null : d.toISOString();
};
export const intIn = (v, min, max) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};
export const money = (v) => {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 && n < 1e10 ? Math.round(n * 100) / 100 : null;
};
export const email = (v) => {
  const s = oneLine(v, 200);
  return s && /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(s) ? s.toLowerCase() : null;
};
// strips characters that would break a PostgREST filter expression
export const searchTerm = (v) => String(v ?? "").replace(/[,()%*\\"'`]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
export const pageNum = (v) => Math.min(10000, Math.max(1, parseInt(v, 10) || 1));

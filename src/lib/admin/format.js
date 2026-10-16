// Display helpers for the admin area. The business works in Nairobi time.
const TZ = "Africa/Nairobi";

export const money = (n, currency) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(n) || 0);
  } catch {
    return `${currency} ${Math.round(Number(n) || 0).toLocaleString("en-US")}`;
  }
};

// { USD: 5000, KES: 200000 } -> [["USD", 5000], ["KES", 200000]], largest first, zero amounts dropped
export const moneyEntries = (obj) =>
  Object.entries(obj || {})
    .map(([c, v]) => [c, Number(v) || 0])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

export const fmtDate = (s) =>
  s ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T12:00:00Z` : s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TZ }) : "";

export const fmtDateTime = (s) =>
  s ? new Date(s).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TZ }) : "";

export const timeAgo = (s) => {
  const secs = Math.max(1, Math.round((Date.now() - new Date(s).getTime()) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  return days < 30 ? `${days} d ago` : fmtDate(s);
};

export const daysUntil = (dateStr) => Math.round((new Date(`${dateStr}T12:00:00Z`) - new Date(`${todayEAT()}T12:00:00Z`)) / 864e5);

export const todayEAT = () => new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10);

export const STATUS_LABEL = {
  new: "New", contacted: "Contacted", qualified: "Qualified", quoted: "Quoted", converted: "Converted", lost: "Lost",
  enquiry: "Enquiry", quotation_sent: "Quotation sent", awaiting_deposit: "Awaiting deposit", confirmed: "Confirmed",
  in_preparation: "In preparation", in_progress: "In progress", completed: "Completed", cancelled: "Cancelled", refunded: "Refunded",
  pending: "Pending", failed: "Failed", draft: "Draft", sent: "Sent", accepted: "Accepted",
};
export const statusLabel = (s) => STATUS_LABEL[s] || String(s || "").replace(/_/g, " ");

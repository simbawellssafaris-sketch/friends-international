import "server-only";
import { todayEAT } from "./format";

const DAY = 864e5;
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (s, n) => iso(new Date(new Date(`${s}T12:00:00Z`).getTime() + n * DAY));
const validDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(`${s}T12:00:00Z`).getTime());

export const RANGES = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "12m", label: "12 months" },
  { key: "ytd", label: "This year" },
];

// Turns ?range=30d (or ?range=custom&from=...&to=...) into a safe date range for the dashboard.
export function resolveRange(sp) {
  const today = todayEAT();
  const key = typeof sp.range === "string" ? sp.range : "30d";
  let from;
  let to = today;
  let active = key;
  if (key === "custom" && validDate(sp.from) && validDate(sp.to)) {
    from = sp.from <= sp.to ? sp.from : sp.to;
    to = sp.from <= sp.to ? sp.to : sp.from;
    const earliest = addDays(today, -365 * 5);
    if (from < earliest) from = earliest;
  } else if (key === "7d") from = addDays(today, -6);
  else if (key === "90d") from = addDays(today, -89);
  else if (key === "12m") from = addDays(today, -364);
  else if (key === "ytd") from = `${today.slice(0, 4)}-01-01`;
  else {
    from = addDays(today, -29);
    active = "30d";
  }
  const days = Math.round((new Date(`${to}T12:00:00Z`) - new Date(`${from}T12:00:00Z`)) / DAY) + 1;
  const bucket = days <= 35 ? "day" : days <= 140 ? "week" : "month";
  return { key: active, from, to, days, bucket };
}

export async function loadDashboard(s, range) {
  const { data, error } = await s.supabase.rpc("admin_dashboard", { p_from: range.from, p_to: range.to, p_bucket: range.bucket });
  if (error) throw new Error(`Dashboard could not be loaded: ${error.message}`);
  return data;
}

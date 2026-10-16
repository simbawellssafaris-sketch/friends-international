import { requireAdmin, audit } from "@/lib/admin/session";
import { resolveRange } from "@/lib/admin/dashboard";
import { oneOf } from "@/lib/admin/validate";
import { toCsv, csvResponse } from "@/lib/admin/csv";

const KINDS = ["enquiries_by_month", "destinations", "packages", "money", "lost", "departures"];
const byCur = (o) => Object.entries(o || {}).map(([c, v]) => `${c} ${Number(v).toFixed(2)}`).join("; ");

// CSV of one report table for the chosen date range (administrators only).
export async function GET(request) {
  const s = await requireAdmin();
  const sp = Object.fromEntries(new URL(request.url).searchParams);
  const kind = oneOf(sp.kind, KINDS);
  if (!kind) return new Response("Unknown report", { status: 400 });
  const range = resolveRange(sp);
  const { data: r, error } = await s.supabase.rpc("admin_report", { p_from: range.from, p_to: range.to });
  if (error || !r) return new Response("Export failed", { status: 500 });
  await audit(s, "report.export", "report", kind, { from: range.from, to: range.to });

  const meta = (rows) => rows;
  if (kind === "enquiries_by_month") return csvResponse("report-enquiries-by-month", toCsv(meta(r.enquiries_by_month), [["Month", "month"], ["Enquiries", "total"], ["Converted", "converted"], ["Lost", "lost"]]));
  if (kind === "destinations") return csvResponse("report-bookings-by-destination", toCsv(r.bookings_by_destination, [["Destination", "name"], ["Bookings", "bookings"], ["Confirmed value", (x) => byCur(x.value)]]));
  if (kind === "packages") return csvResponse("report-bookings-by-package", toCsv(r.bookings_by_package, [["Package", "name"], ["Bookings", "bookings"], ["Confirmed value", (x) => byCur(x.value)]]));
  if (kind === "lost") return csvResponse("report-lost-enquiries", toCsv(r.lost_reasons, [["Reason", "reason"], ["Enquiries", "count"]]));
  if (kind === "departures") return csvResponse("report-upcoming-departures", toCsv(r.upcoming_departures, [["Reference", "reference"], ["Trip", "title"], ["Client", "client_name"], ["Destination", "destination"], ["Start", "start_date"], ["End", "end_date"], ["Adults", "adults"], ["Children", "children"], ["Status", "status"]]));
  const currencies = [...new Set([...Object.keys(r.confirmed_value), ...Object.keys(r.collected), ...Object.keys(r.outstanding), ...Object.keys(r.quoted_value)])];
  const rows = currencies.map((c) => ({ currency: c, confirmed: r.confirmed_value[c] ?? 0, collected: r.collected[c] ?? 0, outstanding: r.outstanding[c] ?? 0, quoted: r.quoted_value[c] ?? 0 }));
  return csvResponse("report-money", toCsv(rows, [["Currency", "currency"], ["Confirmed booking value", "confirmed"], ["Money collected", "collected"], ["Outstanding balance", "outstanding"], ["Quoted value", "quoted"]]));
}

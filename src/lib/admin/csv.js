// CSV export. Cells that start with = + - @ are prefixed with an apostrophe so spreadsheets never run them as formulas.
const cell = (v) => {
  if (v === null || v === undefined) return "";
  let s = Array.isArray(v) ? v.join("; ") : typeof v === "object" ? JSON.stringify(v) : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// columns: [[header, key | (row) => value], ...]
export function toCsv(rows, columns) {
  const head = columns.map(([h]) => cell(h)).join(",");
  const body = rows.map((r) => columns.map(([, k]) => cell(typeof k === "function" ? k(r) : r[k])).join(","));
  return "﻿" + [head, ...body].join("\r\n") + "\r\n";
}

export const csvResponse = (name, csv) =>
  new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });

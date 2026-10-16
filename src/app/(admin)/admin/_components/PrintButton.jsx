"use client";

export default function PrintButton({ label = "Print or save as PDF" }) {
  return <button type="button" className="adm-chip on no-print" onClick={() => window.print()}>{label}</button>;
}

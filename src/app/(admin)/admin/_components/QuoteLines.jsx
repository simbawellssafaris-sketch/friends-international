"use client";
import { useState } from "react";
import { money } from "@/lib/admin/format";

const CATS = [["accommodation", "Accommodation"], ["transport", "Transport"], ["activity", "Activities"], ["park_fee", "Park fees"], ["flight", "Flights"], ["transfer", "Transfers"], ["other", "Other"]];
const blank = () => ({ category: "accommodation", description: "", quantity: "1", unit_price: "", discount_pct: "0" });
const num = (v) => { const n = Number(String(v).replace(/,/g, "")); return Number.isFinite(n) ? n : 0; };

// Line items for a quotation, with a live total. The server recalculates everything again when you save.
export default function QuoteLines({ initial, currency: initialCurrency, taxRate: initialTax, currencies }) {
  const [rows, setRows] = useState(initial?.length ? initial.map((r) => ({ ...r, quantity: String(r.quantity), unit_price: String(r.unit_price), discount_pct: String(r.discount_pct ?? 0) })) : [blank(), blank(), blank()]);
  const [currency, setCurrency] = useState(initialCurrency || "USD");
  const [tax, setTax] = useState(String(initialTax ?? 0));
  const set = (i, k, v) => setRows((rs) => rs.map((r, n) => (n === i ? { ...r, [k]: v } : r)));
  const sub = rows.reduce((a, r) => a + num(r.quantity) * num(r.unit_price), 0);
  const disc = rows.reduce((a, r) => a + num(r.quantity) * num(r.unit_price) * num(r.discount_pct) / 100, 0);
  const taxAmt = ((sub - disc) * num(tax)) / 100;

  return (
    <div className="adm-lines">
      <div className="adm-row2">
        <label className="adm-field"><span>Currency</span>
          <select name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>{currencies.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label className="adm-field"><span>Tax rate (%)</span><input name="tax_rate" inputMode="decimal" value={tax} onChange={(e) => setTax(e.target.value)} /></label>
      </div>
      <div className="adm-ql head"><span>Type</span><span>Description</span><span>Qty</span><span>Unit price</span><span>Disc. %</span><span /></div>
      {rows.map((r, i) => (
        <div className="adm-ql" key={i}>
          <select name="category" value={r.category} onChange={(e) => set(i, "category", e.target.value)} aria-label={`Line ${i + 1} type`}>{CATS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <input name="description" maxLength={500} value={r.description} onChange={(e) => set(i, "description", e.target.value)} aria-label={`Line ${i + 1} description`} placeholder="e.g. 3 nights at Mara camp, full board" />
          <input name="quantity" inputMode="decimal" value={r.quantity} onChange={(e) => set(i, "quantity", e.target.value)} aria-label={`Line ${i + 1} quantity`} />
          <input name="unit_price" inputMode="decimal" value={r.unit_price} onChange={(e) => set(i, "unit_price", e.target.value)} aria-label={`Line ${i + 1} unit price`} />
          <input name="discount_pct" inputMode="decimal" value={r.discount_pct} onChange={(e) => set(i, "discount_pct", e.target.value)} aria-label={`Line ${i + 1} discount percent`} />
          <button type="button" className="adm-chip" onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((_, n) => n !== i) : rs))} aria-label={`Remove line ${i + 1}`}>Remove</button>
        </div>
      ))}
      {rows.length < 30 ? <button type="button" className="adm-chip" onClick={() => setRows((rs) => [...rs, blank()])}>Add a line</button> : null}
      <dl className="adm-totals">
        <dt>Subtotal</dt><dd>{money(sub, currency)}</dd>
        {disc > 0 ? (<><dt>Discounts</dt><dd>- {money(disc, currency)}</dd></>) : null}
        {num(tax) > 0 ? (<><dt>Tax ({num(tax)}%)</dt><dd>{money(taxAmt, currency)}</dd></>) : null}
        <dt className="big">Total</dt><dd className="big">{money(sub - disc + taxAmt, currency)}</dd>
      </dl>
    </div>
  );
}

import "server-only";
import path from "node:path";
import fs from "node:fs";
import PDFDocument from "pdfkit";
import { money, fmtDate } from "@/lib/admin/format";

// Branded quotation PDF. Internal notes are never printed. Returns a Buffer.
const GREEN = "#1f4d3a", GOLD = "#d9912b", INK = "#1c2420", MUTED = "#5f6a64", LINE = "#e3d0a8";
const CAT = { accommodation: "Accommodation", transport: "Transport", activity: "Activities", park_fee: "Park fees", flight: "Flights", transfer: "Transfers", other: "Other services" };

export function quotationPdf({ q, items, client }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: `Quotation ${q.reference}`, Author: "Friends International Limited" } });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const L = 48, R = doc.page.width - 48, W = R - L;
    // header band
    doc.rect(0, 0, doc.page.width, 96).fill(GREEN);
    try {
      const logo = path.join(process.cwd(), "public", "logo-light.png");
      if (fs.existsSync(logo)) doc.image(logo, L, 22, { height: 52 });
    } catch { /* logo is optional */ }
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(17).text("Friends International Limited", L + 66, 30);
    doc.font("Helvetica").fontSize(9).fillColor("#e3d0a8").text("Safaris · Beaches · Dubai · Europe · Asia", L + 66, 52);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(22).text("QUOTATION", L, 34, { width: W, align: "right" });
    doc.font("Helvetica").fontSize(9).fillColor("#e3d0a8").text(`${q.reference}  ·  version ${q.version}`, L, 62, { width: W, align: "right" });

    doc.fillColor(INK);
    let y = 118;
    doc.font("Helvetica-Bold").fontSize(9).fillColor(MUTED).text("PREPARED FOR", L, y);
    doc.font("Helvetica-Bold").fontSize(12).fillColor(INK).text(client.full_name, L, y + 13);
    doc.font("Helvetica").fontSize(9.5).fillColor(MUTED).text([client.email, client.phone].filter(Boolean).join("  ·  "), L, y + 29);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(MUTED).text("ISSUED", 330, y).text("VALID UNTIL", 440, y);
    doc.font("Helvetica").fontSize(10.5).fillColor(INK).text(fmtDate(q.issue_date), 330, y + 13).text(q.valid_until ? fmtDate(q.valid_until) : "On request", 440, y + 13);

    y += 62;
    doc.font("Helvetica-Bold").fontSize(15).fillColor(GREEN).text(q.title, L, y, { width: W });
    y = doc.y + 12;

    // table header
    const col = { desc: L, qty: L + 270, unit: L + 318, disc: L + 395, amt: L + 438 };
    const head = () => {
      doc.rect(L, y, W, 20).fill(GREEN);
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#ffffff");
      doc.text("Description", col.desc + 8, y + 6).text("Qty", col.qty, y + 6, { width: 40, align: "right" }).text("Unit price", col.unit, y + 6, { width: 70, align: "right" })
        .text("Disc.", col.disc, y + 6, { width: 38, align: "right" }).text("Amount", col.amt, y + 6, { width: R - col.amt - 8, align: "right" });
      y += 22;
    };
    head();
    const ensure = (h) => { if (y + h > doc.page.height - 70) { doc.addPage(); y = 54; head(); } };

    let lastCat = null;
    for (const it of items) {
      const cat = CAT[it.category] || "Other services";
      if (cat !== lastCat) {
        ensure(34);
        doc.font("Helvetica-Bold").fontSize(8.5).fillColor(GOLD).text(cat.toUpperCase(), col.desc + 8, y + 3);
        y += 16; lastCat = cat;
      }
      const amount = it.quantity * it.unit_price * (1 - (Number(it.discount_pct) || 0) / 100);
      doc.font("Helvetica").fontSize(9.5);
      const h = Math.max(16, doc.heightOfString(it.description, { width: 255 }) + 6);
      ensure(h + 4);
      doc.fillColor(INK).text(it.description, col.desc + 8, y + 2, { width: 255 });
      doc.text(String(Number(it.quantity)), col.qty, y + 2, { width: 40, align: "right" })
        .text(money(it.unit_price, q.currency), col.unit, y + 2, { width: 70, align: "right" })
        .text(Number(it.discount_pct) ? `${Number(it.discount_pct)}%` : "-", col.disc, y + 2, { width: 38, align: "right" })
        .text(money(amount, q.currency), col.amt, y + 2, { width: R - col.amt - 8, align: "right" });
      y += h;
      doc.moveTo(L, y).lineTo(R, y).lineWidth(0.5).strokeColor(LINE).stroke();
    }

    // totals
    ensure(90);
    y += 10;
    const row = (label, value, bold) => {
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 12 : 10).fillColor(bold ? GREEN : INK);
      doc.text(label, L + 250, y, { width: 150, align: "right" }).text(value, col.amt - 20, y, { width: R - col.amt + 12, align: "right" });
      y += bold ? 20 : 15;
    };
    row("Subtotal", money(q.subtotal, q.currency));
    if (Number(q.discount_total) > 0) row("Discounts", `- ${money(q.discount_total, q.currency)}`);
    if (Number(q.tax_rate) > 0) row(`Tax (${Number(q.tax_rate)}%)`, money(q.tax_total, q.currency));
    doc.moveTo(L + 300, y).lineTo(R, y).lineWidth(1).strokeColor(GOLD).stroke(); y += 6;
    row(`Total (${q.currency})`, money(q.total, q.currency), true);

    const block = (title, body) => {
      if (!body) return;
      doc.font("Helvetica").fontSize(9.5);
      const h = doc.heightOfString(body, { width: W }) + 26;
      ensure(h);
      doc.font("Helvetica-Bold").fontSize(9).fillColor(GOLD).text(title.toUpperCase(), L, y);
      doc.font("Helvetica").fontSize(9.5).fillColor(INK).text(body, L, y + 13, { width: W });
      y = doc.y + 12;
    };
    y += 8;
    block("Included", q.inclusions);
    block("Not included", q.exclusions);
    block("Payment terms", q.payment_terms);
    block("Cancellation terms", q.cancellation_terms);

    ensure(40);
    doc.font("Helvetica").fontSize(8.5).fillColor(MUTED).text(
      `This quotation is valid ${q.valid_until ? `until ${fmtDate(q.valid_until)}` : "for a limited time"}. Prices may change after that date. A quotation is not a booking confirmation or an invoice.`,
      L, y, { width: W });
    doc.end();
  });
}

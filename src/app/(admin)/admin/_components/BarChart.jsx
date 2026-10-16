"use client";
import { useState } from "react";
import { money } from "@/lib/admin/format";

// Grouped column chart drawn in SVG: thin rounded columns, one baseline, hairline grid, legend, hover tooltip and a table view.
// rows: [{ label, [seriesKey]: number }]   series: [{ key, label, color }]   currency: ISO code, or omit for plain counts
const W = 640, H = 250, PAD = { l: 46, r: 8, t: 10, b: 28 };
const BAR_MAX = 24, GAP = 2;

const niceMax = (v) => {
  if (v <= 0) return 4;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
};
const compact = (n) => (n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${+(n / 1e3).toFixed(1)}K` : `${n}`);

const barPath = (x, y, w, h) => {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
};

export default function BarChart({ title, series, rows, currency, empty = "No data in this period." }) {
  const [hover, setHover] = useState(null);
  const fmt = (v) => (currency ? money(v, currency) : Number(v).toLocaleString("en-US"));
  const total = rows.reduce((a, r) => a + series.reduce((b, s) => b + (Number(r[s.key]) || 0), 0), 0);
  const max = niceMax(Math.max(0, ...rows.flatMap((r) => series.map((s) => Number(r[s.key]) || 0))));
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  const band = rows.length ? iw / rows.length : iw;
  const bw = Math.max(3, Math.min(BAR_MAX, (band * 0.7 - GAP * (series.length - 1)) / series.length));
  const groupW = bw * series.length + GAP * (series.length - 1);
  const every = Math.max(1, Math.ceil(rows.length / 8));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => max * f);
  const y = (v) => PAD.t + ih - (v / max) * ih;

  return (
    <figure className="chart">
      <figcaption className="chart-head">
        <h3>{title}</h3>
        {series.length > 1 ? (
          <ul className="legend">
            {series.map((s) => (<li key={s.key}><i style={{ background: s.color }} />{s.label}</li>))}
          </ul>
        ) : null}
      </figcaption>

      {total === 0 ? (
        <p className="adm-empty">{empty}</p>
      ) : (
        <div className="chart-box" onMouseLeave={() => setHover(null)}>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}. Open "View as table" for exact values.`}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="gl" />
                <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" className="ax">{compact(t)}</text>
              </g>
            ))}
            {rows.map((r, i) => {
              const cx = PAD.l + band * i + band / 2;
              const x0 = cx - groupW / 2;
              return (
                <g key={i}>
                  {series.map((s, k) => {
                    const v = Number(r[s.key]) || 0;
                    const h = (v / max) * ih;
                    return h > 0 ? <path key={s.key} d={barPath(x0 + k * (bw + GAP), y(v), bw, h)} fill={s.color} opacity={hover === null || hover === i ? 1 : 0.45} /> : null;
                  })}
                  {i % every === 0 ? <text x={cx} y={H - 8} textAnchor="middle" className="ax">{r.label}</text> : null}
                  <rect x={PAD.l + band * i} y={PAD.t} width={band} height={ih} fill="transparent" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onClick={() => setHover(i)} />
                </g>
              );
            })}
            <line x1={PAD.l} x2={W - PAD.r} y1={y(0)} y2={y(0)} className="base" />
          </svg>
          {hover !== null ? (
            <div className="tip" style={{ left: `${((PAD.l + band * hover + band / 2) / W) * 100}%` }}>
              <b>{rows[hover].label}</b>
              {series.map((s) => (
                <span key={s.key}><i style={{ background: s.color }} />{s.label}: <strong>{fmt(rows[hover][s.key] || 0)}</strong></span>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <details className="chart-table">
        <summary>View as table</summary>
        <table>
          <thead><tr><th>Period</th>{series.map((s) => <th key={s.key}>{s.label}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => (<tr key={i}><td>{r.label}</td>{series.map((s) => <td key={s.key}>{fmt(r[s.key] || 0)}</td>)}</tr>))}</tbody>
        </table>
      </details>
    </figure>
  );
}

// Place-name search used by the home page: matches packages by place, country, trip type, style and tier.
import { BEACH, STYLE_INFO, destByKey } from "@/data/site";

const tierName = { budget: "Budget", mid: "Mid-range", luxury: "Luxury" };
export const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const ALIAS = { masai: "maasai", kili: "kilimanjaro", emirates: "uae", tz: "tanzania", ke: "kenya" };
const cache = new Map();

function hay(p) {
  if (cache.has(p.id)) return cache.get(p.id);
  const dests = p.route.map((r) => r.d);
  const countries = dests.map((d) => (destByKey(d) || {}).country).filter(Boolean);
  const extra = [
    p.type,
    p.safari ? "safari game drive wildlife" : "",
    p.route.some((r) => BEACH.has(r.d)) ? "beach coast" : "",
    p.resident ? "resident residents pick up" : "visitor visitors tourist",
    p.style, STYLE_INFO[p.style].label,
    p.style === "couples" ? "honeymoon romantic" : "",
    tierName[p.tier], p.tier,
  ];
  if (countries.includes("United Arab Emirates")) extra.push("uae");
  const h = norm([p.title, ...dests, ...countries, ...extra].join(" "));
  cache.set(p.id, h);
  return h;
}

export const matches = (p, q) =>
  norm(q).split(" ").filter(Boolean).map((t) => ALIAS[t] || t).every((t) => hay(p).includes(t));

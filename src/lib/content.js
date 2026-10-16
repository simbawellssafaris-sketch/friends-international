import "server-only";
import { createClient } from "@supabase/supabase-js";

// Reads PUBLISHED website content (package edits, destination text, FAQs, testimonials, announcements).
// Uses the public key without cookies, so public pages stay static and are refreshed in the background (60 s) or
// immediately when an administrator publishes. If the database is unreachable the site simply shows its built-in text.
export const CONTENT_TAG = "site-content";

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 60, tags: [CONTENT_TAG] } }) },
  });
}

async function read(fn, fallback) {
  try {
    const c = db();
    if (!c) return fallback;
    const { data, error } = await fn(c);
    return error || data == null ? fallback : data;
  } catch {
    return fallback;
  }
}

// { [packageId]: { listed, title?, intro?, price_label?, image_url?, highlights?, extra_included?, extra_excluded?, day_overrides?, itinerary_notes? } }
export async function getPackageContent() {
  const rows = await read((c) => c.from("package_content").select("package_id, listed, published"), []);
  const out = {};
  for (const r of rows) out[r.package_id] = { listed: r.listed !== false, ...(r.published || {}) };
  return out;
}

export async function getDestinationAbout() {
  const rows = await read((c) => c.from("destination_content").select("dest, published_about"), []);
  return Object.fromEntries(rows.filter((r) => r.published_about).map((r) => [r.dest, r.published_about]));
}

export const getFaqs = () => read((c) => c.from("faqs").select("id, question, answer").order("sort").order("created_at"), []);
export const getTestimonials = () => read((c) => c.from("testimonials").select("id, author, detail, quote, rating").order("sort").order("created_at"), []);
export async function getAnnouncement() {
  const rows = await read((c) => c.from("announcements").select("id, message, link_url, link_label").order("created_at", { ascending: false }).limit(1), []);
  return rows[0] || null;
}

// Only addresses we control are allowed as images: the site's own /images, or our public Supabase image bucket.
export function safeImage(url) {
  if (typeof url !== "string") return null;
  if (/^\/images\/[\w\-./]+$/.test(url) && !url.includes("..")) return url;
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  if (base && url.startsWith(`${base}/storage/v1/object/public/site-images/`) && !/[\s"'<>]/.test(url)) return url;
  return null;
}

const uniq = (a) => [...new Set(a.filter(Boolean))];

// Applies a package's published edits to the page view built from the built-in data. Empty fields keep the built-in text.
export function applyViewContent(view, c, destAbout = {}) {
  const v = { ...view };
  if (c?.intro) v.intro = c.intro;
  if (c?.highlights?.length) v.highlights = c.highlights;
  if (c?.extra_included?.length) {
    v.summary = { ...v.summary, inc: uniq([...v.summary.inc, ...c.extra_included]) };
    v.inclusions = { ...v.inclusions, inc: uniq([...v.inclusions.inc, ...c.extra_included]) };
  }
  if (c?.extra_excluded?.length) {
    v.summary = { ...v.summary, exc: uniq([...v.summary.exc, ...c.extra_excluded]) };
    v.inclusions = { ...v.inclusions, exc: uniq([...v.inclusions.exc, ...c.extra_excluded]) };
  }
  if (c?.day_overrides) {
    v.itinerary = v.itinerary.map((d) => {
      const o = c.day_overrides[String(d.n)];
      return o ? { ...d, title: o.title || d.title, travel: o.text || d.travel } : d;
    });
  }
  v.destSec = v.destSec.map((d) => (destAbout[d.d] ? { ...d, about: destAbout[d.d] } : d));
  return v;
}

"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin, audit } from "@/lib/admin/session";
import { text, oneLine, oneOf, uuid, intIn } from "@/lib/admin/validate";
import { PACKAGES } from "@/data/site";
import { CONTENT_TAG, safeImage } from "@/lib/content";

const go = (path, qs) => redirect(qs ? `${path}?${qs}` : path);

// Makes published changes visible on the public site straight away.
function refreshSite() {
  revalidateTag(CONTENT_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

const lines = (v, maxItems, maxLen) =>
  String(v ?? "").split(/\r?\n/).map((l) => oneLine(l, maxLen)).filter(Boolean).slice(0, maxItems);

const IMG_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// ---------------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------------
async function readPackageContent(s, formData, p) {
  const c = {};
  const set = (k, v) => { if (v && (!Array.isArray(v) || v.length)) c[k] = v; };
  set("title", oneLine(formData.get("title"), 150));
  set("intro", text(formData.get("intro"), 2000));
  set("price_label", oneLine(formData.get("price_label"), 80));
  set("highlights", lines(formData.get("highlights"), 12, 200));
  set("extra_included", lines(formData.get("extra_included"), 15, 200));
  set("extra_excluded", lines(formData.get("extra_excluded"), 15, 200));
  set("itinerary_notes", text(formData.get("itinerary_notes"), 2000));
  const days = {};
  for (let n = 1; n <= p.days; n++) {
    const t = oneLine(formData.get(`day_title_${n}`), 150), x = text(formData.get(`day_text_${n}`), 1000);
    if (t || x) days[String(n)] = { ...(t ? { title: t } : {}), ...(x ? { text: x } : {}) };
  }
  if (Object.keys(days).length) c.day_overrides = days;

  // picture: keep the current one, replace it with an upload, or remove it
  let image = safeImage(String(formData.get("current_image") || ""));
  if (formData.get("remove_image") === "1") image = null;
  const file = formData.get("image");
  if (file && typeof file !== "string" && file.size) {
    const ext = IMG_TYPES[file.type];
    if (!ext || file.size > 5 * 1024 * 1024) return { error: "invalid" };
    const path = `packages/${p.id}/${randomUUID()}.${ext}`;
    const { error } = await s.supabase.storage.from("site-images").upload(path, file, { contentType: file.type, upsert: false });
    if (error) return { error: "failed" };
    image = `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/site-images/${path}`;
  }
  if (image) c.image_url = image;
  return { content: c };
}

export async function savePackage(formData) {
  const s = await requireAdmin();
  const id = String(formData.get("package_id") || "");
  const p = PACKAGES.find((x) => x.id === id);
  const base = `/admin/content/packages/${encodeURIComponent(id)}`;
  if (!p) go("/admin/content/packages", "err=notfound");
  const intent = oneOf(formData.get("intent"), ["draft", "publish", "unpublish", "hide", "show"]);
  if (!intent) go(base, "err=invalid");

  const { data: row } = await s.supabase.from("package_content").select("listed, draft, published, published_at").eq("package_id", id).maybeSingle();
  let draft = row?.draft ?? null, published = row?.published ?? null, listed = row?.listed ?? true, publishedAt = row?.published_at ?? null;
  if (intent === "draft" || intent === "publish") {
    const r = await readPackageContent(s, formData, p);
    if (r.error) go(base, `err=${r.error}`);
    draft = r.content;
    if (intent === "publish") { published = r.content; publishedAt = new Date().toISOString(); }
  }
  if (intent === "unpublish") { published = null; publishedAt = null; }
  if (intent === "hide") listed = false;
  if (intent === "show") listed = true;

  const { error } = await s.supabase.from("package_content").upsert({ package_id: id, listed, draft, published, published_at: publishedAt, updated_by: s.claims.sub });
  if (error) go(base, "err=failed");
  // delete pictures that are no longer used by the draft or the live version
  const used = new Set([draft?.image_url, published?.image_url].filter(Boolean));
  const old = [row?.draft?.image_url, row?.published?.image_url].filter((u) => u && !used.has(u));
  const marker = "/storage/v1/object/public/site-images/";
  const paths = [...new Set(old)].map((u) => (u.includes(marker) ? decodeURIComponent(u.split(marker)[1]) : null)).filter(Boolean);
  if (paths.length) await s.supabase.storage.from("site-images").remove(paths);
  await audit(s, `package.${intent}`, "package", id);
  refreshSite();
  go(base, `ok=${intent === "draft" ? "saved" : intent === "publish" ? "published" : "saved"}`);
}

// ---------------------------------------------------------------------------
// Destination descriptions
// ---------------------------------------------------------------------------
const DESTS = new Set(PACKAGES.flatMap((p) => p.route.map((r) => r.d)));

export async function saveDestination(formData) {
  const s = await requireAdmin();
  const dest = String(formData.get("dest") || "");
  if (!DESTS.has(dest)) go("/admin/content/destinations", "err=notfound");
  const intent = oneOf(formData.get("intent"), ["draft", "publish", "unpublish"]);
  const about = text(formData.get("about"), 4000);
  if (!intent || (intent !== "unpublish" && !about)) go("/admin/content/destinations", "err=invalid");

  const { data: row } = await s.supabase.from("destination_content").select("draft_about, published_about").eq("dest", dest).maybeSingle();
  let draft = row?.draft_about ?? null, published = row?.published_about ?? null;
  if (intent === "draft") draft = about;
  if (intent === "publish") { draft = about; published = about; }
  if (intent === "unpublish") published = null;
  const { error } = await s.supabase.from("destination_content").upsert({ dest, draft_about: draft, published_about: published, updated_by: s.claims.sub });
  if (error) go("/admin/content/destinations", "err=failed");
  await audit(s, `destination.${intent}`, "destination", dest);
  refreshSite();
  go("/admin/content/destinations", `ok=${intent === "publish" ? "published" : "saved"}#d-${encodeURIComponent(dest.replace(/\W+/g, "-"))}`);
}

// ---------------------------------------------------------------------------
// FAQs, testimonials, announcements (same pattern: draft / published, edit, delete)
// ---------------------------------------------------------------------------
const statusOf = (formData) => (oneOf(formData.get("intent"), ["draft", "publish"]) === "publish" ? "published" : "draft");

export async function saveFaq(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  const row = { question: oneLine(formData.get("question"), 300), answer: text(formData.get("answer"), 3000), sort: intIn(formData.get("sort"), 0, 9999) ?? 0, status: statusOf(formData) };
  if (!row.question || !row.answer) go("/admin/content/faqs", "err=invalid");
  const q = id ? s.supabase.from("faqs").update(row).eq("id", id) : s.supabase.from("faqs").insert(row);
  const { error } = await q;
  if (error) go("/admin/content/faqs", "err=failed");
  await audit(s, id ? "faq.update" : "faq.create", "faq", id, { status: row.status });
  refreshSite();
  go("/admin/content/faqs", `ok=${row.status === "published" ? "published" : "saved"}`);
}
export async function deleteFaq(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  if (!id) go("/admin/content/faqs", "err=notfound");
  const { error } = await s.supabase.from("faqs").delete().eq("id", id);
  if (error) go("/admin/content/faqs", "err=failed");
  await audit(s, "faq.delete", "faq", id);
  refreshSite();
  go("/admin/content/faqs", "ok=deleted");
}

export async function saveTestimonial(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  const row = {
    author: oneLine(formData.get("author"), 120), detail: oneLine(formData.get("detail"), 160), quote: text(formData.get("quote"), 1500),
    rating: intIn(formData.get("rating"), 1, 5), sort: intIn(formData.get("sort"), 0, 9999) ?? 0, status: statusOf(formData),
  };
  if (!row.author || !row.quote) go("/admin/content/testimonials", "err=invalid");
  const q = id ? s.supabase.from("testimonials").update(row).eq("id", id) : s.supabase.from("testimonials").insert(row);
  const { error } = await q;
  if (error) go("/admin/content/testimonials", "err=failed");
  await audit(s, id ? "testimonial.update" : "testimonial.create", "testimonial", id, { status: row.status });
  refreshSite();
  go("/admin/content/testimonials", `ok=${row.status === "published" ? "published" : "saved"}`);
}
export async function deleteTestimonial(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  if (!id) go("/admin/content/testimonials", "err=notfound");
  const { error } = await s.supabase.from("testimonials").delete().eq("id", id);
  if (error) go("/admin/content/testimonials", "err=failed");
  await audit(s, "testimonial.delete", "testimonial", id);
  refreshSite();
  go("/admin/content/testimonials", "ok=deleted");
}

// datetime-local value in Nairobi time -> ISO, or null
const when = (v) => {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const d = new Date(`${v}:00+03:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export async function saveAnnouncement(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  const link = oneLine(formData.get("link_url"), 300);
  const row = {
    message: oneLine(formData.get("message"), 240), link_url: link && /^(\/|https:\/\/)/.test(link) ? link : null, link_label: oneLine(formData.get("link_label"), 40),
    starts_at: when(formData.get("starts_at")), ends_at: when(formData.get("ends_at")), status: statusOf(formData),
  };
  if (!row.message || (link && !row.link_url) || (row.starts_at && row.ends_at && row.ends_at <= row.starts_at)) go("/admin/content/announcements", "err=invalid");
  const q = id ? s.supabase.from("announcements").update(row).eq("id", id) : s.supabase.from("announcements").insert(row);
  const { error } = await q;
  if (error) go("/admin/content/announcements", "err=failed");
  await audit(s, id ? "announcement.update" : "announcement.create", "announcement", id, { status: row.status });
  refreshSite();
  go("/admin/content/announcements", `ok=${row.status === "published" ? "published" : "saved"}`);
}
export async function deleteAnnouncement(formData) {
  const s = await requireAdmin();
  const id = uuid(formData.get("id"));
  if (!id) go("/admin/content/announcements", "err=notfound");
  const { error } = await s.supabase.from("announcements").delete().eq("id", id);
  if (error) go("/admin/content/announcements", "err=failed");
  await audit(s, "announcement.delete", "announcement", id);
  refreshSite();
  go("/admin/content/announcements", "ok=deleted");
}

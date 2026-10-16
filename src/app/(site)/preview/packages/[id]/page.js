import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { buildPackageView, findPackage } from "@/lib/package-view";
import { applyViewContent, safeImage, getDestinationAbout } from "@/lib/content";
import PackageView from "@/components/PackageView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Preview", robots: { index: false, follow: false, nocache: true } };

// Shows the real package page with the DRAFT edits. Administrators only; visitors are sent to the sign-in page.
export default async function PreviewPackage({ params }) {
  const s = await requireAdmin();
  const { id } = await params;
  const p = findPackage(id);
  if (!p) notFound();
  const [{ data: row }, { data: dests }, live] = await Promise.all([
    s.supabase.from("package_content").select("draft, published").eq("package_id", id).maybeSingle(),
    s.supabase.from("destination_content").select("dest, draft_about, published_about"),
    getDestinationAbout(),
  ]);
  const c = row?.draft ?? row?.published ?? {};
  const destAbout = { ...live, ...Object.fromEntries((dests || []).filter((x) => x.draft_about || x.published_about).map((x) => [x.dest, x.draft_about || x.published_about])) };
  const pp = { ...p, title: c.title || p.title, img: safeImage(c.image_url) || p.img };
  return (
    <>
      <div className="preview-bar" role="status"><b>Draft preview</b> This is how the page will look when published. Visitors cannot see this page. <a href={`/admin/content/packages/${id}`}>Back to editing</a></div>
      <PackageView p={pp} view={applyViewContent(buildPackageView(p), c, destAbout)} content={{ priceLabel: c.price_label, itineraryNotes: c.itinerary_notes }} />
    </>
  );
}

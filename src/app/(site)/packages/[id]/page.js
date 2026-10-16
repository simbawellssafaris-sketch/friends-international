import { notFound } from "next/navigation";
import { PACKAGES } from "@/data/site";
import { buildPackageView, findPackage } from "@/lib/package-view";
import { getPackageContent, getDestinationAbout, applyViewContent, safeImage } from "@/lib/content";
import PackageView from "@/components/PackageView";

export function generateStaticParams() {
  return PACKAGES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = findPackage(id);
  const c = (await getPackageContent())[id];
  if (!p || c?.listed === false) return { title: "Package not found | Friends International Limited" };
  return { title: `${c?.title || p.title} | Friends International Limited` };
}

export default async function PackagePage({ params }) {
  const { id } = await params;
  const p = findPackage(id);
  if (!p) notFound();
  // Published edits from the admin area sit on top of the built-in content; anything left empty keeps the built-in text.
  const [all, destAbout] = await Promise.all([getPackageContent(), getDestinationAbout()]);
  const c = all[id];
  if (c?.listed === false) notFound();
  const pp = { ...p, title: c?.title || p.title, img: safeImage(c?.image_url) || p.img };
  const view = applyViewContent(buildPackageView(p), c, destAbout);
  return <PackageView p={pp} view={view} content={{ priceLabel: c?.price_label, itineraryNotes: c?.itinerary_notes }} />;
}

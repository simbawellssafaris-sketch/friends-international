import { notFound } from "next/navigation";
import { PACKAGES } from "@/data/site";
import { buildPackageView, findPackage } from "@/lib/package-view";
import PackageView from "@/components/PackageView";

export function generateStaticParams() {
  return PACKAGES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = findPackage(id);
  return { title: p ? `${p.title} | Friends International Limited` : "Package not found | Friends International Limited" };
}

export default async function PackagePage({ params }) {
  const { id } = await params;
  const p = findPackage(id);
  if (!p) notFound();
  return <PackageView p={p} view={buildPackageView(p)} />;
}

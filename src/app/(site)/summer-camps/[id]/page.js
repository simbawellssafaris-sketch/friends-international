import { notFound } from "next/navigation";
import { CAMPS } from "@/data/camps";
import CampView from "@/components/CampView";

export function generateStaticParams() {
  return CAMPS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const c = CAMPS.find((x) => x.id === id);
  return { title: `${c ? c.name : "Summer camp"} | Friends International Limited` };
}

export default async function CampPage({ params }) {
  const { id } = await params;
  if (!CAMPS.some((x) => x.id === id)) notFound();
  return <CampView id={id} />;
}

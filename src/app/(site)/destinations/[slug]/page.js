import { notFound } from "next/navigation";
import { COUNTRIES } from "@/data/site";
import CountryView from "@/components/CountryView";

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const c = COUNTRIES.find((x) => x.slug === slug);
  const safari = sp.view === "safari";
  return { title: `${c ? (safari ? c.name + " Safaris" : c.name) : "Destination"} | Friends International Limited`, description: c?.tagline };
}

// ?view=safari and ?aud=visitor|resident come from the menu, so this page renders per request.
export default async function CountryPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  if (!COUNTRIES.some((x) => x.slug === slug)) notFound();
  const one = (k) => (typeof sp[k] === "string" ? sp[k] : "");
  return <CountryView slug={slug} view={one("view")} aud={one("aud")} />;
}

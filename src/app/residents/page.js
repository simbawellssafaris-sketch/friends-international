import ResidentsView from "@/components/ResidentsView";

export const metadata = { title: "Residents Packages | Friends International Limited" };

export default async function ResidentsPage({ searchParams }) {
  const sp = await searchParams;
  return <ResidentsView initialCat={typeof sp.cat === "string" ? sp.cat : ""} />;
}

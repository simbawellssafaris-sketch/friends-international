import HomeClient from "@/components/HomeClient";

const pick = (sp, k) => (typeof sp[k] === "string" ? sp[k] : "");

// Rendered on the server for each request so ?type= / ?sty= / ?aud= from the menu are applied in the HTML.
export default async function HomePage({ searchParams }) {
  const sp = await searchParams;
  return <HomeClient initial={{ type: pick(sp, "type"), sty: pick(sp, "sty"), aud: pick(sp, "aud") }} />;
}

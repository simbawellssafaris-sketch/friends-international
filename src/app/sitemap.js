import { PACKAGES, COUNTRIES } from "@/data/site";
import { CAMPS } from "@/data/camps";
import { getPackageContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site-url";

// Lists every public page that should appear in search results, built from the site's real data (so new packages, camps and
// destinations are included automatically). Left out on purpose: the admin area, API routes, draft previews, packages you have hidden
// in the admin area, and address variants with ?filters or #sections (those are the same pages, not new ones).
export default async function sitemap() {
  const content = await getPackageContent(); // packages hidden from the website are removed from the sitemap too
  const pages = [
    "/",
    "/residents",
    "/stay",
    "/summer-camps",
    ...CAMPS.map((c) => `/summer-camps/${c.id}`),
    ...COUNTRIES.map((c) => `/destinations/${c.slug}`),
    ...PACKAGES.filter((p) => content[p.id]?.listed !== false).map((p) => `/packages/${p.id}`),
  ];
  return [...new Set(pages)].map((path) => ({ url: `${SITE_URL}${path === "/" ? "" : path}` }));
}

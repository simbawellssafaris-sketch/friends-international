import { SITE_URL } from "@/lib/site-url";

// Tells search engines they may read the whole public website, keeps them out of the private areas,
// and points them to the sitemap.
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/preview/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

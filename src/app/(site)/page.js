import HomeClient from "@/components/HomeClient";
import ContentSections from "@/components/ContentSections";
import { getFaqs, getTestimonials } from "@/lib/content";

const pick = (sp, k) => (typeof sp[k] === "string" ? sp[k] : "");

// Rendered on the server for each request so ?type= / ?sty= / ?aud= from the menu are applied in the HTML.
export default async function HomePage({ searchParams }) {
  const sp = await searchParams;
  // FAQs and testimonials you publish in the admin area appear above the contact section (nothing shows until you add some).
  const [faqs, testimonials] = await Promise.all([getFaqs(), getTestimonials()]);
  return <HomeClient initial={{ type: pick(sp, "type"), sty: pick(sp, "sty"), aud: pick(sp, "aud") }} extra={<ContentSections faqs={faqs} testimonials={testimonials} />} />;
}

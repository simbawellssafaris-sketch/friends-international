import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { PACKAGES } from "@/data/site";

export const metadata = { title: "Website content" };

export default async function ContentHome() {
  const s = await requireAdmin();
  const count = async (t, f) => (await (f ? f(s.supabase.from(t).select("*", { count: "exact", head: true })) : s.supabase.from(t).select("*", { count: "exact", head: true }))).count ?? 0;
  const [faqs, faqLive, tests, testLive, anns, annLive, edited, hidden] = await Promise.all([
    count("faqs"), count("faqs", (q) => q.eq("status", "published")),
    count("testimonials"), count("testimonials", (q) => q.eq("status", "published")),
    count("announcements"), count("announcements", (q) => q.eq("status", "published")),
    count("package_content", (q) => q.not("published", "is", null)), count("package_content", (q) => q.eq("listed", false)),
  ]);
  const cards = [
    ["Packages", "/admin/content/packages", `${PACKAGES.length} packages · ${edited} with published edits${hidden ? ` · ${hidden} hidden` : ""}`, "Change a package's title, introduction, highlights, picture, price label and day-by-day text, or hide it from the site."],
    ["Destinations", "/admin/content/destinations", "Descriptions shown on package pages", "Rewrite the text about a destination (for example Maasai Mara). It appears on every package that visits it."],
    ["FAQs", "/admin/content/faqs", `${faqLive} published of ${faqs}`, "Questions and answers shown on the homepage. The section appears once at least one is published."],
    ["Testimonials", "/admin/content/testimonials", `${testLive} published of ${tests}`, "Traveller quotes shown on the homepage. Only add real reviews from real clients."],
    ["Announcements", "/admin/content/announcements", `${annLive} live of ${anns}`, "A slim banner at the top of every page, for offers or notices. Set a start and end date if you like."],
  ];
  return (
    <>
      <div className="adm-page-head"><div><h1>Website content</h1><p>Edit what visitors see without touching code. Nothing is public until you press Publish.</p></div></div>
      <div className="adm-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
        {cards.map(([t, href, sub, text]) => (
          <Link key={t} href={href} className="adm-card content-card"><h2>{t}</h2><p className="adm-sub" style={{ marginBottom: 6 }}><b>{sub}</b></p><p className="adm-sub">{text}</p></Link>
        ))}
      </div>
      <div className="adm-card" style={{ marginTop: 14 }}>
        <h2>How it works</h2>
        <ul className="adm-steps">
          <li><b>Draft</b>: save your work as many times as you like. Visitors never see drafts.</li>
          <li><b>Preview</b>: on a package, open the preview to see the real page with your draft.</li>
          <li><b>Publish</b>: your text replaces the built-in text on the live site within moments. Anything you leave empty keeps the built-in text.</li>
          <li><b>Unpublish</b>: puts the built-in text back. You can also hide a whole package from the site.</li>
        </ul>
      </div>
    </>
  );
}

import Nav from "@/components/Nav";
import TopBar from "@/components/TopBar";
import BookingProvider from "@/components/BookingProvider";
import ContentProvider from "@/components/ContentProvider";
import { getPackageContent, getAnnouncement, safeImage } from "@/lib/content";

// Public website chrome: announcement bar, contact strip, menu and the booking pop-up shared by every public page.
// Published edits from the admin area (package titles, pictures, price labels, hidden packages) reach the cards through ContentProvider.
export default async function SiteLayout({ children }) {
  const [content, announcement] = await Promise.all([getPackageContent(), getAnnouncement()]);
  const byId = {};
  for (const [id, c] of Object.entries(content)) {
    const slim = { listed: c.listed, title: c.title, price_label: c.price_label, image_url: safeImage(c.image_url) };
    if (slim.listed === false || slim.title || slim.price_label || slim.image_url) byId[id] = slim;
  }
  const a = announcement;
  return (
    <ContentProvider byId={byId}>
      <BookingProvider>
        {a ? (
          <div className="announce" role="status">
            <div className="wrap">
              <span>{a.message}</span>
              {a.link_url ? <a href={a.link_url}>{a.link_label || "Learn more"}</a> : null}
            </div>
          </div>
        ) : null}
        <TopBar />
        <Nav />
        {children}
      </BookingProvider>
    </ContentProvider>
  );
}

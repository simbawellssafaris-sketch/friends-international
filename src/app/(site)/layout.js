import Nav from "@/components/Nav";
import TopBar from "@/components/TopBar";
import BookingProvider from "@/components/BookingProvider";

// Public website chrome: contact strip, menu and the booking pop-up shared by every public page.
export default function SiteLayout({ children }) {
  return (
    <BookingProvider>
      <TopBar />
      <Nav />
      {children}
    </BookingProvider>
  );
}

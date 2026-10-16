import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BookingProvider from "@/components/BookingProvider";

export const metadata = { title: "Page not found | Friends International Limited" };

export default function NotFound() {
  return (
    <BookingProvider>
      <Nav />
      <div className="wrap" style={{ padding: "120px 20px", textAlign: "center" }}>
        <h2>Page not found</h2>
        <p style={{ marginTop: 16 }}><Link className="btn" href="/#packages">Browse all packages</Link></p>
      </div>
      <Footer />
    </BookingProvider>
  );
}

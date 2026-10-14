import "./globals.css";
import Nav from "@/components/Nav";
import TopBar from "@/components/TopBar";
import BookingProvider from "@/components/BookingProvider";

export const metadata = {
  title: "Friends International Limited | Safaris, Beaches, Dubai & Europe",
  description:
    "Friends International Limited: budget, mid-range and luxury safaris in Kenya and Tanzania, beach holidays, Dubai and Europe tours.",
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <BookingProvider>
          <TopBar />
          <Nav />
          {children}
        </BookingProvider>
      </body>
    </html>
  );
}

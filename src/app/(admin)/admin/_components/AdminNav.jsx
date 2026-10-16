"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Only pages that exist are listed. New sections are added here as they are built.
const ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/quotations", label: "Quotations" },
  { href: "/admin/invoices", label: "Invoices" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/content", label: "Website content" },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <div className="adm-menu" role="navigation" aria-label="Admin">
      {ITEMS.map((i) => (
        <Link key={i.href} href={i.href} className={path === i.href || (i.href !== "/admin" && path.startsWith(i.href)) ? "on" : ""}>
          {i.label}
        </Link>
      ))}
    </div>
  );
}

import "./admin.css";

export const metadata = {
  title: { default: "Admin | Friends International Limited", template: "%s | Admin" },
  robots: { index: false, follow: false, nocache: true },
};

// The private admin area. Nothing here is linked from the public website and search engines are told to ignore it.
export default function AdminRootLayout({ children }) {
  return <div className="adm">{children}</div>;
}

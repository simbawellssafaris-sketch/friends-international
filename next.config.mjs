/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // pdfkit reads its font files from disk, so it must not be bundled
  serverExternalPackages: ["pdfkit"],
  // document uploads (up to 10 MB) go through server actions
  experimental: { serverActions: { bodySizeLimit: "11mb" } },
  // One official address: anyone arriving on www.friendsinternationallimited.com is sent (permanently) to the same page
  // on friendsinternationallimited.com, keeping the path and any ?filters. Other addresses (localhost, previews) are untouched.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.friendsinternationallimited.com" }],
        destination: "https://friendsinternationallimited.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

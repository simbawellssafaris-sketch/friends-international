/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // pdfkit reads its font files from disk, so it must not be bundled
  serverExternalPackages: ["pdfkit"],
  // document uploads (up to 10 MB) go through server actions
  experimental: { serverActions: { bodySizeLimit: "11mb" } },
};

export default nextConfig;

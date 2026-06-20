/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.STANDALONE_BUILD === "1" ? "standalone" : undefined,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;

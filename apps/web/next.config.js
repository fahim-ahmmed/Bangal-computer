/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.s3.amazonaws.com" },
    ],
  },
  async rewrites() {
    const apiProxyOrigin = process.env.API_PROXY_ORIGIN;

    if (!apiProxyOrigin) return [];

    return [
      {
        source: "/backend/:path*",
        destination: `${apiProxyOrigin}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

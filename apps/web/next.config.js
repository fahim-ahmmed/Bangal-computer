/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "mongoose",
    "mongodb",
    "express",
    "multer",
    "cloudinary",
    "bcryptjs",
    "nodemailer",
    "xlsx",
    "morgan",
    "cors",
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.s3.amazonaws.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/backend/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
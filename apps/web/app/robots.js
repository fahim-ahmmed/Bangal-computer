const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/cart", "/checkout"] },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}

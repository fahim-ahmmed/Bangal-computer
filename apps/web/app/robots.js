import { getSiteOrigin } from "@/lib/deployment-config";

export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/cart", "/checkout"] },
    ],
    sitemap: `${getSiteOrigin()}/sitemap.xml`,
  };
}

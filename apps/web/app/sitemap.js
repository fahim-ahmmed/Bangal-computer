const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Dynamic sitemap: static pages + every category/subcategory/brand combo +
 * every published product. Next.js serves this at /sitemap.xml automatically.
 * Regenerated per-request-ish (revalidate below) rather than at build time,
 * since the catalog changes constantly through the admin panel.
 */
export const revalidate = 3600;

async function safeJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function sitemap() {
  const staticPages = [
    "", "pc-builder", "laptop-finder", "ac-calculator", "blog", "store-locator", "contact",
  ].map((path) => ({ url: `${SITE}/${path}`, lastModified: new Date() }));

  const categoryTree = (await safeJson(`${API_URL}/categories`))?.data || [];
  const categoryUrls = [];
  for (const main of categoryTree) {
    categoryUrls.push({ url: `${SITE}/${main.slug}`, lastModified: new Date() });
    for (const sub of main.subcategories || []) {
      categoryUrls.push({ url: `${SITE}/${main.slug}/${sub.slug}`, lastModified: new Date() });
      for (const brand of sub.brands || []) {
        categoryUrls.push({ url: `${SITE}/${main.slug}/${sub.slug}/${brand.slug}`, lastModified: new Date() });
      }
    }
  }

  // Products: paginate through the public listing (capped — see note in README)
  const productUrls = [];
  const first = await safeJson(`${API_URL}/products?limit=100&page=1`);
  const pages = first?.pagination?.pages || 0;
  for (let p = 1; p <= Math.min(pages, 50); p++) {
    const json = p === 1 ? first : await safeJson(`${API_URL}/products?limit=100&page=${p}`);
    for (const prod of json?.data || []) {
      productUrls.push({ url: `${SITE}/product/${prod.slug}`, lastModified: prod.updatedAt || new Date() });
    }
  }

  return [...staticPages, ...categoryUrls, ...productUrls];
}

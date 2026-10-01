import { getApiBaseUrl } from "./deployment-config";

const API_URL = getApiBaseUrl();

/**
 * `filters` is a plain object of query params: category, subcategory,
 * brand (comma-separated slugs), minPrice, maxPrice, sort, page, limit, q.
 * Returns { items, pagination, facets }.
 */
export async function getProducts(filters = {}) {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") params.set(key, value);
    });

    const res = await fetch(`${API_URL}/products?${params.toString()}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { items: [], pagination: null, facets: { price: { min: 0, max: 0 }, brands: [] } };

    const json = await res.json();
    return { items: json.data || [], pagination: json.pagination, facets: json.facets };
  } catch {
    return { items: [], pagination: null, facets: { price: { min: 0, max: 0 }, brands: [] } };
  }
}

export async function getProductBySlug(slug) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function getRelatedProducts(slug) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}/related`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

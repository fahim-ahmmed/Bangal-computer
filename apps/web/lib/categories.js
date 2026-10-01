import { apiFetch } from "./api";
import { getApiBaseUrl } from "./deployment-config";

/** Fetch the current category tree so a fresh seed or admin change appears immediately. */
export async function getCategoryTree() {
  try {
    const res = await fetch(
      `${getApiBaseUrl()}/categories`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/** Resolves 1–3 URL segments to a category/subcategory/brand context. */
export async function resolveCategoryPath(segments) {
  const path = segments.filter(Boolean).join("/");
  try {
    return await apiFetch(`/categories/resolve/${path}`, { next: { revalidate: 300 } });
  } catch {
    return null;
  }
}

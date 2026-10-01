import { apiFetch } from "./api";
import { getApiBaseUrl } from "./deployment-config";

/**
 * Full category tree for the mega menu. Revalidated every 5 minutes
 * (ISR-style) — category structure changes rarely, so this avoids
 * hitting the API on every request while still picking up admin edits
 * reasonably fast.
 */
export async function getCategoryTree() {
  try {
    const res = await fetch(
      `${getApiBaseUrl()}/categories`,
      { next: { revalidate: 300, tags: ["categories"] } }
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

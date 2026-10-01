import { getApiBaseUrl } from "./deployment-config";

const API_URL = getApiBaseUrl();

async function wishlistFetch(path, options = {}) {
  const res = await fetch(`${API_URL}/wishlist${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `Wishlist request failed (${res.status})`);
  return json.data;
}

export const wishlistApi = {
  get: () => wishlistFetch("/"),
  add: (productId) => wishlistFetch(`/${productId}`, { method: "POST" }),
  remove: (productId) => wishlistFetch(`/${productId}`, { method: "DELETE" }),
};

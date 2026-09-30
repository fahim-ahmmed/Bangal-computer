import { getOrCreateGuestId } from "./guest";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function cartFetch(path, options = {}) {
  const res = await fetch(`${API_URL}/cart${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Guest-Id": getOrCreateGuestId() || "",
      ...options.headers,
    },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `Cart request failed (${res.status})`);
  return json.data;
}

export const cartApi = {
  get: () => cartFetch("/"),
  addItem: (productId, variantId, qty = 1) =>
    cartFetch("/items", { method: "POST", body: JSON.stringify({ productId, variantId, qty }) }),
  updateQty: (productId, qty, variantId) =>
    cartFetch(`/items/${productId}`, { method: "PUT", body: JSON.stringify({ qty, variantId }) }),
  removeItem: (productId, variantId) =>
    cartFetch(`/items/${productId}`, { method: "DELETE", body: JSON.stringify({ variantId }) }),
  merge: () => cartFetch("/merge", { method: "POST" }),
};

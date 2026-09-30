import { getOrCreateGuestId } from "./guest";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function apiCall(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Guest-Id": getOrCreateGuestId() || "",
      ...options.headers,
    },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `Request failed (${res.status})`);
  return json.data;
}

export const ordersApi = {
  create: (payload) => apiCall("/orders", { method: "POST", body: JSON.stringify(payload) }),
  get: (id) => apiCall(`/orders/${id}`),
  mine: () => apiCall("/orders/my"),
  requestReturn: (id, reason) => apiCall(`/orders/${id}/return`, { method: "POST", body: JSON.stringify({ reason }) }),
};

export const addressesApi = {
  list: () => apiCall("/account/addresses"),
  add: (address) => apiCall("/account/addresses", { method: "POST", body: JSON.stringify(address) }),
  update: (id, patch) => apiCall(`/account/addresses/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
  remove: (id) => apiCall(`/account/addresses/${id}`, { method: "DELETE" }),
};

export const accountApi = {
  me: () => apiCall("/account/me"),
};

export const couponsApi = {
  validate: (code, subtotal) => apiCall("/coupons/validate", { method: "POST", body: JSON.stringify({ code, subtotal }) }),
};

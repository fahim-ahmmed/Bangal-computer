const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function call(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `Request failed (${res.status})`);
  return json.data;
}

export const builderApi = {
  slots: () => call("/builder/slots"),
  slotProducts: (key) => call(`/builder/slots/${key}/products`),
  check: (selections) => call("/builder/check", { method: "POST", body: JSON.stringify({ selections }) }),
  setSlot: (key, subcategoryId) => call(`/builder/slots/${key}`, { method: "PUT", body: JSON.stringify({ subcategoryId }) }),
};

export const laptopFinderApi = {
  useCases: () => call("/laptop-finder/use-cases"),
  search: (params) => call(`/laptop-finder?${new URLSearchParams(params)}`),
};

export const reviewsApi = {
  list: (productId) => call(`/reviews?product=${productId}`),
  submit: (productId, rating, comment) => call("/reviews", { method: "POST", body: JSON.stringify({ productId, rating, comment }) }),
  remove: (id) => call(`/reviews/${id}`, { method: "DELETE" }),
};

export const settingsApi = {
  laptopCategory: () => call("/settings/laptop-category"),
  setLaptopCategory: (slug) => call("/settings/laptop-category", { method: "PUT", body: JSON.stringify({ slug }) }),
};

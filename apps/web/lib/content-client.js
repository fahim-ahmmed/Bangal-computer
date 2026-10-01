import { getApiBaseUrl } from "./deployment-config";

const API_URL = getApiBaseUrl();

async function call(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `Request failed (${res.status})`);
  return json;
}

export const cmsApi = {
  banners: () => call("/cms/banners", { next: { revalidate: 120 } }).then((r) => r.data),
  bannersAdmin: () => call("/cms/banners/admin").then((r) => r.data),
  addBanner: (b) => call("/cms/banners", { method: "POST", body: JSON.stringify(b) }).then((r) => r.data),
  updateBanner: (id, b) => call(`/cms/banners/${id}`, { method: "PUT", body: JSON.stringify(b) }).then((r) => r.data),
  deleteBanner: (id) => call(`/cms/banners/${id}`, { method: "DELETE" }),
  happyHour: () => call("/cms/happy-hour", { next: { revalidate: 60 } }).then((r) => r.data),
  setHappyHour: (h) => call("/cms/happy-hour", { method: "PUT", body: JSON.stringify(h) }).then((r) => r.data),
};

export const blogApi = {
  list: (page = 1) => call(`/blog?page=${page}`).catch(() => ({ data: [], pagination: null })),
  get: (slug) => call(`/blog/${slug}`).then((r) => r.data),
  adminAll: () => call("/blog/admin/all").then((r) => r.data),
  create: (post) => call("/blog", { method: "POST", body: JSON.stringify(post) }).then((r) => r.data),
  update: (id, post) => call(`/blog/${id}`, { method: "PUT", body: JSON.stringify(post) }).then((r) => r.data),
  remove: (id) => call(`/blog/${id}`, { method: "DELETE" }),
};

export const branchesApi = {
  list: () => call("/branches", { next: { revalidate: 300 } }).then((r) => r.data).catch(() => []),
  adminList: () => call("/branches/admin").then((r) => r.data),
  create: (b) => call("/branches", { method: "POST", body: JSON.stringify(b) }).then((r) => r.data),
  update: (id, b) => call(`/branches/${id}`, { method: "PUT", body: JSON.stringify(b) }).then((r) => r.data),
  remove: (id) => call(`/branches/${id}`, { method: "DELETE" }),
};

export const contactApi = {
  send: (payload) => call("/contact", { method: "POST", body: JSON.stringify(payload) }),
  adminList: (params = "") => call(`/contact${params}`).then((r) => r.data),
  setStatus: (id, status) => call(`/contact/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

export const chatApi = {
  start: (message, guestName) => call("/chat/start", { method: "POST", body: JSON.stringify({ message, guestName }) }).then((r) => r.data),
  get: (id) => call(`/chat/${id}`).then((r) => r.data),
  send: (id, text) => call(`/chat/${id}/messages`, { method: "POST", body: JSON.stringify({ text }) }).then((r) => r.data),
  adminList: (status = "open") => call(`/chat?status=${status}`).then((r) => r.data),
  reply: (id, text) => call(`/chat/${id}/reply`, { method: "POST", body: JSON.stringify({ text }) }).then((r) => r.data),
  close: (id) => call(`/chat/${id}/close`, { method: "PATCH" }),
};

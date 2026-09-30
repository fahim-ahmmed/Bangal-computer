const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const UI = {
  input:
    "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none",
  btn: "rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50",
  btnGhost: "rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:border-brand hover:text-brand",
};

/**
 * Calls the Express API with the Better Auth session cookie.
 * `body` may be a plain object (sent as JSON) or FormData (image/file uploads).
 * Returns the full JSON ({ success, data, pagination? }); throws with the API's message on errors.
 */
export async function adminFetch(path, { method = "GET", body } = {}) {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: body === undefined || isForm ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `Request failed (${res.status})`);
  return json;
}

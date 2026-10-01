import { getApiBaseUrl } from "./deployment-config";

const API_URL = getApiBaseUrl();

/**
 * Thin wrapper around fetch for talking to the separate Express API.
 * Expands in later parts (auth-aware requests, caching/ISR tags, etc.)
 */
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API request failed: ${res.status}`);
  }

  return res.json();
}

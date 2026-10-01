const DEFAULT_API_PATH = "/backend/api";

export function getApiBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL;

  if (configuredUrl && /^https?:\/\//i.test(configuredUrl)) {
    return configuredUrl.replace(/\/+$/, "");
  }

  const apiPath = (configuredUrl || DEFAULT_API_PATH).replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    return apiPath;
  }

  const backendUrl = process.env.BACKEND_INTERNAL_URL;
  if (backendUrl) {
    return new URL("/api", `${backendUrl.replace(/\/+$/, "")}/`).toString().replace(/\/+$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}${apiPath}`;
  }

  return "http://localhost:5000/api";
}

export function getSiteOrigin() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return configuredUrl.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    return "/api";
  }

  const backendUrl = process.env.BACKEND_INTERNAL_URL;
  if (backendUrl) {
    return new URL("/api", `${backendUrl.replace(/\/+$/, "")}/`).toString().replace(/\/+$/, "");
  }

  return "http://localhost:5000/api";
}

export function getSiteOrigin() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://bengalcomputer.com");

  return configuredUrl.replace(/\/+$/, "");
}
function deploymentOrigin() {
  return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
}

export function getWebOrigin() {
  return (process.env.WEB_ORIGIN || deploymentOrigin() || "http://localhost:3000").replace(/\/+$/, "");
}

export function getApiPublicUrl() {
  if (process.env.API_PUBLIC_URL) {
    return process.env.API_PUBLIC_URL.replace(/\/+$/, "");
  }

  if (deploymentOrigin()) return `${getWebOrigin()}/backend`;

  return `http://localhost:${process.env.PORT || 5000}`;
}

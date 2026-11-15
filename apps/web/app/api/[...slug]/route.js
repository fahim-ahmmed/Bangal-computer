import { invokeExpressApp } from "@/api/app.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handleApiRequest(request) {
  const url = new URL(request.url);
  const cleanPath = url.pathname.replace(/^\/backend/, "");
  const pathWithQuery = `${cleanPath}${url.search}`;

  let body = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.arrayBuffer();
  }

  return invokeExpressApp(pathWithQuery, {
    method: request.method,
    headers: request.headers,
    body,
  });
}

export {
  handleApiRequest as GET,
  handleApiRequest as POST,
  handleApiRequest as PUT,
  handleApiRequest as PATCH,
  handleApiRequest as DELETE,
  handleApiRequest as OPTIONS,
};
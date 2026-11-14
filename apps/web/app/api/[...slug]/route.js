import { getInternalApiUrl } from "@/api/app.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handleApiRequest(request) {
  try {
    const baseUrl = await getInternalApiUrl();
    const incomingUrl = new URL(request.url);
    const cleanPath = incomingUrl.pathname.replace(/^\/backend/, "");
    const targetUrl = `${baseUrl}${cleanPath}${incomingUrl.search}`;

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("connection");

    const init = {
      method: request.method,
      headers,
      redirect: "manual",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = await request.arrayBuffer();
    }

    const resp = await fetch(targetUrl, init);
    const responseHeaders = new Headers(resp.headers);
    responseHeaders.delete("transfer-encoding");

    return new Response(resp.body, {
      status: resp.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("[api-route] error:", err);
    return Response.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export {
  handleApiRequest as GET,
  handleApiRequest as POST,
  handleApiRequest as PUT,
  handleApiRequest as PATCH,
  handleApiRequest as DELETE,
  handleApiRequest as OPTIONS,
};
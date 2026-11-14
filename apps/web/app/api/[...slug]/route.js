import { Readable } from "stream";
import { EventEmitter } from "events";
import apiApp from "@/api/app.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handleApiRequest(request) {
  const url = new URL(request.url);
  const pathWithQuery = url.pathname + url.search;

  let bodyBuffer = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const ab = await request.arrayBuffer();
    bodyBuffer = Buffer.from(ab);
  }

  return new Promise((resolve) => {
    const req = new Readable({ read() {} });
    req.url = pathWithQuery;
    req.originalUrl = pathWithQuery;
    req.method = request.method;
    req.headers = Object.fromEntries(request.headers.entries());
    req.httpVersion = "1.1";
    req.httpVersionMajor = 1;
    req.httpVersionMinor = 1;
    req.connection = { remoteAddress: "127.0.0.1", encrypted: url.protocol === "https:" };
    req.socket = req.connection;

    if (bodyBuffer && bodyBuffer.length > 0) {
      req.push(bodyBuffer);
    }
    req.push(null);

    const res = new EventEmitter();
    res.statusCode = 200;
    res.statusMessage = "OK";
    res.headersSent = false;
    res._header = null;
    res.finished = false;
    res.writableEnded = false;
    res.locals = {};

    const headers = new Map();
    const chunks = [];

    res.setHeader = (name, value) => {
      headers.set(String(name).toLowerCase(), { name, value });
      return res;
    };
    res.getHeader = (name) => headers.get(String(name).toLowerCase())?.value;
    res.getHeaders = () =>
      Object.fromEntries([...headers.entries()].map(([k, v]) => [k, v.value]));
    res.getHeaderNames = () => [...headers.keys()];
    res.hasHeader = (name) => headers.has(String(name).toLowerCase());
    res.removeHeader = (name) => {
      headers.delete(String(name).toLowerCase());
    };
    res.flushHeaders = () => {};

    res.writeHead = (statusCode, statusMessage, hdrs) => {
      res.statusCode = statusCode;
      const h = typeof statusMessage === "object" ? statusMessage : hdrs;
      if (h) {
        for (const [k, v] of Object.entries(h)) res.setHeader(k, v);
      }
      res.headersSent = true;
      res._header = "sent";
      return res;
    };

    res.write = (chunk) => {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      }
      return true;
    };

    res.end = (chunk) => {
      if (chunk) res.write(chunk);
      res.headersSent = true;
      res._header = "sent";
      res.finished = true;
      res.writableEnded = true;
      res.emit("finish");

      const responseHeaders = new Headers();
      for (const { name, value } of headers.values()) {
        if (Array.isArray(value)) {
          value.forEach((v) => responseHeaders.append(name, String(v)));
        } else if (value !== undefined) {
          responseHeaders.set(name, String(value));
        }
      }

      const body = Buffer.concat(chunks);
      resolve(
        new Response([204, 304].includes(res.statusCode) ? null : body, {
          status: res.statusCode,
          headers: responseHeaders,
        })
      );
    };

    apiApp(req, res, (err) => {
      if (err) {
        console.error("[api-bridge] Unhandled error:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: false, message: err.message || "Internal Server Error" }));
      } else if (!res.writableEnded) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: false, message: "API route not found" }));
      }
    });
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
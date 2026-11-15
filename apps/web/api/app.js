import "dotenv/config";
import { Readable } from "stream";
import { EventEmitter } from "events";
import express from "express";
import path from "path";

import { connectDB } from "./src/config/db.js";
import routes from "./src/routes/index.js";
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";

const app = express();

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(async (req, res, next) => {
  if (req.path === "/api/health" || req.path === "/health") {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

// পোর্ট বা সকেট ছাড়াই সরাসরি মেমোরিতে Express রাউট রান করার ফাংশন
export async function invokeExpressApp(pathWithQuery, init = {}) {
  const method = (init.method || "GET").toUpperCase();
  const rawHeaders = init.headers instanceof Headers
    ? Object.fromEntries(init.headers.entries())
    : { ...(init.headers || {}) };

  const headers = {};
  for (const [k, v] of Object.entries(rawHeaders)) {
    if (v !== undefined) headers[k.toLowerCase()] = String(v);
  }

  let bodyBuffer = Buffer.alloc(0);
  if (init.body && method !== "GET" && method !== "HEAD") {
    if (Buffer.isBuffer(init.body)) {
      bodyBuffer = init.body;
    } else if (init.body instanceof ArrayBuffer) {
      bodyBuffer = Buffer.from(init.body);
    } else if (ArrayBuffer.isView(init.body)) {
      bodyBuffer = Buffer.from(init.body.buffer, init.body.byteOffset, init.body.byteLength);
    } else if (typeof init.body === "string") {
      bodyBuffer = Buffer.from(init.body, "utf-8");
    }
  }

  let parsedBody = {};
  const contentType = headers["content-type"] || "";
  if (bodyBuffer.length > 0 && contentType.includes("application/json")) {
    try {
      parsedBody = JSON.parse(bodyBuffer.toString("utf-8"));
    } catch {
      parsedBody = {};
    }
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (response) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(response);
    };

    // ১২ সেকেন্ডের সেফটি টাইমআউট — যাতে কখনোই 503 হ্যাং না হয়
    const timer = setTimeout(() => {
      finish(
        Response.json(
          { success: false, message: "Request timed out" },
          { status: 504 }
        )
      );
    }, 12000);

    const req = new Readable({ read() {} });
    req.url = pathWithQuery;
    req.originalUrl = pathWithQuery;
    req.method = method;
    req.headers = headers;
    req.httpVersion = "1.1";
    req.httpVersionMajor = 1;
    req.httpVersionMinor = 1;
    req.connection = { remoteAddress: "127.0.0.1", encrypted: true };
    req.socket = req.connection;

    if (!contentType.includes("multipart/form-data")) {
      req.body = parsedBody;
      req._body = true;
    } else if (bodyBuffer.length > 0) {
      req.push(bodyBuffer);
    }
    req.push(null);

    const res = new EventEmitter();
    res.statusCode = 200;
    res.statusMessage = "OK";
    res.headersSent = false;
    res.finished = false;
    res.writableEnded = false;
    res.locals = {};

    const respHeaders = new Map();
    const chunks = [];

    res.setHeader = (name, value) => {
      respHeaders.set(String(name).toLowerCase(), { name, value });
      return res;
    };
    res.getHeader = (name) => respHeaders.get(String(name).toLowerCase())?.value;
    res.getHeaders = () =>
      Object.fromEntries([...respHeaders.entries()].map(([k, v]) => [k, v.value]));
    res.getHeaderNames = () => [...respHeaders.keys()];
    res.hasHeader = (name) => respHeaders.has(String(name).toLowerCase());
    res.removeHeader = (name) => {
      respHeaders.delete(String(name).toLowerCase());
    };
    res.flushHeaders = () => {};

    res.set = res.header = (field, val) => {
      if (typeof field === "object") {
        for (const [k, v] of Object.entries(field)) res.setHeader(k, v);
      } else {
        res.setHeader(field, val);
      }
      return res;
    };
    res.get = (field) => res.getHeader(field);
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };

    res.writeHead = (statusCode, statusMessage, hdrs) => {
      res.statusCode = statusCode;
      const h = typeof statusMessage === "object" ? statusMessage : hdrs;
      if (h) {
        for (const [k, v] of Object.entries(h)) res.setHeader(k, v);
      }
      res.headersSent = true;
      return res;
    };

    res.write = (chunk) => {
      if (chunk !== undefined && chunk !== null) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      }
      return true;
    };

    res.end = (chunk) => {
      if (chunk !== undefined && chunk !== null) res.write(chunk);
      res.headersSent = true;
      res.finished = true;
      res.writableEnded = true;

      const outHeaders = new Headers();
      for (const { name, value } of respHeaders.values()) {
        if (Array.isArray(value)) {
          value.forEach((v) => outHeaders.append(name, String(v)));
        } else if (value !== undefined) {
          outHeaders.set(name, String(value));
        }
      }

      const outBody = Buffer.concat(chunks);
      finish(
        new Response([204, 304].includes(res.statusCode) ? null : outBody, {
          status: res.statusCode,
          headers: outHeaders,
        })
      );
      return res;
    };

    res.json = (data) => {
      if (!res.getHeader("content-type")) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      return res.end(JSON.stringify(data));
    };

    res.send = (data) => {
      if (typeof data === "object" && data !== null && !Buffer.isBuffer(data)) {
        return res.json(data);
      }
      return res.end(data);
    };

    res.redirect = (statusOrUrl, maybeUrl) => {
      const code = typeof statusOrUrl === "number" ? statusOrUrl : 302;
      const loc = typeof statusOrUrl === "number" ? maybeUrl : statusOrUrl;
      res.statusCode = code;
      res.setHeader("Location", loc);
      return res.end();
    };

    try {
      app(req, res, (err) => {
        if (err) {
          res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
          });
        } else if (!res.writableEnded) {
          res.status(404).json({ success: false, message: "API route not found" });
        }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
    }
  });
}

// সার্ভার সাইড (SSR) fetch ইন্টারসেপ্টর — নেটওয়ার্ক কল ছাড়াই মেমোরি থেকে ডাটা আনবে
if (typeof window === "undefined" && !globalThis.__bangalFetchPatched) {
  globalThis.__bangalFetchPatched = true;
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async function patchedServerFetch(input, init) {
    try {
      const rawUrl =
        typeof input === "string"
          ? input
          : input instanceof URL
          ? input.toString()
          : input?.url;

      if (rawUrl) {
        if (
          (rawUrl.startsWith("/api/") ||
            rawUrl === "/api" ||
            rawUrl.startsWith("/backend/api/")) &&
          !rawUrl.startsWith("/api/auth")
        ) {
          const cleanPath = rawUrl.replace(/^\/backend/, "");
          return await invokeExpressApp(cleanPath, init);
        }

        if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
          const parsed = new URL(rawUrl);
          const isOwnHost =
            parsed.hostname === "bengalcomputer.com" ||
            parsed.hostname === "www.bengalcomputer.com" ||
            parsed.hostname === "localhost" ||
            parsed.hostname === "127.0.0.1";

          if (
            isOwnHost &&
            !parsed.pathname.startsWith("/api/auth") &&
            (parsed.pathname.startsWith("/api/") ||
              parsed.pathname === "/api" ||
              parsed.pathname.startsWith("/backend/api/"))
          ) {
            const cleanPath = parsed.pathname.replace(/^\/backend/, "");
            return await invokeExpressApp(`${cleanPath}${parsed.search}`, init);
          }
        }
      }
    } catch (err) {
      console.warn("[fetch-intercept] error:", err.message);
    }
    return originalFetch(input, init);
  };
}

export default app;
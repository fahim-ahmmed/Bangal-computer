import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import path from "path";

import { connectDB } from "./src/config/db.js";
import routes from "./src/routes/index.js";
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
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

// লোকাল ইন্টারনাল HTTP সার্ভার (যাতে আসল Node.js req/res ব্যবহার হয় এবং কখনো হ্যাং না করে)
export function getInternalApiUrl() {
  if (!globalThis.__bangalApiServerPromise) {
    globalThis.__bangalApiServerPromise = new Promise((resolve, reject) => {
      const server = http.createServer(app);
      server.on("error", reject);
      server.listen(0, "127.0.0.1", () => {
        server.unref();
        const addr = server.address();
        const url = `http://127.0.0.1:${addr.port}`;
        globalThis.__bangalApiUrl = url;
        console.log(`[api-internal] Express listening on ${url}`);
        resolve(url);
      });
    });
  }
  return globalThis.__bangalApiServerPromise;
}

// সার্ভার সাইড (SSR) fetch ইন্টারসেপ্টর — যাতে bengalcomputer.com নিজেকে কল করে 503 ডেডলক না ঘটায়
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
          const base = await getInternalApiUrl();
          const cleanPath = rawUrl.replace(/^\/backend/, "");
          return originalFetch(`${base}${cleanPath}`, init);
        }

        if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
          const parsed = new URL(rawUrl);
          const internalBase = globalThis.__bangalApiUrl;
          const isAlreadyInternal = internalBase && rawUrl.startsWith(internalBase);
          const isOwnHost =
            parsed.hostname === "bengalcomputer.com" ||
            parsed.hostname === "www.bengalcomputer.com" ||
            parsed.hostname === "localhost" ||
            parsed.hostname === "127.0.0.1";

          if (
            isOwnHost &&
            !isAlreadyInternal &&
            !parsed.pathname.startsWith("/api/auth") &&
            (parsed.pathname.startsWith("/api/") ||
              parsed.pathname === "/api" ||
              parsed.pathname.startsWith("/backend/api/"))
          ) {
            const base = await getInternalApiUrl();
            const cleanPath = parsed.pathname.replace(/^\/backend/, "");
            return originalFetch(`${base}${cleanPath}${parsed.search}`, init);
          }
        }
      }
    } catch (err) {
      console.warn("[fetch-intercept] fallback:", err.message);
    }
    return originalFetch(input, init);
  };
}

export default app;
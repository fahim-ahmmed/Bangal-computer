import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import next from "next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ১. apps/api যেন apps/web/node_modules-এর সব প্যাকেজ খুঁজে পায়
const webNodeModules = path.join(__dirname, "node_modules");
const apiNodeModules = path.join(__dirname, "../api/node_modules");
if (fs.existsSync(webNodeModules) && !fs.existsSync(apiNodeModules)) {
  try {
    fs.symlinkSync(webNodeModules, apiNodeModules, "junction");
  } catch (err) {
    console.warn("[server] symlink warning:", err.message);
  }
}

const dev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 3000;

// ২. ডিফল্ট ডোমেইন ও URL সেটআপ
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bengalcomputer.com";
process.env.WEB_ORIGIN = process.env.WEB_ORIGIN || SITE_URL;
process.env.BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || SITE_URL;
process.env.NEXT_PUBLIC_SITE_URL = SITE_URL;
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || SITE_URL;
process.env.API_PUBLIC_URL = process.env.API_PUBLIC_URL || SITE_URL;

// ৩. Express API (apps/api) এবং Next.js (apps/web) লোড করা
const { default: apiApp } = await import("../api/app.js");
const nextApp = next({ dev, dir: __dirname });
const handle = nextApp.getRequestHandler();

await nextApp.prepare();

// ৪. রিকোয়েস্ট রাউটিং (Express API + Next.js)
const requestHandler = (req, res) => {
  const url = req.url || "/";

  // /backend/api/... আসলে সেটিকে /api/... বানিয়ে Express ব্যাকএন্ডে পাঠানো
  if (url.startsWith("/backend/api") || url.startsWith("/backend/uploads")) {
    req.url = url.replace(/^\/backend/, "");
    return apiApp(req, res);
  }

  // /api/auth/... রিকোয়েস্ট যাবে Next.js-এর Better Auth-এ
  if (url.startsWith("/api/auth")) {
    return handle(req, res);
  }

  // বাকি সব /api/... এবং /uploads/... রিকোয়েস্ট যাবে Express ব্যাকএন্ডে
  if (url.startsWith("/api/") || url === "/api" || url.startsWith("/uploads/")) {
    return apiApp(req, res);
  }

  // বাকি সব পেজ রিকোয়েস্ট যাবে Next.js ফ্রন্টএন্ডে
  return handle(req, res);
};

// ৫. মেইন সার্ভার চালু করা (Hostinger-এর পোর্টে)
const mainServer = http.createServer(requestHandler);
mainServer.listen(PORT, () => {
  console.log(`[server] Bangal Computer running on port ${PORT}`);
});

// ৬. ইন্টারনাল লুপব্যাক সার্ভার (SSR-এর সময় যেন 503 বা টাইমআউট না হয়)
if (Number(PORT) !== 5000) {
  const internalServer = http.createServer(requestHandler);
  internalServer.on("error", () => {
    internalServer.listen(0, "127.0.0.1", () => {
      const addr = internalServer.address();
      if (addr && typeof addr === "object") {
        process.env.BACKEND_INTERNAL_URL = `http://127.0.0.1:${addr.port}`;
      }
    });
  });
  internalServer.listen(5000, "127.0.0.1", () => {
    const addr = internalServer.address();
    if (addr && typeof addr === "object") {
      process.env.BACKEND_INTERNAL_URL = `http://127.0.0.1:${addr.port}`;
      console.log(`[internal] SSR loopback ready on http://127.0.0.1:${addr.port}`);
    }
  });
} else {
  process.env.BACKEND_INTERNAL_URL = "http://127.0.0.1:5000";
}
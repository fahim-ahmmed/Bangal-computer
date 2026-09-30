import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

import { connectDB } from "./src/config/db.js";
import routes from "./src/routes/index.js";
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.WEB_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" })); // generous enough for long descriptions/spec tables
app.use(morgan("dev"));

// Product images saved locally when Cloudinary is not configured (see lib/cloudinary.js)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[api] Bangal Computer API running → http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("[api] Failed to start:", err);
  process.exit(1);
});

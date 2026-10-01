import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

import { connectDB } from "./src/config/db.js";
import routes from "./src/routes/index.js";
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";
import { getWebOrigin } from "./src/lib/runtime-urls.js";

const app = express();

app.use(
  cors({
    origin: getWebOrigin(),
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(async (req, res, next) => {
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

export default app;

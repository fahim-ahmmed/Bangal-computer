import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./src/config/db.js";
const PORT = process.env.PORT || 5000;

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

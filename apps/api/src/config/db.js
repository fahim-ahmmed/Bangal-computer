import mongoose from "mongoose";

let isConnected = false;

/**
 * Vercel-এ পেস্ট করার সময় MONGODB_URI-তে কোটেশন, স্পেস বা
 * "MONGODB_URI=" ঢুকে যেতে পারে। এখানে পরিষ্কার করা হচ্ছে।
 */
function cleanMongoUri(raw) {
  const value = String(raw || "")
    .trim()
    .replace(/^MONGODB_URI\s*=\s*/i, "")
    .replace(/^['"]+|['"]+$/g, "")
    .trim();
  return /^mongodb(\+srv)?:\/\//.test(value) ? value : null;
}

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return mongoose.connection;

  const cleaned = cleanMongoUri(process.env.MONGODB_URI);
  if (!cleaned && process.env.NODE_ENV === "production") {
    throw new Error(
      "MONGODB_URI সঠিক নয় — Vercel-এ মান mongodb+srv:// দিয়ে শুরু হতে হবে (কোটেশন/স্পেস ছাড়া)"
    );
  }
  const uri = cleaned || "mongodb://127.0.0.1:27017/bangal-computer";

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);
  isConnected = true;

  console.log(`[db] MongoDB connected → ${mongoose.connection.name}`);

  mongoose.connection.on("error", (err) => {
    console.error("[db] MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected");
    isConnected = false;
  });

  return mongoose.connection;
}

export default connectDB;
import mongoose from "mongoose";

let connectPromise = null;

function cleanMongoUri(raw) {
  const value = String(raw || "")
    .trim()
    .replace(/^MONGODB_URI\s*=\s*/i, "")
    .replace(/^['"]+|['"]+$/g, "")
    .trim();
  return /^mongodb(\+srv)?:\/\//.test(value) ? value : null;
}

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectPromise) return connectPromise;

  const cleaned = cleanMongoUri(process.env.MONGODB_URI);
  if (!cleaned && process.env.NODE_ENV === "production") {
    throw new Error("MONGODB_URI সঠিক নয় — মান mongodb+srv:// দিয়ে শুরু হতে হবে");
  }
  const uri = cleaned || "mongodb://127.0.0.1:27017/bangal-computer";

  mongoose.set("strictQuery", true);

  connectPromise = mongoose
    .connect(uri, { serverSelectionTimeoutMS: 8000 })
    .then((conn) => {
      console.log(`[db] MongoDB connected → ${conn.connection.name}`);
      return conn.connection;
    })
    .catch((err) => {
      connectPromise = null;
      throw err;
    });

  return connectPromise;
}

export default connectDB;
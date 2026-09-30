import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return mongoose.connection;

  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bangal-computer";

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

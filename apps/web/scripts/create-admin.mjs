import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const [emailArg, password, nameArg = "Super Admin"] = process.argv.slice(2);

if (!emailArg || !password) {
  console.error("Usage: node --env-file=.env scripts/create-admin.mjs <email> <password> [name]");
  process.exit(1);
}
if (password.length < 8) {
  console.error("❌ পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের দিন।");
  process.exit(1);
}
if (!process.env.MONGODB_URI || !process.env.BETTER_AUTH_SECRET) {
  console.error("❌ MONGODB_URI বা BETTER_AUTH_SECRET পাওয়া যায়নি। apps/web/.env দেখুন।");
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db();
console.log(`☁️  Connected → database: ${db.databaseName}`);

const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  plugins: [admin({ defaultRole: "customer" })],
});

try {
  const existing = await db.collection("user").find({ email }).toArray();
  for (const u of existing) {
    const hasAccount = await db.collection("account").findOne({
      userId: { $in: [u._id, String(u._id)] },
      providerId: "credential",
    });
    if (!hasAccount) {
      await db.collection("user").deleteOne({ _id: u._id });
      await db.collection("session").deleteMany({ userId: { $in: [u._id, String(u._id)] } });
      console.log(`🧹 পুরনো ভাঙা user মুছে ফেলা হয়েছে: ${email}`);
    } else {
      console.log(`ℹ️  ${email} এর account আগেই আছে — শুধু role admin করা হবে।`);
    }
  }

  const stillThere = await db.collection("user").findOne({ email });
  if (!stillThere) {
    await auth.api.signUpEmail({ body: { name: nameArg, email, password } });
    console.log("✅ user + account তৈরি হয়েছে");
  }

  const r = await db.collection("user").updateOne(
    { email },
    { $set: { role: "admin", emailVerified: true, updatedAt: new Date() } }
  );
  if (r.matchedCount === 0) throw new Error("user পাওয়া যায়নি — signup ব্যর্থ হয়েছে");

  console.log(`🔑 ${email} এখন admin।`);
  console.log("➡️  এখন /admin/login এ গিয়ে লগইন করুন।");
  await client.close();
  process.exit(0);
} catch (err) {
  console.error("❌ Error:", err?.message || err);
  await client.close();
  process.exit(1);
}
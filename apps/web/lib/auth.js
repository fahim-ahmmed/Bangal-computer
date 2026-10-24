import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { MongoClient } from "mongodb";

/**
 * Vercel-এ MONGODB_URI পেস্ট করার সময় প্রায়ই কোটেশন, স্পেস বা
 * "MONGODB_URI=" লেখাসহ ঢুকে যায়। এখানে সেগুলো পরিষ্কার করা হচ্ছে।
 */
function cleanMongoUri(raw) {
  const value = String(raw || "")
    .trim()
    .replace(/^MONGODB_URI\s*=\s*/i, "")
    .replace(/^['"]+|['"]+$/g, "")
    .trim();
  return /^mongodb(\+srv)?:\/\//.test(value) ? value : null;
}

const cleanedUri = cleanMongoUri(process.env.MONGODB_URI);

if (!cleanedUri && process.env.NEXT_PHASE !== "phase-production-build") {
  console.error(
    "[auth] MONGODB_URI সঠিক নয় — mongodb:// বা mongodb+srv:// দিয়ে শুরু হতে হবে"
  );
}

// সঠিক URI না থাকলেও যেন বিল্ড ক্র্যাশ না করে (MongoClient প্রথম ব্যবহারের আগে কানেক্ট করে না)
const mongoUri = cleanedUri || "mongodb://127.0.0.1:27017/bangal-computer";

// Serverless-এ বারবার নতুন কানেকশন না খুলে একটাই ক্লায়েন্ট ব্যবহার
const globalForMongo = globalThis;
const client = globalForMongo._bcMongoClient ?? new MongoClient(mongoUri);
globalForMongo._bcMongoClient = client;
const db = client.db();

const siteOrigin = (
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3001")
)
  .trim()
  .replace(/\/+$/, "");

const staticOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "https://*.vercel.app",
  siteOrigin,
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.WEB_ORIGIN,
  process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`,
  process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
]
  .filter(Boolean)
  .map((u) => String(u).trim().replace(/\/+$/, ""));

export const auth = betterAuth({
  database: mongodbAdapter(db),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: siteOrigin,

  // স্ট্যাটিক তালিকার সাথে অনুরোধের নিজের host-ও ট্রাস্ট করা হচ্ছে
  trustedOrigins: async (request) => {
    const list = [...staticOrigins];
    const host =
      request?.headers?.get("x-forwarded-host") || request?.headers?.get("host");
    if (host) {
      const proto =
        host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
      list.push(`${proto}://${host}`);
    }
    return list;
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  // খালি আইডি থাকলে সোশ্যাল প্রোভাইডার ইগনোর করার লজিক
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? {
          facebook: {
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          },
        }
      : {}),
  },

  plugins: [
    admin({
      defaultRole: "customer",
      adminRoles: ["admin", "staff"],
      roles: {
        customer: {
          user: [],
          session: [],
        },
        staff: {
          user: [
            "create",
            "list",
            "set-role",
            "ban",
            "impersonate",
            "delete",
            "set-password",
            "set-email",
            "get",
            "update",
          ],
          session: ["list", "revoke", "delete"],
        },
        admin: {
          user: [
            "create",
            "list",
            "set-role",
            "ban",
            "impersonate",
            "impersonate-admins",
            "delete",
            "set-password",
            "set-email",
            "get",
            "update",
          ],
          session: ["list", "revoke", "delete"],
        },
      },
    }),
  ],

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      points: {
        type: "number",
        defaultValue: 0,
        input: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh once a day
  },
});
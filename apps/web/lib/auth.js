import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bangal-computer";
const client = new MongoClient(mongoUri);
const db = client.db();

const siteOrigin =
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3001");

export const auth = betterAuth({
  database: mongodbAdapter(db),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: siteOrigin,

  // 🚀 Invalid origin চিরতরে বন্ধ করার জন্য Trusted Origins যুক্ত করা হলো
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    siteOrigin,
  ],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  // 🚀 খালি আইডি থাকলে সোশাল প্রোভাইডার ইগনোর করার লজিক
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
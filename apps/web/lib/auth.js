import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bangal-computer";
const client = new MongoClient(mongoUri);
const db = client.db();

/**
 * Central Better Auth instance. Runs on the Next.js side (apps/web)
 * so session cookies stay same-origin and the client SDK "just works".
 * The Express API (apps/api) verifies sessions by calling
 * /api/auth/get-session with the forwarded cookie — see apps/api/src/lib/auth.js.
 */
export const auth = betterAuth({
  database: mongodbAdapter(db),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    },
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
        defaultValue: "customer", // customer | staff | admin
        input: false, // never settable directly from the client
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

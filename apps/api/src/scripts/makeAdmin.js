import "dotenv/config";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

/**
 * Usage:  npm run make-admin -- someone@example.com [staff]
 * The person must have signed up first (via /signup). Afterwards they need to
 * log out and back in so their session picks up the new role.
 */
const [email, role = "admin"] = process.argv.slice(2);

if (!email || !["admin", "staff"].includes(role)) {
  console.error("Usage: npm run make-admin -- <email> [admin|staff]");
  process.exit(1);
}

await connectDB();
const result = await User.updateOne({ email: email.toLowerCase() }, { role });
if (result.matchedCount === 0) {
  console.error(`No user found with email ${email}. Sign up first at /signup.`);
  process.exit(1);
}
console.log(`✅ ${email} is now ${role}. Log out and log in again to apply.`);
process.exit(0);

import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Better Auth (running on the apps/web side) owns the core auth
 * collections: user, session, account, verification. This model
 * mirrors the same "user" collection/name so the Express API can
 * read/extend profile fields (role, addresses, loyalty points)
 * that Better Auth itself doesn't manage. Kept minimal in Part 1 —
 * expanded in Part 7 (Account Dashboard).
 */
const addressSchema = new Schema(
  {
    label: { type: String, default: "Home" },
    line1: String,
    line2: String,
    city: String,
    area: String,
    phone: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: null },
    role: {
      type: String,
      enum: ["customer", "staff", "admin"],
      default: "customer",
    },
    addresses: { type: [addressSchema], default: [] },
    points: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "user" }
);

export default mongoose.models.User || mongoose.model("User", userSchema);

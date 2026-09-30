import mongoose from "mongoose";

const { Schema } = mongoose;

// Generic single-collection key/value store for small admin-configurable
// settings that don't deserve their own model (e.g. which category slug
// the Laptop Finder should search within).
const settingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

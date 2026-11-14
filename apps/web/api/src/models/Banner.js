import mongoose from "mongoose";

const { Schema } = mongoose;

// Homepage banners — "main" = বড় স্লাইডার, "side" = ডানের ছোট ব্যানার (সর্বোচ্চ ২টি দেখায়)
const bannerSchema = new Schema(
  {
    image: { type: String, required: true },
    link: { type: String, default: null },
    title: { type: String, default: "" },
    position: { type: String, enum: ["main", "side"], default: "main" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Banner || mongoose.model("Banner", bannerSchema);
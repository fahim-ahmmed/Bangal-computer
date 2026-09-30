import mongoose from "mongoose";

const { Schema } = mongoose;

// Homepage hero/banner slider — admin-managed images with an optional link.
const bannerSchema = new Schema(
  {
    image: { type: String, required: true },
    link: { type: String, default: null },
    title: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Banner || mongoose.model("Banner", bannerSchema);

import mongoose from "mongoose";

const { Schema } = mongoose;

const wishlistSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    productIds: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);

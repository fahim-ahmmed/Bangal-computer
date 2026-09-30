import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true }, // snapshot, avoids a join for every review list
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    verified: { type: Boolean, default: false }, // true if the user has a delivered order containing this product
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true }); // one review per user per product

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);

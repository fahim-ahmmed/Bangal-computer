import mongoose from "mongoose";

const { Schema } = mongoose;

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, default: null }, // sub-doc id inside Product.variants, if any
    qty: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const cartSchema = new Schema(
  {
    // Exactly one of these is set. userId is a string because Better Auth's
    // own id format isn't a Mongo ObjectId.
    userId: { type: String, default: null, index: true },
    guestId: { type: String, default: null, index: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

cartSchema.index({ userId: 1 }, { unique: true, partialFilterExpression: { userId: { $type: "string" } } });
cartSchema.index({ guestId: 1 }, { unique: true, partialFilterExpression: { guestId: { $type: "string" } } });

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);

import mongoose from "mongoose";

const { Schema } = mongoose;

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, default: null },
    title: { type: String, required: true }, // snapshot — product title can change later
    image: { type: String, default: null },
    unitPrice: { type: Number, required: true },
    qty: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const addressSnapshotSchema = new Schema(
  {
    label: String,
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    area: String,
    phone: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    userId: { type: String, default: null, index: true }, // null for guest checkout
    guestId: { type: String, default: null }, // lets us clear the guest cart after payment succeeds
    guestEmail: { type: String, default: null },

    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },

    shippingAddress: { type: addressSnapshotSchema, required: true },
    contactPhone: { type: String, required: true },

    couponCode: { type: String, default: null },
    discount: { type: Number, default: 0 },

    paymentMethod: { type: String, enum: ["bkash", "nagad", "card", "cod"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paymentTransactionId: { type: String, default: null }, // gateway's paymentID/trxID

    pointsAwarded: { type: Boolean, default: false }, // loyalty points given once, on delivery
    returnRequest: {
      status: { type: String, enum: ["requested", "approved", "rejected"] },
      reason: String,
      requestedAt: Date,
    },

    // Docx status flow: Pending → Confirmed → Shipped → Delivered/Returned
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "returned", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);

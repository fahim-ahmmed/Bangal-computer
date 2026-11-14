import mongoose from "mongoose";

const { Schema } = mongoose;

// Shared by the general contact form and the complaint/feedback sub-page —
// `type` just tags which form it came from.
const contactMessageSchema = new Schema(
  {
    type: { type: String, enum: ["contact", "complaint"], default: "contact" },
    name: { type: String, required: true },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    orderId: { type: String, default: null }, // optional — complaint tied to an order
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "read", "resolved"], default: "new" },
  },
  { timestamps: true }
);

export default mongoose.models.ContactMessage || mongoose.model("ContactMessage", contactMessageSchema);

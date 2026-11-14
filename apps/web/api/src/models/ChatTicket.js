import mongoose from "mongoose";

const { Schema } = mongoose;

const chatMessageSchema = new Schema(
  {
    sender: { type: String, enum: ["customer", "admin"], required: true },
    text: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * Lightweight in-site live chat: no websockets — the widget polls
 * GET /api/chat/:id every few seconds and posts new messages. Simple,
 * but works everywhere and needs no extra infrastructure. Swappable
 * for a real realtime service later without changing the data model.
 */
const chatTicketSchema = new Schema(
  {
    userId: { type: String, default: null },
    guestId: { type: String, default: null },
    guestName: { type: String, default: null },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    messages: { type: [chatMessageSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.ChatTicket || mongoose.model("ChatTicket", chatTicketSchema);

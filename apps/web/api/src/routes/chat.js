import { Router } from "express";
import ChatTicket from "../models/ChatTicket.js";
import { attachIdentity, requireRole } from "../lib/auth.js";

const router = Router();

// POST /api/chat/start — creates (or reuses the caller's) open ticket
router.post("/start", attachIdentity(), async (req, res, next) => {
  try {
    const { guestName, message } = req.body;
    const query = req.identity.userId ? { userId: req.identity.userId, status: "open" } : { guestId: req.identity.guestId, status: "open" };

    let ticket = await ChatTicket.findOne(query);
    if (!ticket) {
      ticket = new ChatTicket({
        userId: req.identity.userId || null,
        guestId: req.identity.userId ? null : req.identity.guestId,
        guestName: guestName || null,
      });
    }
    if (message?.trim()) ticket.messages.push({ sender: "customer", text: message.trim() });
    await ticket.save();
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
});

// GET /api/chat/:id — poll for new messages (customer widget)
router.get("/:id", attachIdentity(), async (req, res, next) => {
  try {
    const ticket = await ChatTicket.findById(req.params.id).lean();
    if (!ticket) return res.status(404).json({ success: false, message: "টিকেট পাওয়া যায়নি" });
    const owns = (req.identity.userId && ticket.userId === req.identity.userId) || (req.identity.guestId && ticket.guestId === req.identity.guestId);
    const isStaff = ["admin", "staff"].includes(req.identity.role);
    if (!owns && !isStaff) return res.status(403).json({ success: false, message: "অনুমতি নেই" });
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
});

// POST /api/chat/:id/messages — customer reply
router.post("/:id/messages", attachIdentity(), async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: "text আবশ্যক" });

    const ticket = await ChatTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: "টিকেট পাওয়া যায়নি" });
    const owns = (req.identity.userId && ticket.userId === req.identity.userId) || (req.identity.guestId && ticket.guestId === req.identity.guestId);
    if (!owns) return res.status(403).json({ success: false, message: "অনুমতি নেই" });

    ticket.messages.push({ sender: "customer", text: text.trim() });
    ticket.status = "open";
    await ticket.save();
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
});

// ---- Admin/staff support inbox ----
router.get("/", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { status = "open" } = req.query;
    res.json({ success: true, data: await ChatTicket.find({ status }).sort("-updatedAt").lean() });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/reply", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: "text আবশ্যক" });
    const ticket = await ChatTicket.findByIdAndUpdate(
      req.params.id,
      { $push: { messages: { sender: "admin", text: text.trim() } } },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ success: false, message: "টিকেট পাওয়া যায়নি" });
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/close", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const ticket = await ChatTicket.findByIdAndUpdate(req.params.id, { status: "closed" }, { new: true });
    if (!ticket) return res.status(404).json({ success: false, message: "টিকেট পাওয়া যায়নি" });
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
});

export default router;

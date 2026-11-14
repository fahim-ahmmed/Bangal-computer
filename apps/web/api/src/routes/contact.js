import { Router } from "express";
import ContactMessage from "../models/ContactMessage.js";
import { requireRole } from "../lib/auth.js";

const router = Router();

// POST /api/contact — public, used by both the contact page and the complaint sub-page
router.post("/", async (req, res, next) => {
  try {
    const { type = "contact", name, email, phone, orderId, subject, message } = req.body;
    if (!name || !message || (!email && !phone)) {
      return res.status(400).json({ success: false, message: "name, message এবং email বা phone-এর অন্তত একটি আবশ্যক" });
    }
    const doc = await ContactMessage.create({
      type: ["contact", "complaint"].includes(type) ? type : "contact",
      name, email, phone, orderId, subject, message,
    });
    res.status(201).json({ success: true, data: { id: doc._id } });
  } catch (err) {
    next(err);
  }
});

// ---- Admin inbox ----
router.get("/", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    res.json({ success: true, data: await ContactMessage.find(filter).sort("-createdAt").lean() });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["new", "read", "resolved"].includes(status)) {
      return res.status(400).json({ success: false, message: "status ভুল" });
    }
    const doc = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "মেসেজ পাওয়া যায়নি" });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

export default router;

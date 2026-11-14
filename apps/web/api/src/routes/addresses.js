import { Router } from "express";
import User from "../models/User.js";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// Address book for logged-in users (guests just type the address at checkout).
// Stored in the user's `addresses` array (see models/User.js).

router.get("/", requireAuth(), async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("addresses").lean();
    res.json({ success: true, data: user?.addresses || [] });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth(), async (req, res, next) => {
  try {
    const { label, line1, line2, city, area, phone, isDefault } = req.body;
    if (!line1 || !city || !phone) {
      return res.status(400).json({ success: false, message: "line1, city, phone আবশ্যক" });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "ইউজার পাওয়া যায়নি" });

    if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    user.addresses.push({ label, line1, line2, city, area, phone, isDefault: Boolean(isDefault) });
    await user.save();
    res.status(201).json({ success: true, data: user.addresses });
  } catch (err) {
    next(err);
  }
});

router.put("/:addressId", requireAuth(), async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const addr = user?.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ success: false, message: "ঠিকানা পাওয়া যায়নি" });

    const { label, line1, line2, city, area, phone, isDefault } = req.body;
    if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    Object.assign(addr, Object.fromEntries(Object.entries({ label, line1, line2, city, area, phone, isDefault }).filter(([, v]) => v !== undefined)));
    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (err) {
    next(err);
  }
});

router.delete("/:addressId", requireAuth(), async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "ইউজার পাওয়া যায়নি" });
    user.addresses = user.addresses.filter((a) => String(a._id) !== req.params.addressId);
    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (err) {
    next(err);
  }
});

export default router;

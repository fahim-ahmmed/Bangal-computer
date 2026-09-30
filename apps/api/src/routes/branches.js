import { Router } from "express";
import Branch from "../models/Branch.js";
import { requireRole } from "../lib/auth.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    res.json({ success: true, data: await Branch.find({ isActive: true }).sort("order").lean() });
  } catch (err) {
    next(err);
  }
});

router.get("/admin", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    res.json({ success: true, data: await Branch.find().sort("order").lean() });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { name, address, phone, lat, lng, hours } = req.body;
    if (!name || !address || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: "name, address, lat, lng আবশ্যক" });
    }
    const count = await Branch.countDocuments();
    const doc = await Branch.create({ name, address, phone, lat: Number(lat), lng: Number(lng), hours, order: count });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const allowed = ["name", "address", "phone", "lat", "lng", "hours", "order", "isActive"];
    const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const doc = await Branch.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "ব্রাঞ্চ পাওয়া যায়নি" });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    await Branch.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;

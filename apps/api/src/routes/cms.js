import { Router } from "express";
import Banner from "../models/Banner.js";
import Settings from "../models/Settings.js";
import { requireRole } from "../lib/auth.js";

const router = Router();

// ---- Banners (homepage slider) ----
router.get("/banners", async (req, res, next) => {
  try {
    res.json({ success: true, data: await Banner.find({ isActive: true }).sort("order").lean() });
  } catch (err) {
    next(err);
  }
});

router.get("/banners/admin", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    res.json({ success: true, data: await Banner.find().sort("order").lean() });
  } catch (err) {
    next(err);
  }
});

router.post("/banners", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { image, link, title } = req.body;
    if (!image) return res.status(400).json({ success: false, message: "image আবশ্যক" });
    const count = await Banner.countDocuments();
    const doc = await Banner.create({ image, link: link || null, title: title || "", order: count });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

router.put("/banners/:id", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const allowed = ["image", "link", "title", "order", "isActive"];
    const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const doc = await Banner.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "ব্যানার পাওয়া যায়নি" });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

router.delete("/banners/:id", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    await Banner.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ---- Happy Hour (single settings doc — a time-boxed sitewide campaign banner) ----
router.get("/happy-hour", async (req, res, next) => {
  try {
    const setting = await Settings.findOne({ key: "happyHour" }).lean();
    const data = setting?.value || { active: false };
    if (data.active && data.endsAt && new Date(data.endsAt) < new Date()) {
      return res.json({ success: true, data: { active: false } }); // expired — don't show a stale campaign
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.put("/happy-hour", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { active, title, discountText, startsAt, endsAt, bannerImage } = req.body;
    const value = { active: Boolean(active), title, discountText, startsAt, endsAt, bannerImage };
    await Settings.findOneAndUpdate({ key: "happyHour" }, { value }, { upsert: true });
    res.json({ success: true, data: value });
  } catch (err) {
    next(err);
  }
});

export default router;

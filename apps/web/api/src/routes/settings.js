import { Router } from "express";
import Settings from "../models/Settings.js";
import Category from "../models/Category.js";
import { requireRole } from "../lib/auth.js";

const router = Router();

// GET /api/settings/laptop-category — admin: current + all main categories to choose from
router.get("/laptop-category", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const [setting, categories] = await Promise.all([
      Settings.findOne({ key: "laptopCategorySlug" }).lean(),
      Category.find({ level: 0, isActive: true }).sort("order").select("name slug").lean(),
    ]);
    res.json({ success: true, data: { current: setting?.value || null, categories } });
  } catch (err) {
    next(err);
  }
});

router.put("/laptop-category", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { slug } = req.body;
    await Settings.findOneAndUpdate({ key: "laptopCategorySlug" }, { value: slug }, { upsert: true });
    res.json({ success: true, data: { slug } });
  } catch (err) {
    next(err);
  }
});

export default router;

import { Router } from "express";
import Brand from "../models/Brand.js";
import { requireRole } from "../lib/auth.js";

const router = Router();

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/brands — public, used by brand pages / filters
router.get("/", async (req, res, next) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 }).lean();
    res.json({ success: true, data: brands });
  } catch (err) {
    next(err);
  }
});

// POST /api/brands — admin
router.post("/", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { name, logo } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Brand name আবশ্যক" });

    const doc = await Brand.create({ name, slug: slugify(name), logo: logo || null });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

// PUT /api/brands/:id — admin
router.put("/:id", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { name, logo, isActive } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (logo !== undefined) update.logo = logo;
    if (isActive !== undefined) update.isActive = isActive;

    const doc = await Brand.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "Brand পাওয়া যায়নি" });

    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/brands/:id — soft delete, admin
router.delete("/:id", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const doc = await Brand.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "Brand পাওয়া যায়নি" });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

export default router;

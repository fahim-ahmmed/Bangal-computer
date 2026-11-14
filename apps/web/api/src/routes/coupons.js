import { Router } from "express";
import Coupon from "../models/Coupon.js";
import { requireRole } from "../lib/auth.js";

const router = Router();

/**
 * Shared by POST /coupons/validate and order creation, so the discount a
 * customer sees is exactly what the order charges.
 * Returns { ok, message?, coupon?, discount? }
 */
export async function evaluateCoupon(rawCode, subtotal) {
  const code = String(rawCode || "").trim().toUpperCase();
  if (!code) return { ok: false, message: "কুপন কোড দিন" };

  const coupon = await Coupon.findOne({ code, isActive: true }).lean();
  if (!coupon) return { ok: false, message: "কুপন কোডটি সঠিক নয়" };
  if (coupon.expiry && new Date(coupon.expiry) < new Date()) return { ok: false, message: "কুপনের মেয়াদ শেষ" };
  if (subtotal < (coupon.minOrder || 0)) {
    return { ok: false, message: `এই কুপনের জন্য ন্যূনতম অর্ডার ৳${coupon.minOrder}` };
  }

  let discount = coupon.type === "percent" ? Math.floor((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.type === "percent" && coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.max(0, Math.min(discount, subtotal));

  return { ok: true, coupon, discount };
}

// POST /api/coupons/validate — public (used by checkout)
router.post("/validate", async (req, res, next) => {
  try {
    const result = await evaluateCoupon(req.body.code, Number(req.body.subtotal) || 0);
    if (!result.ok) return res.status(400).json({ success: false, message: result.message });
    res.json({ success: true, data: { code: result.coupon.code, discount: result.discount } });
  } catch (err) {
    next(err);
  }
});

// ---- Admin CRUD ----
router.get("/", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    res.json({ success: true, data: await Coupon.find().sort("-createdAt").lean() });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { code, type, value, maxDiscount, minOrder, expiry } = req.body;
    if (!code || !["percent", "flat"].includes(type) || !(Number(value) > 0)) {
      return res.status(400).json({ success: false, message: "code, type (percent/flat) ও value আবশ্যক" });
    }
    if (type === "percent" && Number(value) > 100) {
      return res.status(400).json({ success: false, message: "শতাংশ ১০০-র বেশি হতে পারে না" });
    }
    const doc = await Coupon.create({
      code,
      type,
      value: Number(value),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      minOrder: minOrder ? Number(minOrder) : 0,
      expiry: expiry || null,
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: "এই কোড আগেই আছে" });
    next(err);
  }
});

router.put("/:id", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const allowed = ["type", "value", "maxDiscount", "minOrder", "expiry", "isActive"];
    const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const doc = await Coupon.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: "কুপন পাওয়া যায়নি" });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const doc = await Coupon.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "কুপন পাওয়া যায়নি" });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

export default router;

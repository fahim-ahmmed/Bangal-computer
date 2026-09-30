import { Router } from "express";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import { requireAuth } from "../lib/auth.js";

const router = Router();

function specsToObject(map) {
  return map instanceof Map ? Object.fromEntries(map) : map || {};
}

// GET /api/wishlist — populated product list
router.get("/", requireAuth(), async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id }).lean();
    if (!wishlist || wishlist.productIds.length === 0) {
      return res.json({ success: true, data: [] });
    }
    const products = await Product.find({ _id: { $in: wishlist.productIds }, ...Product.PUBLIC_FILTER })
      .populate("brandId", "name slug")
      .lean();
    res.json({ success: true, data: products.map((p) => ({ ...p, specs: specsToObject(p.specs) })) });
  } catch (err) {
    next(err);
  }
});

// POST /api/wishlist/:productId — add
router.post("/:productId", requireAuth(), async (req, res, next) => {
  try {
    const wishlist =
      (await Wishlist.findOne({ userId: req.user.id })) || new Wishlist({ userId: req.user.id });

    if (!wishlist.productIds.some((id) => String(id) === req.params.productId)) {
      wishlist.productIds.push(req.params.productId);
      await wishlist.save();
    }
    res.status(201).json({ success: true, data: wishlist.productIds });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/wishlist/:productId — remove
router.delete("/:productId", requireAuth(), async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) return res.json({ success: true, data: [] });

    wishlist.productIds = wishlist.productIds.filter((id) => String(id) !== req.params.productId);
    await wishlist.save();
    res.json({ success: true, data: wishlist.productIds });
  } catch (err) {
    next(err);
  }
});

export default router;

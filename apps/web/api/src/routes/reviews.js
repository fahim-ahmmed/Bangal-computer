import { Router } from "express";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { requireAuth } from "../lib/auth.js";

const router = Router();

async function recalcRating(productId) {
  const stats = await Review.aggregate([
    { $match: { productId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.updateOne({ _id: productId }, { "rating.avg": Math.round(avg * 10) / 10, "rating.count": count });
}

// GET /api/reviews?product=<productId> — newest first
router.get("/", async (req, res, next) => {
  try {
    const { product } = req.query;
    if (!product) return res.status(400).json({ success: false, message: "product আবশ্যক" });
    const reviews = await Review.find({ productId: product }).sort("-createdAt").lean();
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/reviews — create or update (one review per user per product).
 * body: { productId, rating (1-5), comment? }
 * "verified" = the user has a delivered order that included this product.
 */
router.post("/", requireAuth(), async (req, res, next) => {
  try {
    const { productId, rating, comment = "" } = req.body;
    if (!productId || !(Number(rating) >= 1 && Number(rating) <= 5)) {
      return res.status(400).json({ success: false, message: "productId ও rating (১-৫) আবশ্যক" });
    }

    const product = await Product.findById(productId).select("_id").lean();
    if (!product) return res.status(404).json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" });

    const verified = Boolean(
      await Order.exists({ userId: req.user.id, status: "delivered", "items.productId": productId })
    );

    const review = await Review.findOneAndUpdate(
      { productId, userId: req.user.id },
      { rating: Number(rating), comment, verified, userName: req.user.name || "ব্যবহারকারী" },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await recalcRating(productId);
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/reviews/:id — owner only (admin moderation can be added later)
router.delete("/:id", requireAuth(), async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "রিভিউ পাওয়া যায়নি" });
    if (review.userId !== req.user.id) return res.status(403).json({ success: false, message: "অনুমতি নেই" });

    await Review.deleteOne({ _id: review._id });
    await recalcRating(review.productId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;

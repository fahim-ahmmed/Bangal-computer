import { Router } from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { requireRole } from "../lib/auth.js";

const router = Router();

// GET /api/admin/stats — dashboard summary cards (full analytics arrive in Part 10)
router.get("/stats", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const [products, published, orders, pendingOrders, lowStock, users, revenue] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, status: "published" }),
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Product.countDocuments({ isActive: true, stock: { $lte: 5 } }),
      User.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    ]);
    res.json({
      success: true,
      data: { products, published, orders, pendingOrders, lowStock, users, revenue: revenue[0]?.total || 0 },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users?q=&page=
router.get("/users", requireRole("admin"), async (req, res, next) => {
  try {
    const { q, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (q) {
      const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ email: rx }, { name: rx }, { phone: rx }];
    }
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
    const [items, total] = await Promise.all([
      User.find(filter)
        .select("name email phone role points createdAt")
        .sort("-createdAt")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: items, pagination: { page: pageNum, limit: limitNum, total } });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id/role — admin only
router.patch("/users/:id/role", requireRole("admin"), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["customer", "staff", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "role হবে customer, staff বা admin" });
    }
    if (String(req.user.id) === req.params.id && role !== "admin") {
      return res.status(400).json({ success: false, message: "নিজের admin রোল সরানো যাবে না" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("name email role");
    if (!user) return res.status(404).json({ success: false, message: "ইউজার পাওয়া যায়নি" });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/analytics?days=14
 * Full analytics arrive here in Part 10: revenue-by-day (for a simple bar
 * chart), order status breakdown, and top products by revenue — built off
 * paid orders only, so a pending/failed order never inflates the numbers.
 */
router.get("/analytics", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const days = Math.min(90, Math.max(7, parseInt(req.query.days, 10) || 14));
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const [revenueByDay, statusCounts, topProducts, paymentMethodCounts] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $unwind: "$items" },
        { $group: { _id: "$items.productId", title: { $first: "$items.title" }, qty: { $sum: "$items.qty" }, revenue: { $sum: "$items.lineTotal" } } },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),
      Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: "$paymentMethod", count: { $sum: 1 } } }]),
    ]);

    // Fill in zero-revenue days so the chart has no gaps
    const byDate = Object.fromEntries(revenueByDay.map((r) => [r._id, r]));
    const series = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      series.push({ date: key, revenue: byDate[key]?.revenue || 0, orders: byDate[key]?.orders || 0 });
    }

    res.json({
      success: true,
      data: {
        revenueByDay: series,
        statusCounts: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
        paymentMethodCounts: Object.fromEntries(paymentMethodCounts.map((s) => [s._id, s.count])),
        topProducts,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;

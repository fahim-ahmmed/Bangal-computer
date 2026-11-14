import { Router } from "express";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { serializeCart } from "./cart.js";
import { evaluateCoupon } from "./coupons.js";
import { initiatePayment } from "../lib/payments/index.js";
import { requireAuth, requireRole, requireAuthOrGuest, getSessionFromRequest } from "../lib/auth.js";
import { notifyOrderStatus } from "../lib/notify.js";

const router = Router();

const PAYMENT_METHODS = ["bkash", "nagad", "card", "cod"];

// Flow from the plan doc: Pending → Confirmed → Shipped → Delivered/Returned
const TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  returned: [],
  cancelled: [],
};

function shippingFeeFor(city = "") {
  return city.toLowerCase().includes("dhaka") ? 60 : 120; // adjust to your delivery policy
}

/** Atomically takes stock for every line; rolls back if any line can't be fulfilled. */
async function reserveStock(items) {
  const taken = [];
  for (const item of items) {
    const filter = item.variantId
      ? { _id: item.productId, variants: { $elemMatch: { _id: item.variantId, stock: { $gte: item.qty } } } }
      : { _id: item.productId, stock: { $gte: item.qty } };
    const update = item.variantId
      ? { $inc: { "variants.$.stock": -item.qty } }
      : { $inc: { stock: -item.qty } };

    const r = await Product.updateOne(filter, update);
    if (r.modifiedCount !== 1) {
      await restoreStock(taken);
      return { ok: false, failedTitle: item.title };
    }
    taken.push(item);
  }
  return { ok: true };
}

export async function restoreStock(items) {
  for (const item of items) {
    const filter = item.variantId ? { _id: item.productId, "variants._id": item.variantId } : { _id: item.productId };
    const update = item.variantId
      ? { $inc: { "variants.$.stock": item.qty } }
      : { $inc: { stock: item.qty } };
    await Product.updateOne(filter, update);
  }
}

export async function clearCartFor(order) {
  const query = order.userId ? { userId: order.userId } : order.guestId ? { guestId: order.guestId } : null;
  if (query) await Cart.updateOne(query, { $set: { items: [] } });
}

/**
 * POST /api/orders
 * body: { shippingAddress: {line1, line2?, city, area?, phone, label?}, paymentMethod,
 *         contactPhone?, guestEmail?, saveAddress? }
 * Works for guests (X-Guest-Id header) and logged-in users.
 * COD → order created immediately. Online methods → returns { checkoutUrl } to redirect to.
 */
router.post("/", requireAuthOrGuest(), async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, guestEmail, saveAddress, couponCode } = req.body;

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "পেমেন্ট মেথড সঠিক নয়" });
    }
    if (!shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.phone) {
      return res.status(400).json({ success: false, message: "ঠিকানা (line1, city) ও ফোন নম্বর আবশ্যক" });
    }

    const identityQuery = req.identity.userId ? { userId: req.identity.userId } : { guestId: req.identity.guestId };
    const cart = await Cart.findOne(identityQuery).lean();
    const serialized = await serializeCart(cart || { items: [] });
    if (serialized.items.length === 0) {
      return res.status(400).json({ success: false, message: "কার্ট খালি" });
    }

    const items = serialized.items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      title: i.variantName ? `${i.title} (${i.variantName})` : i.title,
      image: i.image,
      unitPrice: i.unitPrice,
      qty: i.qty,
      lineTotal: i.lineTotal,
    }));

    // Coupon is checked BEFORE taking stock so an invalid code never needs a rollback
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const c = await evaluateCoupon(couponCode, serialized.subtotal);
      if (!c.ok) return res.status(400).json({ success: false, message: c.message });
      discount = c.discount;
      appliedCoupon = c.coupon.code;
    }

    const stock = await reserveStock(items);
    if (!stock.ok) {
      return res.status(409).json({ success: false, message: `"${stock.failedTitle}" পর্যাপ্ত স্টকে নেই` });
    }

    const shippingFee = shippingFeeFor(shippingAddress.city);
    let order;
    try {
      order = await Order.create({
        userId: req.identity.userId || null,
        guestId: req.identity.guestId || null,
        guestEmail: guestEmail || null,
        items,
        subtotal: serialized.subtotal,
        shippingFee,
        couponCode: appliedCoupon,
        discount,
        total: serialized.subtotal - discount + shippingFee,
        shippingAddress,
        contactPhone: shippingAddress.phone,
        paymentMethod,
      });
    } catch (err) {
      await restoreStock(items);
      throw err;
    }

    if (req.identity.userId && saveAddress) {
      User.updateOne({ _id: req.identity.userId }, { $push: { addresses: shippingAddress } }).catch(() => {});
    }

    if (paymentMethod === "cod") {
      await clearCartFor(order);
      return res.status(201).json({ success: true, data: { order } });
    }

    try {
      const payment = await initiatePayment(paymentMethod, order);
      order.paymentTransactionId = payment.transactionRef;
      await order.save();
      return res.status(201).json({ success: true, data: { order, checkoutUrl: payment.checkoutUrl } });
    } catch (err) {
      await restoreStock(items);
      await Order.deleteOne({ _id: order._id });
      console.error("[orders] payment initiation failed:", err.message);
      return res.status(502).json({ success: false, message: "পেমেন্ট শুরু করা যায়নি, আবার চেষ্টা করুন" });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/my — logged-in user's order history
router.get("/my", requireAuth(), async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort("-createdAt").lean();
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/admin/all — admin/staff listing
router.get("/admin/all", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 30 } = req.query;
    const filter = status ? { status } : {};
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
    const [items, total] = await Promise.all([
      Order.find(filter).sort("-createdAt").skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, data: items, pagination: { page: pageNum, limit: limitNum, total } });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id — owner, matching guest (X-Guest-Id), or admin/staff
router.get("/:id", async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ success: false, message: "অর্ডার পাওয়া যায়নি" });

    const session = await getSessionFromRequest(req);
    const isStaff = ["admin", "staff"].includes(session?.user?.role);
    const isOwner = session?.user?.id && order.userId === session.user.id;
    const isGuestOwner = order.guestId && req.headers["x-guest-id"] === order.guestId;

    if (!isStaff && !isOwner && !isGuestOwner) {
      return res.status(403).json({ success: false, message: "অনুমতি নেই" });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status — admin/staff, enforces the status flow
router.patch("/:id/status", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "অর্ডার পাওয়া যায়নি" });

    if (!TRANSITIONS[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `"${order.status}" থেকে "${status}"-এ যাওয়া যাবে না`,
      });
    }

    if (status === "cancelled") await restoreStock(order.items);
    if (status === "delivered" && order.paymentMethod === "cod") order.paymentStatus = "paid";

    // Loyalty points: ৳100 spent = 1 point, awarded once when the order is delivered
    if (status === "delivered" && order.userId && !order.pointsAwarded) {
      const points = Math.floor(order.total / 100);
      try {
        if (points > 0) await User.updateOne({ _id: order.userId }, { $inc: { points } });
        order.pointsAwarded = true;
      } catch (err) {
        console.error("[orders] could not award points:", err.message);
      }
    }

    order.status = status;
    await order.save();

    // Best-effort — never blocks the response on a slow/misconfigured SMS/email provider
    (async () => {
      const email = order.userId ? (await User.findById(order.userId).select("email").lean())?.email : order.guestEmail;
      notifyOrderStatus(order, status, email);
    })().catch(() => {});

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/:id/return — customer asks to return a delivered order
router.post("/:id/return", requireAuth(), async (req, res, next) => {
  try {
    const reason = String(req.body.reason || "").trim();
    if (!reason) return res.status(400).json({ success: false, message: "রিটার্নের কারণ লিখুন" });

    const order = await Order.findById(req.params.id);
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "অর্ডার পাওয়া যায়নি" });
    }
    if (order.status !== "delivered") {
      return res.status(400).json({ success: false, message: "শুধু ডেলিভারড অর্ডার রিটার্ন করা যায়" });
    }
    if (order.returnRequest?.status) {
      return res.status(409).json({ success: false, message: "রিটার্ন রিকোয়েস্ট আগেই জমা দেওয়া হয়েছে" });
    }

    order.returnRequest = { status: "requested", reason, requestedAt: new Date() };
    await order.save();
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/return — admin/staff approve or reject. body: { decision: "approved" | "rejected" }
router.patch("/:id/return", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { decision } = req.body;
    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ success: false, message: "decision হবে approved বা rejected" });
    }
    const order = await Order.findById(req.params.id);
    if (!order || order.returnRequest?.status !== "requested") {
      return res.status(404).json({ success: false, message: "অপেক্ষমাণ রিটার্ন রিকোয়েস্ট নেই" });
    }
    order.returnRequest.status = decision;
    if (decision === "approved") order.status = "returned"; // stock is NOT auto-restored: returned goods may be faulty
    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

export default router;

import { Router } from "express";
import Order from "../models/Order.js";
import { confirmPayment } from "../lib/payments/index.js";
import { getWebOrigin } from "../lib/runtime-urls.js";
import { restoreStock, clearCartFor } from "./orders.js";

const router = Router();

const okUrl = (id) => `${getWebOrigin()}/order-confirmation/${id}`;
const failUrl = (id) => `${getWebOrigin()}/checkout/failed${id ? `?orderId=${id}` : ""}`;

async function markFailed(order) {
  if (order.paymentStatus === "pending") {
    order.paymentStatus = "failed";
    order.status = "cancelled";
    await order.save();
    await restoreStock(order.items);
  }
}

/**
 * GET /api/payments/callback/:method
 * The gateway (or our mock) redirects the customer's browser here after payment.
 * bKash sends ?paymentID=...&status=success|failure|cancel
 * Mock (dev only) sends ?orderId=...&status=success&mock=1
 * Idempotent: a repeated callback for an already-paid order just redirects to success.
 */
router.get("/callback/:method", async (req, res) => {
  try {
    const { method } = req.params;
    const { paymentID, orderId, status, mock } = req.query;

    const order = mock
      ? await Order.findById(orderId)
      : await Order.findOne({ paymentTransactionId: paymentID, paymentMethod: method });

    if (!order) return res.redirect(failUrl());
    if (order.paymentStatus === "paid") return res.redirect(okUrl(order._id));

    if (status !== "success") {
      await markFailed(order);
      return res.redirect(failUrl(order._id));
    }

    const result = await confirmPayment(method, { paymentID: paymentID || order.paymentTransactionId, mock: Boolean(mock) });
    if (!result.paid) {
      await markFailed(order);
      return res.redirect(failUrl(order._id));
    }

    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.paymentTransactionId = result.trxId || order.paymentTransactionId;
    await order.save();
    await clearCartFor(order);

    res.redirect(okUrl(order._id));
  } catch (err) {
    console.error("[payments] callback error:", err);
    res.redirect(failUrl());
  }
});

export default router;

import * as bkash from "./bkash.js";
import * as nagad from "./nagad.js";
import * as card from "./card.js";

const gateways = { bkash, nagad, card };

const API_PUBLIC_URL = process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`;

export function callbackUrlFor(method) {
  return `${API_PUBLIC_URL}/api/payments/callback/${method}`;
}

/**
 * Starts an online payment. Returns { checkoutUrl, transactionRef, mock }.
 * With no gateway credentials (local dev) it returns a mock checkout URL that
 * hits our own callback with status=success, so the full order flow can be
 * tested end-to-end. Mock mode is disabled in production.
 */
export async function initiatePayment(method, order) {
  const gw = gateways[method];
  if (!gw) throw new Error(`Unknown payment method: ${method}`);

  if (gw.isConfigured()) {
    const result = await gw.createPayment({ order, callbackURL: callbackUrlFor(method) });
    return { ...result, mock: false };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(`${method} gateway is not configured`);
  }
  return {
    checkoutUrl: `${callbackUrlFor(method)}?orderId=${order._id}&status=success&mock=1`,
    transactionRef: `MOCK-${order._id}`,
    mock: true,
  };
}

/** Confirms payment on callback. Returns { paid, trxId }. */
export async function confirmPayment(method, { paymentID, mock }) {
  if (mock) {
    if (process.env.NODE_ENV === "production") return { paid: false, trxId: null };
    return { paid: true, trxId: paymentID };
  }
  return gateways[method].executePayment(paymentID);
}

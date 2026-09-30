/**
 * Card payments — NOT yet wired to a gateway.
 * In Bangladesh card payments usually go through an aggregator such as
 * SSLCommerz (or Stripe for international cards). Pick one once you have a
 * merchant account, then implement createPayment/executePayment here with
 * the same signatures as bkash.js. Until then the mock flow is used.
 */
export function isConfigured() {
  return false;
}

export async function createPayment() {
  throw new Error("Card gateway integration is not implemented yet");
}

export async function executePayment() {
  throw new Error("Card gateway integration is not implemented yet");
}

/**
 * bKash Tokenized Checkout (v1.2.0-beta) — sandbox/production.
 * Flow: grant token → create payment (returns bkashURL) → customer pays on
 * bKash → bKash redirects to our callbackURL → we call execute → done.
 *
 * Env: BKASH_BASE_URL (sandbox: https://tokenized.sandbox.bka.sh/v1.2.0-beta),
 *      BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, BKASH_PASSWORD
 * Credentials come from bKash merchant onboarding. When they are not set
 * (local dev), isConfigured() is false and payments/index.js uses the mock flow.
 */

const BASE = process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta";

export function isConfigured() {
  return Boolean(
    process.env.BKASH_APP_KEY &&
      process.env.BKASH_APP_SECRET &&
      process.env.BKASH_USERNAME &&
      process.env.BKASH_PASSWORD
  );
}

async function grantToken() {
  const res = await fetch(`${BASE}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      username: process.env.BKASH_USERNAME,
      password: process.env.BKASH_PASSWORD,
    },
    body: JSON.stringify({
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET,
    }),
  });
  const json = await res.json();
  if (!json.id_token) throw new Error(`bKash token grant failed: ${json.statusMessage || res.status}`);
  return json.id_token;
}

function authHeaders(idToken) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    authorization: idToken,
    "x-app-key": process.env.BKASH_APP_KEY,
  };
}

/** Returns { checkoutUrl, transactionRef (paymentID) } */
export async function createPayment({ order, callbackURL }) {
  const idToken = await grantToken();
  const res = await fetch(`${BASE}/tokenized/checkout/create`, {
    method: "POST",
    headers: authHeaders(idToken),
    body: JSON.stringify({
      mode: "0011",
      payerReference: order.contactPhone,
      callbackURL,
      amount: String(order.total),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: String(order._id),
    }),
  });
  const json = await res.json();
  if (!json.bkashURL) throw new Error(`bKash create failed: ${json.statusMessage || res.status}`);
  return { checkoutUrl: json.bkashURL, transactionRef: json.paymentID };
}

/** Returns { paid: boolean, trxId } */
export async function executePayment(paymentID) {
  const idToken = await grantToken();
  const res = await fetch(`${BASE}/tokenized/checkout/execute`, {
    method: "POST",
    headers: authHeaders(idToken),
    body: JSON.stringify({ paymentID }),
  });
  const json = await res.json();
  return { paid: json.transactionStatus === "Completed", trxId: json.trxID || paymentID };
}

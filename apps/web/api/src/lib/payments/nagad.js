/**
 * Nagad — NOT yet wired to the live/sandbox API.
 * Nagad's checkout needs merchant onboarding (merchant ID + RSA key pair
 * for encrypting the initialize/complete payloads). Until those exist,
 * isConfigured() stays false and payments/index.js runs the mock flow so
 * the whole checkout is testable. When you get credentials, implement
 * createPayment/executePayment here with the same signatures as bkash.js.
 */
export function isConfigured() {
  return false;
}

export async function createPayment() {
  throw new Error("Nagad live integration is not implemented yet");
}

export async function executePayment() {
  throw new Error("Nagad live integration is not implemented yet");
}

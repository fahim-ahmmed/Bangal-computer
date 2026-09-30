export function formatBDT(amount) {
  if (amount === null || amount === undefined) return "";
  return `৳${Number(amount).toLocaleString("en-BD")}`;
}

/**
 * StarTech-style "EMI available" box: a few common 0%-interest tenures.
 * Real bank EMI terms/interest vary by card issuer — this is a display
 * estimate, wired up to a real EMI/payment gateway in Part 6.
 */
export function getEmiOptions(price) {
  if (!price) return [];
  return [3, 6, 12].map((months) => ({
    months,
    monthly: Math.ceil(price / months),
  }));
}

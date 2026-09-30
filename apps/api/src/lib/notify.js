/**
 * Email/SMS notifications for order status changes.
 * Email: uses SMTP via nodemailer when SMTP_* env vars are set.
 * SMS: BD gateways (SSL Wireless, Alpha SMS, etc.) all take an API-key +
 *      HTTP POST, but the exact contract differs per provider, so this
 *      stays a stub with a clear seam — fill in fetch() once you pick one.
 * With nothing configured (local dev), both just log to the console so
 * the whole order flow (and what a customer WOULD have received) stays
 * testable without real credentials.
 */

let transporterPromise = null;
function getTransporter() {
  if (transporterPromise) return transporterPromise;
  transporterPromise = (async () => {
    if (!process.env.SMTP_HOST) return null;
    const nodemailer = await import("nodemailer");
    return nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  })();
  return transporterPromise;
}

export async function sendEmail(to, subject, html) {
  if (!to) return;
  try {
    const transporter = await getTransporter();
    if (!transporter) {
      console.log(`[notify:email:MOCK] to=${to} subject="${subject}"\n${html}`);
      return;
    }
    await transporter.sendMail({ from: process.env.SMTP_FROM || "no-reply@bangalcomputer.com", to, subject, html });
  } catch (err) {
    console.error("[notify:email] failed:", err.message);
  }
}

export async function sendSms(to, message) {
  if (!to) return;
  if (!process.env.SMS_API_KEY) {
    console.log(`[notify:sms:MOCK] to=${to} "${message}"`);
    return;
  }
  try {
    // TODO: replace with your SMS provider's actual endpoint/payload shape.
    await fetch(process.env.SMS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: process.env.SMS_API_KEY, to, message }),
    });
  } catch (err) {
    console.error("[notify:sms] failed:", err.message);
  }
}

const STATUS_TEXT = {
  confirmed: "কনফার্ম করা হয়েছে",
  shipped: "শিপ করা হয়েছে",
  delivered: "ডেলিভারি সম্পন্ন হয়েছে",
  returned: "রিটার্ন সম্পন্ন হয়েছে",
  cancelled: "বাতিল করা হয়েছে",
};

/** Fire-and-forget — callers never await this on the request's critical path. */
export function notifyOrderStatus(order, status, email) {
  const text = STATUS_TEXT[status];
  if (!text) return;
  const orderRef = `#${String(order._id).slice(-8).toUpperCase()}`;
  sendSms(order.contactPhone, `Bangal Computer: আপনার অর্ডার ${orderRef} ${text}।`);
  if (email) {
    sendEmail(
      email,
      `আপনার অর্ডার ${orderRef} ${text} — Bangal Computer`,
      `<p>আপনার অর্ডার ${orderRef} ${text}।</p><p>মোট: ৳${order.total}</p>`
    );
  }
}

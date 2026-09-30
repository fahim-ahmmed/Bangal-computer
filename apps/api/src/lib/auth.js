/**
 * Better Auth itself runs on the Next.js side (apps/web) because that's
 * where the auth route handler + cookies are simplest to manage.
 *
 * The Express API is a separate server, so to know "who is calling me"
 * it forwards the incoming request's cookies to the web app's
 * `/api/auth/get-session` endpoint and trusts the result. This keeps a
 * single source of truth for sessions (no duplicated JWT logic) and
 * still lets the API enforce role-based access (customer/staff/admin).
 *
 * Full role-guarded route usage starts from Part 3 (product CRUD) —
 * this file just exposes the reusable middleware.
 */

const WEB_ORIGIN = process.env.WEB_ORIGIN || "http://localhost:3000";

export async function getSessionFromRequest(req) {
  const cookie = req.headers.cookie;
  if (!cookie) return null;

  try {
    const resp = await fetch(`${WEB_ORIGIN}/api/auth/get-session`, {
      headers: { cookie },
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data?.session ? data : null;
  } catch (err) {
    console.error("[auth] failed to verify session with web app:", err.message);
    return null;
  }
}

export function requireAuth() {
  return async (req, res, next) => {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ success: false, message: "Login প্রয়োজন" });
    }
    req.user = session.user;
    next();
  };
}

export function requireRole(...roles) {
  return async (req, res, next) => {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ success: false, message: "Login প্রয়োজন" });
    }
    if (!roles.includes(session.user.role)) {
      return res.status(403).json({ success: false, message: "অনুমতি নেই" });
    }
    req.user = session.user;
    next();
  };
}

/**
 * Resolves "who is making this request" for cart/wishlist-style routes
 * that work for both guests and logged-in users:
 *   - If a valid session cookie is present → req.identity = { userId }
 *   - Otherwise → req.identity = { guestId } from the X-Guest-Id header
 *     (the web app generates/stores this in localStorage per browser)
 * Never rejects the request — callers decide what an anonymous guest
 * with no guestId header is allowed to do (usually: empty cart).
 */
export function attachIdentity() {
  return async (req, res, next) => {
    const session = await getSessionFromRequest(req);
    if (session?.user?.id) {
      req.identity = { userId: session.user.id, role: session.user.role };
    } else {
      const guestId = req.headers["x-guest-id"];
      req.identity = guestId ? { guestId } : {};
    }
    next();
  };
}

export function requireAuthOrGuest() {
  return async (req, res, next) => {
    const session = await getSessionFromRequest(req);
    if (session?.user?.id) {
      req.identity = { userId: session.user.id };
      return next();
    }
    const guestId = req.headers["x-guest-id"];
    if (!guestId) {
      return res.status(400).json({ success: false, message: "X-Guest-Id হেডার আবশ্যক" });
    }
    req.identity = { guestId };
    next();
  };
}

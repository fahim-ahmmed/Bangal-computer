export async function getSessionFromRequest(req) {
  const cookie = req.headers?.cookie;
  if (!cookie) return null;

  try {
    const webAuthModule = await import("@/lib/auth");
    const auth = webAuthModule.auth || webAuthModule.default;
    if (!auth?.api?.getSession) return null;

    const headers = new Headers();
    headers.set("cookie", cookie);
    const data = await auth.api.getSession({ headers });
    return data?.session ? data : null;
  } catch (err) {
    console.error("[auth] session check error:", err.message);
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

export function attachIdentity() {
  return async (req, res, next) => {
    const session = await getSessionFromRequest(req);
    if (session?.user?.id) {
      req.identity = { userId: session.user.id, role: session.user.role };
    } else {
      const guestId = req.headers?.["x-guest-id"];
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
    const guestId = req.headers?.["x-guest-id"];
    if (!guestId) {
      return res.status(400).json({ success: false, message: "X-Guest-Id হেডার আবশ্যক" });
    }
    req.identity = { guestId };
    next();
  };
}
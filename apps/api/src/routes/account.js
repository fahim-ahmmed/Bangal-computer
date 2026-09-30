import { Router } from "express";
import User from "../models/User.js";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// GET /api/account/me — profile bits the dashboard needs (loyalty points etc.)
router.get("/me", requireAuth(), async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("name email phone points role").lean();
    res.json({ success: true, data: user || { name: req.user.name, email: req.user.email, points: 0 } });
  } catch (err) {
    next(err);
  }
});

export default router;

import { Router } from "express";
import Banner from "../models/Banner.js";
import Settings from "../models/Settings.js";
import { requireRole } from "../lib/auth.js";
import { uploadBuffer } from "../lib/cloudinary.js";
import { uploadImages } from "../middleware/upload.js";

const router = Router();

// ---- Banners (homepage slider + side banners) ----
router.get("/banners", async (req, res, next) => {
  try {
    res.json({ success: true, data: await Banner.find({ isActive: true }).sort("order").lean() });
  } catch (err) {
    next(err);
  }
});

router.get("/banners/admin", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    res.json({ success: true, data: await Banner.find().sort("order").lean() });
  } catch (err) {
    next(err);
  }
});

// POST /api/cms/banners/upload — ডিভাইস থেকে ছবি আপলোড (multipart, field name: "image")
// Cloudinary সেট থাকলে Cloudinary-তে, না থাকলে (লোকাল ডেভ) apps/api/uploads ফোল্ডারে সেভ হয়।
router.post("/banners/upload", requireRole("admin", "staff"), uploadImages.single("image"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "কোনো ইমেজ পাওয়া যায়নি" });
    const uploaded = await uploadBuffer(req.file.buffer, {
      folder: "bangal-computer/banners",
      mimetype: req.file.mimetype,
    });
    res.status(201).json({ success: true, data: { url: uploaded.secure_url } });
  } catch (err) {
    next(err);
  }
});

router.post("/banners", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { image, link, title, position } = req.body;
    if (!image) return res.status(400).json({ success: false, message: "image আবশ্যক" });
    const count = await Banner.countDocuments();
    const doc = await Banner.create({
      image,
      link: link || null,
      title: title || "",
      position: position === "side" ? "side" : "main",
      order: count,
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

router.put("/banners/:id", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const allowed = ["image", "link", "title", "order", "isActive", "position"];
    const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    if (update.position && !["main", "side"].includes(update.position)) delete update.position;
    const doc = await Banner.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "ব্যানার পাওয়া যায়নি" });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

router.delete("/banners/:id", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    await Banner.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ---- Happy Hour (single settings doc — a time-boxed sitewide campaign banner) ----

// Public: শুধু চালু ও সময়সীমার মধ্যে থাকলেই দেখায়
router.get("/happy-hour", async (req, res, next) => {
  try {
    const setting = await Settings.findOne({ key: "happyHour" }).lean();
    const data = setting?.value || { active: false };
    const now = new Date();
    const notStarted = data.startsAt && new Date(data.startsAt) > now;
    const expired = data.endsAt && new Date(data.endsAt) < now;
    if (data.active && (notStarted || expired)) {
      return res.json({ success: true, data: { active: false } });
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// Admin: সেভ করা মান যেমন আছে তেমন ফেরত দেয় (ফর্মে দেখানোর জন্য)
router.get("/happy-hour/admin", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const setting = await Settings.findOne({ key: "happyHour" }).lean();
    res.json({ success: true, data: setting?.value || { active: false } });
  } catch (err) {
    next(err);
  }
});

router.put("/happy-hour", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { active, title, discountText, startsAt, endsAt, bannerImage } = req.body;
    const value = { active: Boolean(active), title, discountText, startsAt, endsAt, bannerImage };
    await Settings.findOneAndUpdate({ key: "happyHour" }, { value }, { upsert: true });
    res.json({ success: true, data: value });
  } catch (err) {
    next(err);
  }
});

export default router;
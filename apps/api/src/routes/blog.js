import { Router } from "express";
import BlogPost from "../models/BlogPost.js";
import { requireRole } from "../lib/auth.js";

const router = Router();

function slugify(str) {
  return String(str).toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// GET /api/blog?page=&limit= — public, published only
router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(30, Math.max(1, parseInt(limit, 10) || 9));
    const filter = { isPublished: true };
    const [items, total] = await Promise.all([
      BlogPost.find(filter).select("title slug coverImage excerpt authorName publishedAt").sort("-publishedAt").skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      BlogPost.countDocuments(filter),
    ]);
    res.json({ success: true, data: items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (err) {
    next(err);
  }
});

router.get("/admin/all", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    res.json({ success: true, data: await BlogPost.find().sort("-createdAt").lean() });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, isPublished: true }).lean();
    if (!post) return res.status(404).json({ success: false, message: "পোস্ট পাওয়া যায়নি" });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { title, coverImage, excerpt, content, isPublished } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, message: "title ও content আবশ্যক" });
    let slug = slugify(title);
    if (await BlogPost.findOne({ slug })) slug = `${slug}-${Date.now().toString(36)}`;
    const doc = await BlogPost.create({
      title, slug, coverImage, excerpt, content,
      isPublished: Boolean(isPublished),
      publishedAt: isPublished ? new Date() : null,
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const allowed = ["title", "coverImage", "excerpt", "content", "isPublished"];
    const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const existing = await BlogPost.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "পোস্ট পাওয়া যায়নি" });
    if (update.isPublished && !existing.publishedAt) update.publishedAt = new Date();
    Object.assign(existing, update);
    await existing.save();
    res.json({ success: true, data: existing });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    await BlogPost.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;

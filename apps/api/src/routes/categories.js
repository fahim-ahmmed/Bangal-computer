import { Router } from "express";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import { requireRole } from "../lib/auth.js";

const router = Router();

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ------------------------------------------------------------------ */
/* Public: mega menu + storefront routing                             */
/* ------------------------------------------------------------------ */

/**
 * GET /api/categories
 * Full tree — this is what the mega menu renders. Cheap enough (≈1.5k
 * docs) to return in one shot and let the client cache it (ISR / fetch
 * revalidate on the Next.js side).
 */
router.get("/", async (req, res, next) => {
  try {
    const mains = await Category.find({ level: 0, isActive: true }).sort({ order: 1 }).lean();
    const subs = await Category.find({ level: 1, isActive: true }).sort({ order: 1 }).lean();

    const tree = mains.map((main) => ({
      ...main,
      subcategories: subs.filter((s) => String(s.parentId) === String(main._id)),
    }));

    res.json({ success: true, data: tree });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/categories/resolve/:main
 * GET /api/categories/resolve/:main/:sub
 * GET /api/categories/resolve/:main/:sub/:brand
 * Powers the /[category]/[subcategory]/[brand] storefront routes —
 * one endpoint that resolves however many segments are present and
 * returns breadcrumb + siblings so the page can render without extra
 * round trips.
 */
router.get("/resolve/:main/:sub?/:brand?", async (req, res, next) => {
  try {
    const { main, sub, brand } = req.params;

    const mainDoc = await Category.findOne({ slug: main, level: 0, isActive: true }).lean();
    if (!mainDoc) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const subcategories = await Category.find({ parentId: mainDoc._id, isActive: true })
      .sort({ order: 1 })
      .lean();

    if (!sub) {
      return res.json({
        success: true,
        data: { type: "main", main: mainDoc, subcategories },
      });
    }

    const subDoc = subcategories.find((s) => s.slug === sub);
    if (!subDoc) {
      return res.status(404).json({ success: false, message: "Subcategory not found" });
    }

    if (!brand) {
      return res.json({
        success: true,
        data: { type: "sub", main: mainDoc, sub: subDoc, brands: subDoc.brands },
      });
    }

    const brandDoc = subDoc.brands.find((b) => b.slug === brand);
    if (!brandDoc) {
      return res.status(404).json({ success: false, message: "Brand not found in this subcategory" });
    }

    res.json({
      success: true,
      data: { type: "brand", main: mainDoc, sub: subDoc, brand: brandDoc },
    });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/* Admin: Category tree management (Gravity UI admin panel)           */
/* ------------------------------------------------------------------ */

/**
 * POST /api/categories
 * body: { name, level, parentId? }
 * Creates a main (level 0) or subcategory (level 1) node.
 */
router.post("/", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { name, level, parentId } = req.body;
    const categoryName = typeof name === "string" ? name.trim() : "";
    if (!categoryName || (level !== 0 && level !== 1)) {
      return res.status(400).json({ success: false, message: "name ও level (0 বা 1) আবশ্যক" });
    }
    if (level === 1 && !parentId) {
      return res.status(400).json({ success: false, message: "Subcategory-এর জন্য parentId আবশ্যক" });
    }

    let slug = slugify(categoryName);
    if (level === 1) {
      const parent = await Category.findById(parentId).lean();
      if (!parent || parent.level !== 0) {
        return res.status(404).json({ success: false, message: "Main category পাওয়া যায়নি" });
      }
      slug = slugify(`${parent.name}-${categoryName}`);
    }
    if (!slug) return res.status(400).json({ success: false, message: "নাম থেকে বৈধ slug তৈরি করা যায়নি" });

    const duplicate = await Category.findOne({ slug }).lean();
    if (duplicate) return res.status(409).json({ success: false, message: "এই category name ইতিমধ্যে ব্যবহৃত হয়েছে" });

    const count = await Category.countDocuments({ parentId: level === 0 ? null : parentId });
    const doc = await Category.create({
      name: categoryName,
      slug,
      level,
      parentId: level === 0 ? null : parentId,
      order: count,
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/categories/:id
 * body: { name?, order?, isActive?, icon? }
 */
router.put("/:id", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { name, order, isActive, icon } = req.body;
    const doc = await Category.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Category পাওয়া যায়নি" });

    const update = {};
    if (name !== undefined) {
      const categoryName = typeof name === "string" ? name.trim() : "";
      if (!categoryName) return res.status(400).json({ success: false, message: "Category name আবশ্যক" });

      const parent = doc.level === 1 ? await Category.findById(doc.parentId).lean() : null;
      const slug = slugify(doc.level === 1 ? `${parent?.name || ""}-${categoryName}` : categoryName);
      if (!slug) return res.status(400).json({ success: false, message: "নাম থেকে বৈধ slug তৈরি করা যায়নি" });
      const duplicate = await Category.findOne({ slug, _id: { $ne: doc._id } }).lean();
      if (duplicate) return res.status(409).json({ success: false, message: "এই category name ইতিমধ্যে ব্যবহৃত হয়েছে" });

      update.name = categoryName;
      update.slug = slug;
    }
    if (order !== undefined) update.order = order;
    if (isActive !== undefined) update.isActive = isActive;
    if (icon !== undefined) update.icon = icon;

    Object.assign(doc, update);
    await doc.save();

    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/categories/:id
 * Soft delete (isActive: false) — matches the docx's "সফট ডিলিট" pattern,
 * keeps historical product references intact.
 */
router.delete("/:id", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const doc = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "Category পাওয়া যায়নি" });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/categories/:id/brands
 * body: { name }
 * Adds a brand to a subcategory's embedded brand list (mega menu level 3).
 */
router.post("/:id/brands", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { name } = req.body;
    const brandName = typeof name === "string" ? name.trim() : "";
    if (!brandName) return res.status(400).json({ success: false, message: "Brand name আবশ্যক" });

    const doc = await Category.findById(req.params.id);
    if (!doc || doc.level !== 1) {
      return res.status(404).json({ success: false, message: "Subcategory পাওয়া যায়নি" });
    }

    const slug = slugify(brandName);
    if (!slug) return res.status(400).json({ success: false, message: "নাম থেকে বৈধ brand slug তৈরি করা যায়নি" });
    if (doc.brands.some((b) => b.slug === slug)) {
      return res.status(409).json({ success: false, message: "এই ব্র্যান্ড ইতিমধ্যে যোগ করা আছে" });
    }

    let canonicalBrand = await Brand.findOne({ slug });
    if (canonicalBrand && canonicalBrand.name.toLowerCase() !== brandName.toLowerCase()) {
      return res.status(409).json({ success: false, message: "এই brand slug অন্য নামে ব্যবহৃত হচ্ছে" });
    }
    if (!canonicalBrand) {
      try {
        canonicalBrand = await Brand.create({ name: brandName, slug });
      } catch (err) {
        if (err.code !== 11000) throw err;
        canonicalBrand = await Brand.findOne({ slug });
        if (!canonicalBrand || canonicalBrand.name.toLowerCase() !== brandName.toLowerCase()) {
          return res.status(409).json({ success: false, message: "এই brand slug অন্য নামে ব্যবহৃত হচ্ছে" });
        }
      }
    }
    if (!canonicalBrand.isActive) {
      canonicalBrand.isActive = true;
      await canonicalBrand.save();
    }

    doc.brands.push({ name: canonicalBrand.name, slug });
    await doc.save();

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/categories/:id/brands/:brandSlug
 */
router.delete("/:id/brands/:brandSlug", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const doc = await Category.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Subcategory পাওয়া যায়নি" });

    doc.brands = doc.brands.filter((b) => b.slug !== req.params.brandSlug);
    await doc.save();

    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/categories/reorder/bulk
 * body: { items: [{ id, order }] }
 * Drag-and-drop reorder support for the admin tree view.
 */
router.put("/reorder/bulk", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "items[] আবশ্যক" });
    }
    await Promise.all(items.map((it) => Category.findByIdAndUpdate(it.id, { order: it.order })));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;

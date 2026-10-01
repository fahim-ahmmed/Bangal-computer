import { Router } from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import { requireRole } from "../lib/auth.js";
import { uploadImages, uploadImportFile } from "../middleware/upload.js";
import {
  cloudinaryConfigured,
  createProductImageSignature,
  isProductImageUrlForProduct,
  uploadBuffer,
  destroyByUrl,
} from "../lib/cloudinary.js";
import XLSX from "xlsx";

const router = Router();

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Mongoose Map keys cannot contain "." or start with "$" — clean spec names.
function sanitizeSpecs(specs) {
  if (!specs || typeof specs !== "object") return {};
  const out = {};
  for (const [k, v] of Object.entries(specs)) {
    const key = String(k).replace(/\./g, "").replace(/^\$+/, "").trim();
    if (key && v !== undefined && v !== null && String(v).trim() !== "") out[key] = String(v).trim();
  }
  return out;
}

function specsToObject(map) {
  return map instanceof Map ? Object.fromEntries(map) : map || {};
}

/* ------------------------------------------------------------------ */
/* Public: storefront listing/detail (full filter/sort lands Part 4)  */
/* ------------------------------------------------------------------ */

/**
 * GET /api/products
 * Query: category, subcategory, brand (slugs), page, limit, sort, q
 * Basic version here — Part 4 builds the full filter UI on top of this.
 */
/**
 * GET /api/products
 * Query: category, subcategory, brand (comma-separated slugs), minPrice, maxPrice,
 *        sort (price_asc|price_desc|newest|featured), page, limit, q
 * Returns items + pagination + facets (price range, brand counts) so the
 * filter sidebar can render without a second round trip.
 */
router.get("/", async (req, res, next) => {
  try {
    const {
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 24,
      q,
      featured,
    } = req.query;

    const filter = { ...Product.PUBLIC_FILTER };
    if (featured === "true") filter.isFeatured = true;
    let subcategoryDoc = null;

    if (category) {
      const cat = await Category.findOne({ slug: category, level: 0 }).lean();
      if (cat) filter.categoryId = cat._id;
    }
    if (subcategory) {
      subcategoryDoc = await Category.findOne({ slug: subcategory, level: 1 }).lean();
      if (subcategoryDoc) filter.subcategoryId = subcategoryDoc._id;
    }
    if (brand) {
      const slugs = brand.split(",").map((s) => s.trim()).filter(Boolean);
      const brandDocs = await Brand.find({ slug: { $in: slugs } }).lean();
      if (brandDocs.length) filter.brandId = { $in: brandDocs.map((b) => b._id) };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (q) filter.$text = { $search: q };

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
      featured: { isFeatured: -1, createdAt: -1 },
    };
    const sortSpec = sortMap[sort] || sortMap.newest;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));

    // Facets computed over the filter MINUS price/brand, so the sidebar
    // shows "what else is available", not just what's already selected.
    const facetFilter = { ...filter };
    delete facetFilter.price;
    delete facetFilter.brandId;

    const [items, total, priceStats, brandCounts] = await Promise.all([
      Product.find(filter)
        .sort(sortSpec)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("brandId", "name slug")
        .lean(),
      Product.countDocuments(filter),
      Product.aggregate([
        { $match: facetFilter },
        { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } },
      ]),
      Product.aggregate([
        { $match: facetFilter },
        { $group: { _id: "$brandId", count: { $sum: 1 } } },
        { $lookup: { from: "brands", localField: "_id", foreignField: "_id", as: "brand" } },
        { $unwind: "$brand" },
        { $project: { _id: 0, name: "$brand.name", slug: "$brand.slug", count: 1 } },
        { $sort: { name: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: items.map((p) => ({ ...p, specs: specsToObject(p.specs) })),
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      facets: {
        price: priceStats[0] ? { min: priceStats[0].min, max: priceStats[0].max } : { min: 0, max: 0 },
        brands: brandCounts,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/products/search/suggest?q=...
 * Lightweight autocomplete — prefix/substring match on title, top 8,
 * minimal fields only (fast enough to call on every keystroke, debounced
 * on the frontend). Typo-tolerance beyond MongoDB's own text stemming
 * would need Atlas Search/Meilisearch — noted as a future upgrade.
 * Declared before "/:slug" so "search" is never swallowed as a slug.
 */
router.get("/search/suggest", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ success: true, data: [] });

    const regex = new RegExp(
      q
        .split(/\s+/)
        .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join(".*"),
      "i"
    );

    const items = await Product.find({ ...Product.PUBLIC_FILTER, title: regex })
      .select("title slug price discountPrice images")
      .limit(8)
      .lean();

    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:slug — public product detail (full page UI lands Part 4)
router.get("/:slug", async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, ...Product.PUBLIC_FILTER })
      .populate("categoryId", "name slug")
      .populate("subcategoryId", "name slug")
      .populate("brandId", "name slug logo")
      .lean();

    if (!product) return res.status(404).json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" });

    res.json({ success: true, data: { ...product, specs: specsToObject(product.specs) } });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:slug/related — same subcategory, excluding itself
router.get("/:slug/related", async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).lean();
    if (!product) return res.status(404).json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" });

    const related = await Product.find({
      ...Product.PUBLIC_FILTER,
      subcategoryId: product.subcategoryId,
      _id: { $ne: product._id },
    })
      .limit(8)
      .populate("brandId", "name slug")
      .lean();

    res.json({ success: true, data: related.map((p) => ({ ...p, specs: specsToObject(p.specs) })) });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/* Admin: product management                                          */
/* ------------------------------------------------------------------ */

// GET /api/products/admin/all — admin listing, includes drafts + inactive
router.get("/admin/all", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { page = 1, limit = 24, status, q, deleted } = req.query;
    const filter = { isActive: deleted === "true" ? false : true };
    if (status) filter.status = status;
    if (q) {
      const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: rx }, { sku: rx }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort("-updatedAt")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("brandId", "name")
        .populate("categoryId", "name")
        .populate("subcategoryId", "name")
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items.map((p) => ({ ...p, specs: specsToObject(p.specs) })),
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/products
 * body: { title, categoryId, subcategoryId, brandId, price, discountPrice?,
 *         stock, sku, specs?: {key:value}, description?, variants?: [],
 *         isFeatured?, status? }
 * Images are uploaded separately via POST /:id/images (need a product _id first).
 */
router.post("/", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.title || !body.categoryId || !body.subcategoryId || !body.brandId || body.price === undefined) {
      return res.status(400).json({
        success: false,
        message: "title, categoryId, subcategoryId, brandId, price আবশ্যক",
      });
    }

    // SKU is optional in the admin form — generate one when left blank
    const sku = String(body.sku || "").trim() || `BC-${Date.now().toString(36).toUpperCase()}`;

    let slug = slugify(body.title) || `product-${Date.now()}`;
    const clash = await Product.findOne({ slug });
    if (clash) slug = `${slug}-${sku.toLowerCase()}`;

    const product = await Product.create({
      ...body,
      sku,
      slug,
      images: [],
      specs: sanitizeSpecs(body.specs),
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "এই SKU বা slug ইতিমধ্যে ব্যবহৃত হয়েছে" });
    }
    next(err);
  }
});

// PUT /api/products/:id — general field update (inline edit)
router.put("/:id", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const update = { ...req.body };
    delete update.images; // images managed via dedicated endpoints below
    delete update.slug; // keep product URLs stable after publishing
    delete update.isActive; // visibility is changed only through delete/restore
    if (update.specs !== undefined) update.specs = sanitizeSpecs(update.specs);

    if (update.status === "draft") {
      const existing = await Product.findById(req.params.id).select("status").lean();
      if (!existing) return res.status(404).json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" });
      if (existing.status === "published") {
        return res.status(409).json({ success: false, message: "প্রকাশিত প্রোডাক্ট সাইট থেকে সরাতে প্রোডাক্টটি মুছে ফেলুন" });
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" });

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/products/:id/status — Draft/Publish toggle
router.patch("/:id/status", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({ success: false, message: "status হবে draft বা published" });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" });
    if (product.status === "published" && status === "draft") {
      return res.status(409).json({ success: false, message: "প্রকাশিত প্রোডাক্ট সাইট থেকে সরাতে প্রোডাক্টটি মুছে ফেলুন" });
    }
    product.status = status;
    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id — soft delete (isActive: false)
router.delete("/:id", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/* Admin: image upload / reorder / delete                             */
/* ------------------------------------------------------------------ */

// POST /api/products/:id/images/signature — sign a direct Cloudinary upload
router.post("/:id/images/signature", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" });

    if (!cloudinaryConfigured) {
      if (process.env.NODE_ENV === "production") {
        return res.status(503).json({ success: false, message: "প্রোডাক্ট ইমেজ আপলোডের জন্য Cloudinary সেটআপ করুন" });
      }
      return res.json({ success: true, data: { configured: false } });
    }

    res.json({ success: true, data: createProductImageSignature(product.id) });
  } catch (err) {
    next(err);
  }
});

// POST /api/products/:id/images/attach — attach signed Cloudinary image URLs
router.post("/:id/images/attach", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { images } = req.body;
    if (!Array.isArray(images) || images.length === 0 || images.length > 10) {
      return res.status(400).json({ success: false, message: "১ থেকে ১০টি ইমেজ URL আবশ্যক" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" });

    if (!images.every((url) => isProductImageUrlForProduct(url, product.id))) {
      return res.status(400).json({ success: false, message: "ইমেজগুলো এই প্রোডাক্টের Cloudinary folder-এর হতে হবে" });
    }

    product.images.push(...images);
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// POST /api/products/:id/images — multipart form field name: "images" (up to 10)
router.post(
  "/:id/images",
  requireRole("admin", "staff"),
  uploadImages.array("images", 10),
  async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" });

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: "কোনো ইমেজ পাওয়া যায়নি" });
      }

      const uploaded = await Promise.all(req.files.map((f) => uploadBuffer(f.buffer, { mimetype: f.mimetype })));
      product.images.push(...uploaded.map((u) => u.secure_url));
      await product.save();

      res.status(201).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/products/:id/images/reorder — body: { images: [url1, url2, ...] } in new order
router.put("/:id/images/reorder", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { images } = req.body;
    if (!Array.isArray(images)) {
      return res.status(400).json({ success: false, message: "images[] আবশ্যক" });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" });

    // Only accept a reordering of URLs that already belong to this product —
    // this endpoint reorders, it doesn't add/remove.
    const valid = images.every((url) => product.images.includes(url));
    if (!valid || images.length !== product.images.length) {
      return res.status(400).json({ success: false, message: "images অবশ্যই বিদ্যমান ইমেজের একটি reorder হতে হবে" });
    }

    product.images = images;
    await product.save();

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id/images — body: { url } removes one image (from array + Cloudinary)
router.delete("/:id/images", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { url } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" });

    product.images = product.images.filter((img) => img !== url);
    await product.save();
    destroyByUrl(url).catch(() => {}); // best-effort cleanup, doesn't block the response

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/* Admin: bulk import (CSV/Excel)                                     */
/* ------------------------------------------------------------------ */

/**
 * POST /api/products/bulk-import
 * multipart form field name: "file" (.csv/.xlsx/.xls)
 *
 * Expected columns (header row, case-insensitive):
 *   title, category, subcategory, brand, price, discountPrice, stock,
 *   sku, description, specs (JSON string, e.g. {"RAM":"16GB"}),
 *    isFeatured (true/false), status (draft/published; default published)
 *
 * category/subcategory/brand are matched by NAME against the already-
 * seeded Category/Brand collections — rows that don't match an existing
 * name are skipped and reported back, never silently dropped.
 */
router.post(
  "/bulk-import",
  requireRole("admin", "staff"),
  uploadImportFile.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: "file আবশ্যক" });

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const results = { created: 0, skipped: [], errors: [] };

      for (const [i, row] of rows.entries()) {
        const rowNum = i + 2; // account for header row, 1-indexed
        try {
          const title = String(row.title || row.Title || "").trim();
          const categoryName = String(row.category || row.Category || "").trim();
          const subcategoryName = String(row.subcategory || row.Subcategory || "").trim();
          const brandName = String(row.brand || row.Brand || "").trim();
          const sku = String(row.sku || row.SKU || "").trim();
          const price = Number(row.price || row.Price || 0);

          if (!title || !categoryName || !subcategoryName || !brandName || !sku || !price) {
            results.skipped.push({ row: rowNum, reason: "আবশ্যক ফিল্ড খালি (title/category/subcategory/brand/sku/price)" });
            continue;
          }

          const category = await Category.findOne({ name: categoryName, level: 0 }).lean();
          const subcategory = await Category.findOne({ name: subcategoryName, level: 1 }).lean();
          const brand = await Brand.findOne({ name: brandName }).lean();

          if (!category || !subcategory || !brand) {
            results.skipped.push({
              row: rowNum,
              reason: `category/subcategory/brand মেলেনি: "${categoryName}" / "${subcategoryName}" / "${brandName}"`,
            });
            continue;
          }

          let specs = {};
          if (row.specs) {
            try {
              specs = typeof row.specs === "string" ? JSON.parse(row.specs) : row.specs;
            } catch {
              results.skipped.push({ row: rowNum, reason: "specs কলাম বৈধ JSON না" });
              continue;
            }
          }

          let slug = slugify(title);
          if (await Product.findOne({ slug })) slug = `${slug}-${sku.toLowerCase()}`;

          await Product.create({
            title,
            slug,
            categoryId: category._id,
            subcategoryId: subcategory._id,
            brandId: brand._id,
            price,
            discountPrice: row.discountPrice ? Number(row.discountPrice) : null,
            stock: Number(row.stock || 0),
            sku,
            description: String(row.description || ""),
            specs,
            isFeatured: String(row.isFeatured).toLowerCase() === "true",
            status: ["draft", "published"].includes(String(row.status).toLowerCase())
              ? String(row.status).toLowerCase()
              : "published",
          });

          results.created += 1;
        } catch (err) {
          results.errors.push({ row: rowNum, message: err.message });
        }
      }

      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/products/admin/one/:id — raw product (drafts included) for the edit modal
router.get("/admin/one/:id", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" });
    res.json({ success: true, data: { ...product, specs: specsToObject(product.specs) } });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/admin/low-stock?threshold=5
router.get("/admin/low-stock", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const threshold = Math.max(0, parseInt(req.query.threshold, 10) || 5);
    const items = await Product.find({ isActive: true, stock: { $lte: threshold } })
      .sort({ stock: 1 })
      .limit(200)
      .select("title sku stock images status")
      .lean();
    res.json({ success: true, data: items, threshold });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/products/:id/stock — quick inventory update
router.patch("/:id/stock", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const stock = Number(req.body.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ success: false, message: "stock অবশ্যই ০ বা তার বেশি পূর্ণ সংখ্যা হতে হবে" });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/products/:id/restore — bring back a soft-deleted product (deleting never erases data)
router.patch("/:id/restore", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "প্রোডাক্ট পাওয়া যায়নি" });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

export default router;

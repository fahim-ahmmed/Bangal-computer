import { Router } from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Settings from "../models/Settings.js";
import { findSpec, firstNumber, specIncludes } from "../lib/specs.js";

const router = Router();

function specsToObject(map) {
  return map instanceof Map ? Object.fromEntries(map) : map || {};
}

async function laptopCategoryId() {
  const setting = await Settings.findOne({ key: "laptopCategorySlug" }).lean();
  const slug = setting?.value;
  const cat = slug
    ? await Category.findOne({ slug, level: 0 }).lean()
    : await Category.findOne({ name: /laptop/i, level: 0 }).lean();
  return cat?._id || null;
}

const USE_CASES = {
  gaming: { label: "গেমিং", weight: (p) => (hasDedicatedGpu(p) ? 3 : 0) + ramScore(p) },
  office: { label: "অফিস/সাধারণ ব্যবহার", weight: (p) => 2 - (p.price > 60000 ? 1 : 0) },
  student: { label: "স্টুডেন্ট", weight: (p) => 2 - (p.price > 55000 ? 1 : 0) },
  editing: { label: "ভিডিও/ফটো এডিটিং", weight: (p) => ramScore(p) + (hasDedicatedGpu(p) ? 2 : 0) + storageScore(p) },
  business: { label: "বিজনেস/প্রফেশনাল", weight: (p) => (specIncludes(findSpec(p.specs, ["weight"]), "kg") ? 1 : 0) + ramScore(p) },
};

function hasDedicatedGpu(p) {
  const gpu = findSpec(p.specs, ["graphics", "gpu"]);
  if (!gpu) return false;
  return !/intel (uhd|iris)|integrated|amd radeon graphics$/i.test(gpu) || /rtx|gtx|radeon rx|mx\d{3}/i.test(gpu);
}
function ramScore(p) {
  const ram = firstNumber(findSpec(p.specs, ["ram", "memory"]));
  return ram ? Math.min(ram / 8, 4) : 0;
}
function storageScore(p) {
  const storage = firstNumber(findSpec(p.specs, ["storage", "ssd"]));
  return storage ? Math.min(storage / 256, 3) : 0;
}

// GET /api/laptop-finder/use-cases — for the wizard's option list
router.get("/use-cases", (req, res) => {
  res.json({ success: true, data: Object.entries(USE_CASES).map(([value, c]) => ({ value, label: c.label })) });
});

/**
 * GET /api/laptop-finder?budgetMin=&budgetMax=&useCase=
 * Filters the Laptop category by budget, scores remaining laptops by a
 * simple spec heuristic for the chosen use case, returns the top matches.
 */
router.get("/", async (req, res, next) => {
  try {
    const { budgetMin = 0, budgetMax = 10000000, useCase } = req.query;
    const categoryId = await laptopCategoryId();
    if (!categoryId) {
      return res.status(404).json({
        success: false,
        message: "Laptop ক্যাটাগরি কনফিগার করা হয়নি — অ্যাডমিন Laptop Finder সেটিংসে এটা বাছুন",
      });
    }

    const filter = {
      ...Product.PUBLIC_FILTER,
      categoryId,
      price: { $gte: Number(budgetMin), $lte: Number(budgetMax) },
    };

    const products = await Product.find(filter).populate("brandId", "name slug").lean();
    const scorer = USE_CASES[useCase]?.weight || (() => 0);

    const scored = products
      .map((p) => ({ ...p, specs: specsToObject(p.specs) }))
      .map((p) => ({ product: p, score: scorer(p) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((x) => x.product);

    res.json({ success: true, data: scored });
  } catch (err) {
    next(err);
  }
});

export default router;

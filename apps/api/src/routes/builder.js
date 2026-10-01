import { Router } from "express";
import mongoose from "mongoose";
import BuilderSlot from "../models/BuilderSlot.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { requireRole } from "../lib/auth.js";
import { findSpec, firstNumber, specIncludes } from "../lib/specs.js";

const router = Router();

const DEFAULT_SLOTS = [
  { key: "cpu", label: "প্রসেসর (CPU)", group: "মূল কম্পোনেন্ট", order: 0, categorySlugs: ["component-processor"] },
  { key: "cooler", label: "CPU কুলার", group: "মূল কম্পোনেন্ট", order: 1, required: false, categorySlugs: ["component-cpu-cooler", "component-water-liquid-cooling"] },
  { key: "motherboard", label: "মাদারবোর্ড", group: "মূল কম্পোনেন্ট", order: 2, categorySlugs: ["component-motherboard"] },
  { key: "ram", label: "মেমোরি (RAM)", group: "মূল কম্পোনেন্ট", order: 3, categorySlugs: ["component-ram-desktop"] },
  { key: "storage", label: "স্টোরেজ (SSD / HDD)", group: "মূল কম্পোনেন্ট", order: 4, categorySlugs: ["component-ssd", "component-hard-disk-drive"] },
  { key: "gpu", label: "গ্রাফিক্স কার্ড (GPU)", group: "মূল কম্পোনেন্ট", order: 5, required: false, categorySlugs: ["component-graphics-card"] },
  { key: "psu", label: "পাওয়ার সাপ্লাই (PSU)", group: "মূল কম্পোনেন্ট", order: 6, categorySlugs: ["component-power-supply"] },
  { key: "case", label: "কেসিং", group: "মূল কম্পোনেন্ট", order: 7, categorySlugs: ["component-casing"] },
  { key: "monitor", label: "মনিটর", group: "অন্যান্য ও পেরিফেরাল", order: 8, required: false, categorySlugs: ["monitor-monitor-by-brand", "monitor-gaming-monitor", "monitor-curved-monitor", "monitor-4k-monitor", "monitor-portable-monitor"] },
  { key: "case-cooler", label: "কেসিং কুলার", group: "অন্যান্য ও পেরিফেরাল", order: 9, required: false, categorySlugs: ["component-casing-cooler"] },
  { key: "keyboard", label: "কিবোর্ড", group: "অন্যান্য ও পেরিফেরাল", order: 10, required: false, categorySlugs: ["accessories-keyboard"] },
  { key: "mouse", label: "মাউস", group: "অন্যান্য ও পেরিফেরাল", order: 11, required: false, categorySlugs: ["accessories-mouse"] },
  { key: "speaker", label: "স্পিকার", group: "অন্যান্য ও পেরিফেরাল", order: 12, required: false, categorySlugs: ["accessories-speaker-and-home-theater", "accessories-bluetooth-speakers"] },
  { key: "headphone", label: "হেডফোন", group: "অন্যান্য ও পেরিফেরাল", order: 13, required: false, categorySlugs: ["accessories-headphone", "accessories-bluetooth-headphone"] },
  { key: "network-card", label: "Wi-Fi / LAN কার্ড", group: "অন্যান্য ও পেরিফেরাল", order: 14, required: false, categorySlugs: ["networking-wifi-adapter", "networking-lan-card"] },
  { key: "ups", label: "ইউপিএস (UPS)", group: "অন্যান্য ও পেরিফেরাল", order: 15, required: false, categorySlugs: ["power-ups", "power-online-ups"] },
];

function specsToObject(map) {
  return map instanceof Map ? Object.fromEntries(map) : map || {};
}

// GET /api/builder/slots — public, includes the mapped subcategory (if configured)
router.get("/slots", async (req, res, next) => {
  try {
    await Promise.all(
      DEFAULT_SLOTS.map((slot) =>
        BuilderSlot.updateOne(
          { key: slot.key },
          {
            $set: {
              label: slot.label,
              order: slot.order,
              required: slot.required ?? true,
              group: slot.group,
            },
            $setOnInsert: { key: slot.key },
          },
          { upsert: true }
        )
      )
    );

    const slugs = [...new Set(DEFAULT_SLOTS.flatMap((slot) => slot.categorySlugs))];
    const categories = await Category.find({ slug: { $in: slugs }, level: 1 }).select("_id slug name").lean();
    const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
    await Promise.all(
      DEFAULT_SLOTS.map(async (slot) => {
        const categoryIds = slot.categorySlugs.map((slug) => categoryBySlug.get(slug)?._id).filter(Boolean);
        if (categoryIds.length === 0) return;
        const currentSlot = await BuilderSlot.findOne({ key: slot.key }).select("subcategoryId subcategoryIds subcategoryConfigured").lean();
        if (currentSlot?.subcategoryConfigured || currentSlot?.subcategoryId || currentSlot?.subcategoryIds?.length) return;
        await BuilderSlot.updateOne(
          { key: slot.key, subcategoryId: null, subcategoryConfigured: { $ne: true } },
          { $set: { subcategoryId: categoryIds[0], subcategoryIds: categoryIds, subcategoryConfigured: true } }
        );
      })
    );

    const slots = await BuilderSlot.find()
      .sort("order")
      .populate("subcategoryId", "name slug")
      .populate("subcategoryIds", "name slug")
      .lean();
    res.json({ success: true, data: slots });
  } catch (err) {
    next(err);
  }
});

// PUT /api/builder/slots/:key — admin: map a slot to a real subcategory
router.put("/slots/:key", requireRole("admin", "staff"), async (req, res, next) => {
  try {
    const { subcategoryId } = req.body;
    const slot = await BuilderSlot.findOneAndUpdate(
      { key: req.params.key },
      {
        subcategoryId: subcategoryId || null,
        subcategoryIds: subcategoryId ? [subcategoryId] : [],
        subcategoryConfigured: true,
      },
      { new: true, upsert: false }
    ).populate("subcategoryId", "name slug").populate("subcategoryIds", "name slug");
    if (!slot) return res.status(404).json({ success: false, message: "স্লট পাওয়া যায়নি" });
    res.json({ success: true, data: slot });
  } catch (err) {
    next(err);
  }
});

// GET /api/builder/slots/:key/products — published products in that slot's mapped subcategory
router.get("/slots/:key/products", async (req, res, next) => {
  try {
    const slot = await BuilderSlot.findOne({ key: req.params.key }).lean();
    if (!slot) return res.status(404).json({ success: false, message: "স্লট পাওয়া যায়নি" });
    const subcategoryIds = slot.subcategoryIds?.length ? slot.subcategoryIds : [slot.subcategoryId].filter(Boolean);
    if (!subcategoryIds.length) return res.json({ success: true, data: [] });

    const products = await Product.find({
      ...Product.PUBLIC_FILTER,
      subcategoryId: { $in: subcategoryIds },
    })
      .select("title price discountPrice images specs stock brandId")
      .populate("brandId", "name")
      .sort({ stock: -1, createdAt: -1 })
      .limit(120)
      .lean();
    res.json({ success: true, data: products.map((p) => ({ ...p, specs: specsToObject(p.specs) })) });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/builder/check
 * body: { selections: { cpu: productId, motherboard: productId, ram: productId, gpu?, psu, case, storage?, cooler? } }
 * Compatibility rules (best-effort — reads whatever spec keys look right, see lib/specs.js):
 *   1. CPU socket === Motherboard socket
 *   2. RAM type (DDR4/DDR5) === Motherboard supported RAM type
 *   3. PSU wattage ≥ sum of component power draw (CPU + GPU, +100W headroom for everything else)
 *   4. Case supports Motherboard form factor (ATX case fits Micro-ATX/Mini-ITX boards too)
 */
router.post("/check", async (req, res, next) => {
  try {
    const { selections = {} } = req.body;
    if (!selections || typeof selections !== "object" || Array.isArray(selections)) {
      return res.status(400).json({ success: false, message: "কম্পোনেন্ট নির্বাচন সঠিক নয়" });
    }
    const ids = Object.values(selections).filter(Boolean);
    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "অন্তত একটি কম্পোনেন্ট বাছুন" });
    }
    const allowedKeys = new Set(DEFAULT_SLOTS.map((slot) => slot.key));
    if (Object.keys(selections).some((key) => !allowedKeys.has(key))) {
      return res.status(400).json({ success: false, message: "অজানা কম্পোনেন্ট নির্বাচন করা হয়েছে" });
    }
    if (ids.some((id) => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({ success: false, message: "এক বা একাধিক পণ্যের আইডি সঠিক নয়" });
    }

    const products = await Product.find({
      ...Product.PUBLIC_FILTER,
      stock: { $gt: 0 },
      _id: { $in: ids },
    }).lean();
    if (new Set(products.map((product) => String(product._id))).size !== new Set(ids.map(String)).size) {
      return res.status(400).json({ success: false, message: "নির্বাচিত কোনো পণ্য আর প্রকাশিত বা স্টকে নেই" });
    }
    const selectedSlots = await BuilderSlot.find({ key: { $in: Object.keys(selections) } })
      .select("key subcategoryId subcategoryIds")
      .lean();
    const slotByKey = new Map(selectedSlots.map((slot) => [slot.key, slot]));
    for (const [key, id] of Object.entries(selections)) {
      if (!id) continue;
      const slot = slotByKey.get(key);
      const allowedIds = slot?.subcategoryIds?.length
        ? slot.subcategoryIds.map(String)
        : [slot?.subcategoryId].filter(Boolean).map(String);
      const product = products.find((item) => String(item._id) === String(id));
      if (!slot || !allowedIds.includes(String(product.subcategoryId))) {
        return res.status(400).json({ success: false, message: "একটি পণ্য ভুল কম্পোনেন্ট স্লটে নির্বাচন করা হয়েছে" });
      }
    }
    const byId = Object.fromEntries(products.map((p) => [String(p._id), { ...p, specs: specsToObject(p.specs) }]));
    const get = (key) => (selections[key] ? byId[selections[key]] : null);

    const cpu = get("cpu");
    const mobo = get("motherboard");
    const ram = get("ram");
    const gpu = get("gpu");
    const psu = get("psu");
    const pcCase = get("case");

    const issues = [];
    const cpuPower = firstNumber(findSpec(cpu?.specs, ["tdp", "power consumption"])) || 65;
    const gpuPower = gpu ? firstNumber(findSpec(gpu.specs, ["tdp", "power consumption"])) || 150 : 0;
    const estimatedWattage = cpuPower + gpuPower + 100;

    if (cpu && mobo) {
      const cpuSocket = findSpec(cpu.specs, ["socket"]);
      const moboSocket = findSpec(mobo.specs, ["socket"]);
      if (cpuSocket && moboSocket && cpuSocket.trim().toLowerCase() !== moboSocket.trim().toLowerCase()) {
        issues.push(`প্রসেসরের সকেট (${cpuSocket}) মাদারবোর্ডের সকেটের (${moboSocket}) সাথে মিলছে না`);
      }
    }

    if (ram && mobo) {
      const ramType = findSpec(ram.specs, ["ddr", "memory type", "ram type"]) || (specIncludes(ram.title, "ddr5") ? "DDR5" : specIncludes(ram.title, "ddr4") ? "DDR4" : null);
      const moboRamType = findSpec(mobo.specs, ["memory type", "ram type", "ddr"]);
      if (ramType && moboRamType && !specIncludes(moboRamType, ramType.match(/DDR\d/i)?.[0] || ramType)) {
        issues.push(`RAM-এর টাইপ (${ramType}) মাদারবোর্ড সাপোর্ট করে এমন টাইপের (${moboRamType}) সাথে মিলছে না`);
      }
    }

    if (mobo && pcCase) {
      const moboForm = findSpec(mobo.specs, ["form factor"]);
      const caseSupports = findSpec(pcCase.specs, ["form factor", "supported motherboard"]);
      if (moboForm && caseSupports && !specIncludes(caseSupports, moboForm)) {
        issues.push(`ক্যাসিং "${caseSupports}" সাপোর্ট করে, কিন্তু মাদারবোর্ড "${moboForm}" ফর্ম ফ্যাক্টরের`);
      }
    }

    if (psu) {
      const psuWattage = firstNumber(findSpec(psu.specs, ["wattage", "watt"])) || firstNumber(psu.title);
      if (psuWattage && psuWattage < estimatedWattage) {
        issues.push(`PSU-এর ওয়াটেজ (${psuWattage}W) আনুমানিক প্রয়োজনের (~${estimatedWattage}W) চেয়ে কম হতে পারে`);
      }
    }

    const selectedProducts = Object.entries(selections)
      .filter(([, id]) => id)
      .map(([slot, id]) => ({ slot, product: byId[id] }))
      .filter((x) => x.product);

    const totalPrice = selectedProducts.reduce((sum, x) => sum + (x.product.discountPrice ?? x.product.price), 0);

    res.json({
      success: true,
      data: {
        compatible: issues.length === 0,
        issues,
        totalPrice,
        estimatedWattage,
        items: selectedProducts.map((x) => ({
          slot: x.slot,
          productId: x.product._id,
          title: x.product.title,
          price: x.product.discountPrice || x.product.price,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;

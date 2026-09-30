import { Router } from "express";
import BuilderSlot from "../models/BuilderSlot.js";
import Product from "../models/Product.js";
import { requireRole } from "../lib/auth.js";
import { findSpec, firstNumber, specIncludes } from "../lib/specs.js";

const router = Router();

const DEFAULT_SLOTS = [
  { key: "cpu", label: "প্রসেসর (CPU)", order: 0 },
  { key: "motherboard", label: "মাদারবোর্ড", order: 1 },
  { key: "ram", label: "র‍্যাম (RAM)", order: 2 },
  { key: "gpu", label: "গ্রাফিক্স কার্ড (ঐচ্ছিক)", order: 3, required: false },
  { key: "storage", label: "স্টোরেজ", order: 4 },
  { key: "psu", label: "পাওয়ার সাপ্লাই (PSU)", order: 5 },
  { key: "case", label: "ক্যাসিং", order: 6 },
  { key: "cooler", label: "সিপিইউ কুলার (ঐচ্ছিক)", order: 7, required: false },
];

function specsToObject(map) {
  return map instanceof Map ? Object.fromEntries(map) : map || {};
}

// GET /api/builder/slots — public, includes the mapped subcategory (if configured)
router.get("/slots", async (req, res, next) => {
  try {
    let slots = await BuilderSlot.find().sort("order").populate("subcategoryId", "name slug").lean();
    if (slots.length === 0) {
      // First-run convenience: create the fixed slot rows (unmapped) so the
      // admin page has something to configure instead of an empty screen.
      slots = await BuilderSlot.insertMany(DEFAULT_SLOTS);
    }
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
      { subcategoryId: subcategoryId || null },
      { new: true, upsert: false }
    ).populate("subcategoryId", "name slug");
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
    if (!slot?.subcategoryId) return res.json({ success: true, data: [] });

    const products = await Product.find({ ...Product.PUBLIC_FILTER, subcategoryId: slot.subcategoryId })
      .select("title price discountPrice images specs stock")
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
    const ids = Object.values(selections).filter(Boolean);
    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "অন্তত একটি কম্পোনেন্ট বাছুন" });
    }

    const products = await Product.find({ _id: { $in: ids } }).lean();
    const byId = Object.fromEntries(products.map((p) => [String(p._id), { ...p, specs: specsToObject(p.specs) }]));
    const get = (key) => (selections[key] ? byId[selections[key]] : null);

    const cpu = get("cpu");
    const mobo = get("motherboard");
    const ram = get("ram");
    const gpu = get("gpu");
    const psu = get("psu");
    const pcCase = get("case");

    const issues = [];

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
      const cpuPower = firstNumber(findSpec(cpu?.specs, ["tdp", "power consumption"])) || 65;
      const gpuPower = gpu ? firstNumber(findSpec(gpu.specs, ["tdp", "power consumption"])) || 150 : 0;
      const estimatedDraw = cpuPower + gpuPower + 100; // +100W headroom for storage/fans/motherboard
      const psuWattage = firstNumber(findSpec(psu.specs, ["wattage", "watt"])) || firstNumber(psu.title);
      if (psuWattage && psuWattage < estimatedDraw) {
        issues.push(`PSU-এর ওয়াটেজ (${psuWattage}W) আনুমানিক প্রয়োজনের (~${estimatedDraw}W) চেয়ে কম হতে পারে`);
      }
    }

    const selectedProducts = Object.entries(selections)
      .filter(([, id]) => id)
      .map(([slot, id]) => ({ slot, product: byId[id] }))
      .filter((x) => x.product);

    const totalPrice = selectedProducts.reduce((sum, x) => sum + (x.product.discountPrice || x.product.price), 0);

    res.json({
      success: true,
      data: {
        compatible: issues.length === 0,
        issues,
        totalPrice,
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

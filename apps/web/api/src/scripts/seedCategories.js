import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "../config/db.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function run() {
  await connectDB();

  const raw = fs.readFileSync(path.join(__dirname, "../data/category_seed_data.json"), "utf-8");
  /** @type {{ main: string, sub: string, brand: string|null }[]} */
  const rows = JSON.parse(raw);

  console.log(`[seed] Loaded ${rows.length} rows from excel export`);

  // ---- 1. Build unique main categories (in first-seen order) ----
  const mainOrder = [];
  const mainSeen = new Set();
  for (const r of rows) {
    if (!mainSeen.has(r.main)) {
      mainSeen.add(r.main);
      mainOrder.push(r.main);
    }
  }

  // ---- 2. Build unique (main, sub) pairs with their brand lists ----
  // Map key: "main::sub" -> Set of brand names
  const subMap = new Map();
  const subOrderByMain = new Map(); // main -> [sub names in first-seen order]

  for (const r of rows) {
    if (!r.sub) continue;
    const key = `${r.main}::${r.sub}`;
    if (!subMap.has(key)) subMap.set(key, new Set());
    if (r.brand) subMap.get(key).add(r.brand);

    if (!subOrderByMain.has(r.main)) subOrderByMain.set(r.main, []);
    const subs = subOrderByMain.get(r.main);
    if (!subs.includes(r.sub)) subs.push(r.sub);
  }

  // ---- 3. Collect all unique brand names across the whole sheet ----
  const allBrands = new Set();
  for (const r of rows) {
    if (r.brand) allBrands.add(r.brand);
  }

  console.log(`[seed] ${mainOrder.length} main categories, ${subMap.size} subcategories, ${allBrands.size} unique brands`);

  // ---- 4. Upsert brands without removing admin-managed records ----
  const brandDocs = [...allBrands].map((name) => ({ name, slug: slugify(name) }));
  if (brandDocs.length) {
    await Brand.bulkWrite(
      brandDocs.map((brand) => ({
        updateOne: {
          filter: { slug: brand.slug },
          update: { $setOnInsert: brand },
          upsert: true,
        },
      })),
      { ordered: true }
    );
  }

  // ---- 5. Upsert main categories, preserving records outside the seed ----
  const mainDocsInput = mainOrder.map((name, i) => ({
    name,
    slug: slugify(name),
    parentId: null,
    level: 0,
    order: i,
  }));
  if (mainDocsInput.length) {
    await Category.bulkWrite(
      mainDocsInput.map((category) => ({
        updateOne: {
          filter: { slug: category.slug, level: 0 },
          update: { $setOnInsert: category },
          upsert: true,
        },
      })),
      { ordered: true }
    );
  }
  const mainDocs = await Category.find({ level: 0, slug: { $in: mainDocsInput.map((d) => d.slug) } }).lean();
  const mainIdBySlug = new Map(mainDocs.map((d) => [d.slug, d._id]));

  // ---- 6. Upsert subcategories with embedded brand refs ----
  const subDocsInput = [];
  for (const [main, subs] of subOrderByMain.entries()) {
    subs.forEach((subName, i) => {
      const key = `${main}::${subName}`;
      const brandSet = subMap.get(key) || new Set();
      subDocsInput.push({
        name: subName,
        slug: slugify(`${main}-${subName}`), // namespaced to avoid cross-category slug collisions
        parentId: mainIdBySlug.get(slugify(main)),
        level: 1,
        order: i,
        brands: [...brandSet].map((b) => ({ name: b, slug: slugify(b) })),
      });
    });
  }
  if (subDocsInput.length) {
    await Category.bulkWrite(
      subDocsInput.map((category) => ({
        updateOne: {
          filter: { slug: category.slug, level: 1 },
          update: { $setOnInsert: category },
          upsert: true,
        },
      })),
      { ordered: true }
    );
  }

  console.log("[seed] ✅ Category tree + brands seeded successfully");
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] ❌ Failed:", err);
  process.exit(1);
});

import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Categories are a self-referencing tree:
 *   level 0 → Main Category   (e.g. "Laptop")
 *   level 1 → Subcategory     (e.g. "Gaming Laptop")
 *
 * The mega menu's 3rd level (Brand) is NOT a separate category node —
 * StarTech's URL pattern is /main/sub/brand, where "brand" is a filter
 * value, not a page of its own. So each subcategory (level 1) embeds
 * the list of brand slugs/names that apply to it. The canonical brand
 * record (logo, description, etc.) lives in the Brand collection.
 */
const brandRefSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
  },
  { _id: false }
);

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null, index: true },
    level: { type: Number, required: true, default: 0 }, // 0 = main, 1 = sub
    icon: { type: String, default: null },
    order: { type: Number, default: 0 },
    brands: { type: [brandRefSchema], default: [] }, // only populated for level 1 nodes
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ parentId: 1, order: 1 });

export default mongoose.models.Category || mongoose.model("Category", categorySchema);

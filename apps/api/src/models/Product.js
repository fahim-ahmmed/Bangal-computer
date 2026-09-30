import mongoose from "mongoose";

const { Schema } = mongoose;

const variantSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g. "Color: Black" or "16GB/512GB"
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    sku: { type: String, default: null },
  },
  { _id: true }
);

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },

    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    subcategoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true, index: true },

    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, required: true, unique: true, trim: true },

    images: { type: [String], default: [] }, // Cloudinary secure_urls, order = display order

    // Dynamic key-value spec table, e.g. { "Processor": "Intel Core i5-13400", "RAM": "16GB DDR5" }
    specs: { type: Map, of: String, default: {} },

    description: { type: String, default: "" },

    variants: { type: [variantSchema], default: [] },

    rating: {
      avg: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },

    isFeatured: { type: Boolean, default: false },

    // Draft/Publish toggle (admin checklist item) — separate from isActive,
    // which is the soft-delete flag.
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });
productSchema.index({ categoryId: 1, subcategoryId: 1, brandId: 1, status: 1, isActive: 1 });

// Convenience: what the storefront should actually show
productSchema.statics.PUBLIC_FILTER = { status: "published", isActive: true };

export default mongoose.models.Product || mongoose.model("Product", productSchema);

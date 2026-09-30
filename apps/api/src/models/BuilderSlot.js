import mongoose from "mongoose";

const { Schema } = mongoose;

// PC Builder's slots are fixed (cpu/motherboard/ram/...) but which real
// Subcategory each one pulls products from is admin-configurable, since
// the actual seeded subcategory names/slugs come from the imported
// StarTech category sheet and can vary.
const builderSlotSchema = new Schema(
  {
    key: { type: String, required: true, unique: true }, // cpu, motherboard, ram, gpu, storage, psu, case, cooler
    label: { type: String, required: true },
    order: { type: Number, default: 0 },
    required: { type: Boolean, default: true },
    subcategoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.BuilderSlot || mongoose.model("BuilderSlot", builderSlotSchema);

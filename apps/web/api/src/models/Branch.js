import mongoose from "mongoose";

const { Schema } = mongoose;

const branchSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, default: null },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    hours: { type: String, default: "১০:০০ AM – ৮:০০ PM (প্রতিদিন)" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Branch || mongoose.model("Branch", branchSchema);

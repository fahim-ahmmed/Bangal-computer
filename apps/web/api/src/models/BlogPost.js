import mongoose from "mongoose";

const { Schema } = mongoose;

const blogPostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    coverImage: { type: String, default: null },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true }, // stored as markdown/HTML, rendered as-is on the frontend
    authorName: { type: String, default: "Bangal Computer" },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

blogPostSchema.index({ title: "text", content: "text" });

export default mongoose.models.BlogPost || mongoose.model("BlogPost", blogPostSchema);

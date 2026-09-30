import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import crypto from "crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

/**
 * Where images go when Cloudinary keys are NOT set (local development):
 * apps/api/uploads, served by Express at /uploads. Files stay on disk
 * permanently, so uploaded product images survive restarts. For
 * production, set the Cloudinary keys (or mount a persistent disk).
 */
export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

function publicBase() {
  return process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`;
}

/** Uploads one in-memory image (from multer). Returns { secure_url }. */
export async function uploadBuffer(buffer, { folder = "bangal-computer/products", mimetype = "image/jpeg" } = {}) {
  if (!cloudinaryConfigured) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${EXT[mimetype] || "jpg"}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
    return { secure_url: `${publicBase()}/uploads/${name}` };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

export function destroyByUrl(secureUrl) {
  try {
    if (secureUrl.includes("/uploads/") && !secureUrl.includes("/upload/")) {
      const file = path.join(UPLOAD_DIR, path.basename(secureUrl));
      if (file.startsWith(UPLOAD_DIR)) fs.rmSync(file, { force: true });
      return Promise.resolve();
    }
    if (!cloudinaryConfigured) return Promise.resolve();
    const parts = secureUrl.split("/upload/")[1];
    const withoutVersion = parts.replace(/^v\d+\//, "");
    const publicId = withoutVersion.replace(/\.[a-zA-Z0-9]+$/, "");
    return cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn("[images] could not delete image:", secureUrl, err.message);
    return Promise.resolve();
  }
}

export default cloudinary;

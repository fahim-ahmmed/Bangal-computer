import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getApiPublicUrl } from "./runtime-urls.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

export function createProductImageSignature(productId) {
  if (!cloudinaryConfigured) {
    throw new Error("Cloudinary is not configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `bangal-computer/products/${productId}/${timestamp}-${crypto.randomBytes(6).toString("hex")}`;
  const signature = cloudinary.utils.api_sign_request(
    { public_id: publicId, timestamp },
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    configured: true,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    timestamp,
    publicId,
    signature,
  };
}

export function isProductImageUrlForProduct(secureUrl, productId) {
  if (!cloudinaryConfigured || typeof secureUrl !== "string") return false;

  try {
    const url = new URL(secureUrl);
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") return false;

    const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
    if (parts[0] !== process.env.CLOUDINARY_CLOUD_NAME || parts[1] !== "image" || parts[2] !== "upload") {
      return false;
    }

    const pathParts = parts.slice(3);
    if (/^v\d+$/.test(pathParts[0] || "")) pathParts.shift();
    const fileName = pathParts.at(-1);
    if (!fileName) return false;
    pathParts[pathParts.length - 1] = fileName.replace(/\.[a-zA-Z0-9]+$/, "");

    return pathParts.join("/").startsWith(`bangal-computer/products/${productId}/`);
  } catch {
    return false;
  }
}

/**
 * Where images go when Cloudinary keys are NOT set (local development):
 * apps/api/uploads, served by Express at /uploads. This is only suitable
 * for local development because serverless filesystems are ephemeral.
 */
export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

function publicBase() {
  return getApiPublicUrl();
}

/** Uploads one in-memory image (from multer). Returns { secure_url }. */
export async function uploadBuffer(buffer, { folder = "bangal-computer/products", mimetype = "image/jpeg" } = {}) {
  if (!cloudinaryConfigured) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Cloudinary must be configured for persistent image uploads in production");
    }
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

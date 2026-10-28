import { fileURLToPath } from "node:url";
import path from "path";

export const ROOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
export const UPLOAD_ROOT = path.join(ROOT_DIR,"uploads");

export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);



export const IMAGE_UPLOAD_CONFIG = {
  product: {
    directory: "products",
    fieldName: "images",
    maxFiles: 5,
    maxFileSize: 5 * 1024 * 1024,
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 80,
  },

  profile: {
    directory: "users",
    fieldName: "image",
    maxFiles: 1,
    maxFileSize: 3 * 1024 * 1024,
    maxWidth: 500,
    maxHeight: 500,
    quality: 80,
  },

  category: {
    directory: "categories",
    fieldName: "image",
    maxFiles: 1,
    maxFileSize: 3 * 1024 * 1024,
    maxWidth: 800,
    maxHeight: 800,
    quality: 80,
  },

  banner: {
    directory: "banners",
    fieldName: "image",
    maxFiles: 1,
    maxFileSize: 5 * 1024 * 1024,
    maxWidth: 1920,
    maxHeight: 800,
    quality: 85,
  },
}



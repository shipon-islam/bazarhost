import fs from "fs/promises";
import path from "path";
import { ROOT_DIR, UPLOAD_ROOT } from "../config/upload.config";
// --------------------------------------------------
// Delete one or more uploaded images
// --------------------------------------------------

export const deleteImages = async (
  urls= [],
)=> {
  const imageUrls = Array.isArray(urls) ? urls : [urls];
  await Promise.all(
    imageUrls.map(async (url) => {
      try {
        // Only accept URLs inside our uploads directory.
        const normalizedUrl = url.replace(/\\/g, "/");
        if (
          !normalizedUrl.startsWith("/uploads/") ||
          normalizedUrl.includes("..")
        ) {
          return;
        }

        const relativePath = normalizedUrl.replace(/^\/+/, "");

        const absolutePath = path.resolve(ROOT_DIR, relativePath);

        const relativeToRoot = path.relative(UPLOAD_ROOT, absolutePath);

        if (
          relativeToRoot.startsWith("..") ||
          path.isAbsolute(relativeToRoot)
        ) {
          return;
        }

        await fs.unlink(absolutePath);
      } catch (error) {
        const nodeError = error ;

        if (nodeError.code !== "ENOENT") {
          console.error("Failed to delete uploaded image:", error);
        }
      }
    }),
  );
};

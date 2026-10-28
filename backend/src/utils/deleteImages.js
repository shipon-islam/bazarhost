import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
export async function removeUploadedFile(url) {
  if (!url.startsWith("/uploads/") || url.startsWith("/uploads/temp/")) return;
  await fs
    .unlink(path.join(env.uploadPath, path.basename(url)))
    .catch(() => {});
}

export const deleteMultipleImagesWithDB = async (items) => {
  await Promise.all(
    items.flatMap((item) => {
      (item.images || []).map(async (image) => {        
          removeUploadedFile(image.url);        
      });
    }),
  );
};

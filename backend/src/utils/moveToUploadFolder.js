import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import { tempPath } from "../middleware/upload.js";
import { ApiError } from "./ApiError.js";

export async function moveToUploadFolder(url) {
  if (!url.startsWith("/uploads/temp/")) return url; //  final
  const name = path.basename(url);
  try {
    await fs.rename(path.join(tempPath, name), path.join(env.uploadPath, name));
  } catch {
    throw new ApiError(400, "Image expired, please upload again");
  }
  return `/uploads/${name}`;
}

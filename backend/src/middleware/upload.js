import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const tempPath = path.join(env.uploadPath, 'temp');

fs.mkdirSync(tempPath, { recursive: true });


const MAX_DIMENSION = 1600; // max width/height (px)
const WEBP_QUALITY = 80;
 
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
 
const parseImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) =>
    ALLOWED.has(file.mimetype)
      ? cb(null, true)
      : cb(new ApiError(400, 'Only JPEG, PNG, WebP and GIF images are allowed')),
}).array('images', 10);
 
async function optimizeImages(req, _res, next) {
  if (!req.files?.length) return next();
 
  const written = [];
  try {
    req.files = await Promise.all(
      req.files.map(async (file) => {
        const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.webp`;
        const filePath = path.join(tempPath, filename);
 
        const info = await sharp(file.buffer)
          .rotate()
          .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toFile(filePath);
 
        written.push(filePath);
        return { filename, path: filePath, mimetype: 'image/webp', size: info.size };
      })
    );
    next();
  } catch (err) {
    await Promise.all(written.map((p) => fs.promises.unlink(p).catch(() => {})));
    next(err instanceof ApiError ? err : new ApiError(400, 'Invalid or corrupted image'));
  }
}
 
export const uploadOptimizeImages = [parseImages, optimizeImages];




// Extension comes from the validated MIME type, never from the client's filename. SVG is excluded on purpose (XSS).
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

export const uploadImages = multer({
  storage: multer.diskStorage({
    destination: tempPath,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${EXT[file.mimetype]}`),
  }),
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => (EXT[file.mimetype] ? cb(null, true) : cb(new ApiError(400, 'Only JPEG, PNG, WebP and GIF images are allowed'))),
}).array('images', 10);

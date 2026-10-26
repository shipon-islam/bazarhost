import crypto from 'node:crypto';
import fs from 'node:fs';
import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

fs.mkdirSync(env.uploadPath, { recursive: true });

// Extension comes from the validated MIME type, never from the client's filename. SVG is excluded on purpose (XSS).
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

export const uploadImages = multer({
  storage: multer.diskStorage({
    destination: env.uploadPath,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${EXT[file.mimetype]}`),
  }),
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => (EXT[file.mimetype] ? cb(null, true) : cb(new ApiError(400, 'Only JPEG, PNG, WebP and GIF images are allowed'))),
}).array('images', 10);

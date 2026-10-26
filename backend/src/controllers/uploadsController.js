import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';

/** Files live on local disk. For production, swap multer's storage for S3/Cloudinary and return those URLs. */
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new ApiError(400, 'No images uploaded. Send multipart/form-data with field "images".');
  ok(res, req.files.map((f) => ({
    url: `${env.PUBLIC_URL}/uploads/${f.filename}`,
    path: `/uploads/${f.filename}`,
    filename: f.filename,
    size: f.size,
    mimetype: f.mimetype,
  })), undefined, 201);
});

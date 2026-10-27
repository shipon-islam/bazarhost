import crypto from "crypto";
import fs from "fs/promises";
import multer from "multer";
import path from "path";
import sharp from "sharp";



import {
  ALLOWED_MIME_TYPES,
  IMAGE_UPLOAD_CONFIG,
  UPLOAD_ROOT,
} from "../config/upload.config";


// --------------------------------------------------
// Create Multer instance
// --------------------------------------------------

const createUploader = (category) => {
  const config = IMAGE_UPLOAD_CONFIG[category];

  return multer({
    storage: multer.memoryStorage(),

    limits: {
      fileSize: config.maxFileSize,
      files: config.maxFiles,
      fields: 20,
      parts: config.maxFiles + 20,
    },

    fileFilter: (_req, file, callback) => {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        const error = new Error(
          "Only JPG, PNG and WebP images are allowed.",
        );

        error.statusCode = 400;

        return callback(error);
      }

      callback(null, true);
    },
  });
};

// --------------------------------------------------
// Image processing
// --------------------------------------------------

const processImages = (category)=> {
  const config = IMAGE_UPLOAD_CONFIG[category];

  return async (
    req,
    _res,
    next,
  )=> {
    const files = (req.files) ?? [];

    if (!files.length) {
      req.savedImages = [];
      return next();
    }

    const uploadDir = path.join(UPLOAD_ROOT, config.directory);

    const savedFiles= [];

    try {
      await fs.mkdir(uploadDir, { recursive: true });

      const images = await Promise.all(
        files.map(async (file) => {
          // Verify actual image content instead of trusting MIME alone.
          const image = sharp(file.buffer, {
            limitInputPixels: 40_000_000,
          });

          const metadata = await image.metadata();

          if (
            !metadata.format ||
            !["jpeg", "png", "webp"].includes(metadata.format)
          ) {
            const error = new Error(
              "Invalid image content. Upload a valid JPG, PNG or WebP image.",
            );

            error.statusCode = 400;

            throw error;
          }

          const filename = `${crypto.randomUUID()}.webp`;

          const destination = path.join(uploadDir, filename);

          let pipeline = image.rotate().resize({
            width: config.maxWidth,
            height: config.maxHeight,
            fit: "inside",
            withoutEnlargement: true,
          });

          await pipeline.webp({ quality: config.quality }).toFile(destination);

          const url = `/uploads/${config.directory}/${filename}`;

          savedFiles.push(destination);

          return {
            url,
            filename,
            path: destination,
          };
        }),
      );

      req.savedImages = images.map((image) => image.url);

      next();
    } catch (error) {
      // Clean up files already written if processing fails.
      await Promise.all(
        savedFiles.map((filePath) =>
          fs.unlink(filePath).catch(() => undefined),
        ),
      );

      next(error);
    }
  };
};

// --------------------------------------------------
// Public uploader factory
// --------------------------------------------------

export const imageUploader = (
  category,
  options,
)=> {
  const config = IMAGE_UPLOAD_CONFIG[category];

  if (!config) {
    throw new Error(`Unknown image upload category: ${category}`);
  }

  const multiple = options.multiple ?? config.maxFiles > 1;

  const fieldName = options.fieldName ?? config.fieldName;

  const uploader = createUploader(category);

  const uploadMiddleware = multiple
    ? uploader.array(fieldName, config.maxFiles)
    : uploader.single(fieldName);

  const processingMiddleware= (req, res, next) => {
    // Normalize both single and multiple uploads.
    if (req.file) {
      req.files = [req.file];
    }

    return processImages(category)(req, res, next);
  };

  return [uploadMiddleware, processingMiddleware];
};

// --------------------------------------------------
// Export category-specific shortcuts
// --------------------------------------------------

export const uploadProductImages = imageUploader("products");

export const uploadProfileImage = imageUploader("profile");

export const uploadCategoryImage = imageUploader("category");

export const uploadBannerImage = imageUploader("banner");

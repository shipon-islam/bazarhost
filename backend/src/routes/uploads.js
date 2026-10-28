import { Router } from 'express';
import { uploadImages as handler } from '../controllers/uploadsController.js';
import { authenticate, requirePermission as can, requireStaff } from '../middleware/auth.js';
import { uploadImages, uploadOptimizeImages } from '../middleware/upload.js';

const router = Router();
router.use(authenticate, requireStaff);

router.post('/images/original', can('products:create', 'products:edit', 'categories:create', 'categories:edit', 'settings:edit'), uploadImages, handler);

router.post('/images', can('products:create', 'products:edit', 'categories:create', 'categories:edit', 'settings:edit'), uploadOptimizeImages, handler);

export default router;

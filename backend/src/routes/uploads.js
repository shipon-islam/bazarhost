import { Router } from 'express';
import { uploadImages as handler } from '../controllers/uploadsController.js';
import { authenticate, requirePermission as can, requireStaff } from '../middleware/auth.js';
import { uploadImages } from '../middleware/upload.js';

const router = Router();
router.use(authenticate, requireStaff);

router.post('/images', can('products:create', 'products:edit', 'categories:create', 'categories:edit', 'settings:edit'), uploadImages, handler);

export default router;

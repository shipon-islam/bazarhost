import { Router } from 'express';
import * as c from '../controllers/settingsController.js';
import { authenticate, requirePermission as can, requireStaff } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateSettingsSchema } from '../validations/settings.js';

const router = Router();
router.use(authenticate, requireStaff);

router.get('/', can('settings:view'), c.get);
router.put('/', can('settings:edit'), validate({ body: updateSettingsSchema }), c.update);
router.patch('/', can('settings:edit'), validate({ body: updateSettingsSchema }), c.update);

export default router;

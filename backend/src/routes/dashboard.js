import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { authenticate, requireStaff } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { rangeQuery } from '../validations/common.js';

const router = Router();
// Any staff member can open the dashboard; each section is filtered by their permissions in the controller.
router.get('/', authenticate, requireStaff, validate({ query: rangeQuery }), getDashboard);

export default router;

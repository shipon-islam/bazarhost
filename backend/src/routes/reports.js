import { Router } from 'express';
import * as c from '../controllers/reportsController.js';
import { authenticate, requirePermission as can, requireStaff } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { rangeQuery } from '../validations/common.js';
import { exportParams, topProductsQuery } from '../validations/report.js';

const router = Router();
router.use(authenticate, requireStaff, can('reports:view'));

router.get('/revenue', validate({ query: rangeQuery }), c.revenue);
router.get('/orders', validate({ query: rangeQuery }), c.orders);
router.get('/products', validate({ query: topProductsQuery }), c.products);
router.get('/customers', validate({ query: rangeQuery }), c.customers);
router.get('/export/:type', validate({ params: exportParams, query: topProductsQuery }), c.exportReport);

export default router;

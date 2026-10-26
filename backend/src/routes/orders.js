import { Router } from 'express';
import * as c from '../controllers/ordersController.js';
import { authenticate, requirePermission as can, requireStaff } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam } from '../validations/common.js';
import {
  addNoteSchema, archiveSchema, bulkOrderStatusSchema, createOrderSchema, exportOrdersQuery, listOrdersQuery,
  refundSchema, updatePaymentSchema, updateStatusSchema,
} from '../validations/order.js';

const router = Router();
router.use(authenticate, requireStaff);

router.get('/', can('orders:view'), validate({ query: listOrdersQuery }), c.list);
router.get('/export', can('orders:view'), validate({ query: exportOrdersQuery }), c.exportCsv);
router.post('/', can('orders:create'), validate({ body: createOrderSchema }), c.create);
router.post('/bulk-status', can('orders:edit'), validate({ body: bulkOrderStatusSchema }), c.bulkStatus);
router.get('/:id', can('orders:view'), validate({ params: idParam }), c.getOne);
router.patch('/:id/status', can('orders:edit'), validate({ params: idParam, body: updateStatusSchema }), c.updateStatus);
router.patch('/:id/payment', can('orders:edit'), validate({ params: idParam, body: updatePaymentSchema }), c.updatePayment);
router.post('/:id/refund', can('orders:edit'), validate({ params: idParam, body: refundSchema }), c.refund);
router.post('/:id/notes', can('orders:edit'), validate({ params: idParam, body: addNoteSchema }), c.addNote);
router.patch('/:id/archive', can('orders:edit'), validate({ params: idParam, body: archiveSchema }), c.archive);
// Intentionally no DELETE: orders are financial records.

export default router;

import { Router } from 'express';
import * as c from '../controllers/productsController.js';
import { authenticate, requirePermission as can, requirePermissionWhen, requireStaff } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam } from '../validations/common.js';
import { bulkProductsSchema, createProductSchema, listProductsQuery, updateProductSchema } from '../validations/product.js';

const router = Router();
const isDelete = (req) => req.body.action === 'delete';
router.use(authenticate, requireStaff);

router.get('/', can('products:view'), validate({ query: listProductsQuery }), c.list);
router.post('/', can('products:create'), validate({ body: createProductSchema }), c.create);
router.post('/bulk', can('products:edit'), validate({ body: bulkProductsSchema }), requirePermissionWhen(isDelete, 'products:delete'), c.bulk);
router.get('/:id', can('products:view'), validate({ params: idParam }), c.getOne);
router.route('/:id')
  .put(can('products:edit'), validate({ params: idParam, body: updateProductSchema }), c.update)
  .patch(can('products:edit'), validate({ params: idParam, body: updateProductSchema }), c.update)
  .delete(can('products:delete'), validate({ params: idParam }), c.remove);

export default router;

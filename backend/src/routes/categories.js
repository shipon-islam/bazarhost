import { Router } from 'express';
import * as c from '../controllers/categoriesController.js';
import { authenticate, requirePermission as can, requirePermissionWhen, requireStaff } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { bulkCategoriesSchema, createCategorySchema, listCategoriesQuery, updateCategorySchema } from '../validations/category.js';
import { idParam } from '../validations/common.js';

const router = Router();
const isDelete = (req) => req.body.action === 'delete';
router.use(authenticate, requireStaff);

router.get('/', can('categories:view'), validate({ query: listCategoriesQuery }), c.list);
// Dropdown data is needed by product forms too, so products:* permissions are enough
router.get('/options', can('categories:view', 'products:view'), c.options);
router.post('/', can('categories:create'), validate({ body: createCategorySchema }), c.create);
router.post('/bulk', can('categories:edit'), validate({ body: bulkCategoriesSchema }), requirePermissionWhen(isDelete, 'categories:delete'), c.bulk);
router.get('/:id', can('categories:view'), validate({ params: idParam }), c.getOne);
router.route('/:id')
  .put(can('categories:edit'), validate({ params: idParam, body: updateCategorySchema }), c.update)
  .patch(can('categories:edit'), validate({ params: idParam, body: updateCategorySchema }), c.update)
  .delete(can('categories:delete'), validate({ params: idParam }), c.remove);

export default router;

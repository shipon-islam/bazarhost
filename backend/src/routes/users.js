import { Router } from 'express';
import * as c from '../controllers/usersController.js';
import { authenticate, requirePermission as can, requirePermissionWhen, requireStaff } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam } from '../validations/common.js';
import { bulkUsersSchema, createUserSchema, listUsersQuery, updateUserSchema, userStatusSchema } from '../validations/user.js';

const router = Router();
const isDelete = (req) => req.body.action === 'delete';
router.use(authenticate, requireStaff);

router.get('/', can('users:view'), validate({ query: listUsersQuery }), c.list);
router.post('/', can('users:create'), validate({ body: createUserSchema }), c.create);
router.post('/bulk', can('users:edit'), validate({ body: bulkUsersSchema }), requirePermissionWhen(isDelete, 'users:delete'), c.bulk);
router.get('/:id', can('users:view'), validate({ params: idParam }), c.getOne);
router.get('/:id/activity', can('users:view'), validate({ params: idParam }), c.activity);
router.patch('/:id/status', can('users:edit'), validate({ params: idParam, body: userStatusSchema }), c.setStatus);
router.post('/:id/invite', can('users:edit'), validate({ params: idParam }), c.resendInvite);
router.route('/:id')
  .put(can('users:edit'), validate({ params: idParam, body: updateUserSchema }), c.update)
  .patch(can('users:edit'), validate({ params: idParam, body: updateUserSchema }), c.update)
  .delete(can('users:delete'), validate({ params: idParam }), c.remove);

export default router;

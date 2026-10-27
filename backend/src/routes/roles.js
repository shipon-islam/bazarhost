import { Router } from "express";
import * as c from "../controllers/rolesController.js";
import {
  authenticate,
  requirePermission as can,
  requireStaff,
} from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam } from "../validations/common.js";
import { createRoleSchema, updateRoleSchema } from "../validations/role.js";

const router = Router();
router.use(authenticate, requireStaff);

// Roles are also needed by the user form's role dropdown, hence users:* is accepted for read access.
router.get("/", can("roles:view", "users:view"), c.list);
router.get("/meta", can("roles:view"), c.meta);
router.post(
  "/",
  can("roles:create"),
  validate({ body: createRoleSchema }),
  c.create,
);
router.get("/:id", can("roles:view"), validate({ params: idParam }), c.getOne);
router
  .route("/:id")
  .put(
    can("roles:edit"),
    validate({ params: idParam, body: updateRoleSchema }),
    c.update,
  )
  .patch(
    can("roles:edit"),
    validate({ params: idParam, body: updateRoleSchema }),
    c.update,
  )
  .delete(can("roles:delete"), validate({ params: idParam }), c.remove);

export default router;

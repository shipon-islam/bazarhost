import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as c from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { acceptInviteSchema, changePasswordSchema, loginSchema, updateMeSchema } from '../validations/auth.js';

const router = Router();

// Brute-force protection: failed attempts only count against the limit
const limiter = (limit) => rateLimit({ windowMs: 15 * 60 * 1000, limit, standardHeaders: 'draft-7', legacyHeaders: false, skipSuccessfulRequests: true, message: { success: false, error: { message: 'Too many attempts. Try again later.', code: 'RATE_LIMITED' } } });

router.post('/login', limiter(10), validate({ body: loginSchema }), c.login);
router.post('/logout', c.logout);
router.post('/accept-invite', limiter(10), validate({ body: acceptInviteSchema }), c.acceptInvite);
router.get('/me', authenticate, c.me);
router.patch('/me', authenticate, validate({ body: updateMeSchema }), c.updateMe);
router.post('/change-password', authenticate, validate({ body: changePasswordSchema }), c.changePassword);

export default router;

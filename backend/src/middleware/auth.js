import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hasAnyPermission } from '../utils/permissions.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Authenticates via httpOnly cookie or `Authorization: Bearer <jwt>`, then loads user + role. */
export const authenticate = asyncHandler(async (req, _res, next) => {
  let token;
  let fromCookie = false;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) token = header.slice(7);
  else if (req.cookies?.[env.COOKIE_NAME]) {
    token = req.cookies[env.COOKIE_NAME];
    fromCookie = true;
  }
  if (!token) throw new ApiError(401, 'Authentication required', { code: 'UNAUTHENTICATED' });

  // CSRF defence for cookie sessions: reject state-changing requests from foreign origins.
  if (fromCookie && !SAFE_METHODS.has(req.method)) {
    const origin = req.headers.origin;
    if (origin && !env.clientUrls.includes(origin)) throw new ApiError(403, 'Origin not allowed', { code: 'BAD_ORIGIN' });
  }

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    throw new ApiError(401, 'Session expired or invalid. Please sign in again.', { code: 'INVALID_TOKEN' });
  }

  const user = await User.findById(payload.sub).populate('role');
  if (!user || !user.role || user.tokenVersion !== payload.tv) {
    throw new ApiError(401, 'Session expired or invalid. Please sign in again.', { code: 'INVALID_TOKEN' });
  }
  if (user.status !== 'active') throw new ApiError(403, `Your account is ${user.status}.`, { code: 'ACCOUNT_INACTIVE' });

  req.user = user;
  next();
});

export const requireStaff = (req, _res, next) =>
  req.user?.role?.type === 'staff' ? next() : next(new ApiError(403, 'Admin access required', { code: 'FORBIDDEN' }));

/** Passes if the user holds ANY of the given permissions (e.g. requirePermission('products:edit')). */
export const requirePermission = (...perms) => (req, _res, next) =>
  hasAnyPermission(req.user, perms)
    ? next()
    : next(new ApiError(403, 'You do not have permission to perform this action', { code: 'FORBIDDEN', details: [{ message: `Requires: ${perms.join(' or ')}` }] }));

/** Applies requirePermission only when predicate(req) is true (e.g. bulk "delete" needs delete permission). */
export const requirePermissionWhen = (predicate, ...perms) => (req, res, next) =>
  predicate(req) ? requirePermission(...perms)(req, res, next) : next();

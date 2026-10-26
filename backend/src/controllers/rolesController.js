import { ACTIONS, MODULES } from '../config/constants.js';
import { Role } from '../models/Role.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { effectivePermissions, normalizePermissions } from '../utils/permissions.js';
import { escapeRegex } from '../utils/query.js';
import { ok } from '../utils/response.js';
import { uniqueSlug } from '../utils/slug.js';
import { audit } from '../services/audit.js';

const sameId = (a, b) => String(a) === String(b);

async function withUserCounts(roles) {
  const counts = await User.aggregate([{ $match: { role: { $in: roles.map((r) => r._id) } } }, { $group: { _id: '$role', n: { $sum: 1 } } }]);
  const map = new Map(counts.map((c) => [String(c._id), c.n]));
  return roles.map((r) => ({ ...r.toJSON(), userCount: map.get(String(r._id)) ?? 0 }));
}

async function assertNameFree(name, excludeId) {
  const clash = await Role.exists({ name: new RegExp(`^${escapeRegex(name)}$`, 'i'), ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
  if (clash) throw new ApiError(409, 'A role with this name already exists', { details: [{ field: 'name', message: 'Name already in use' }] });
}

/** Permissions the acting admin is trying to grant but does not hold themselves (escalation guard). */
function assertCanGrant(actor, added) {
  const mine = new Set(effectivePermissions(actor));
  const denied = added.filter((p) => !mine.has(p));
  if (denied.length) throw new ApiError(403, 'You cannot grant permissions you do not have', { code: 'FORBIDDEN', details: denied.map((p) => ({ field: 'permissions', message: p })) });
}

export const meta = asyncHandler(async (_req, res) => ok(res, { modules: MODULES, actions: ACTIONS }));

export const list = asyncHandler(async (_req, res) => {
  const roles = await Role.find().sort({ isSuperAdmin: -1, isSystem: -1, name: 1 });
  ok(res, await withUserCounts(roles));
});

export const getOne = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw new ApiError(404, 'Role not found', { code: 'NOT_FOUND' });
  const [withCount] = await withUserCounts([role]);
  ok(res, withCount);
});

export const create = asyncHandler(async (req, res) => {
  const { confirmSelfLockout, ...body } = req.body;
  const type = body.type ?? 'staff';
  const permissions = type === 'customer' ? [] : normalizePermissions(body.permissions);
  await assertNameFree(body.name);
  assertCanGrant(req.user, permissions);
  const role = await Role.create({ name: body.name, description: body.description, type, permissions, slug: await uniqueSlug(Role, body.name) });
  audit(req, 'role.created', 'role', role._id, { name: role.name });
  ok(res, role, undefined, 201);
});

export const update = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw new ApiError(404, 'Role not found', { code: 'NOT_FOUND' });
  if (role.isSuperAdmin) throw new ApiError(403, 'The Super Admin role cannot be modified', { code: 'PROTECTED_ROLE' });

  const { confirmSelfLockout, ...body } = req.body;
  if (body.name && body.name !== role.name) {
    await assertNameFree(body.name, role._id);
    role.name = body.name;
  }
  if (body.description !== undefined) role.description = body.description;

  if (body.permissions && role.type === 'staff') {
    const next = normalizePermissions(body.permissions);
    const added = next.filter((p) => !role.permissions.includes(p));
    const removed = role.permissions.filter((p) => !next.includes(p));
    assertCanGrant(req.user, added);
    if (sameId(req.user.role._id, role._id) && removed.length && !confirmSelfLockout) {
      throw new ApiError(409, 'You are removing permissions from your own role. You may lose access. Resend with confirmSelfLockout: true to proceed.', {
        code: 'SELF_LOCKOUT_WARNING',
        details: removed.map((p) => ({ field: 'permissions', message: p })),
      });
    }
    role.permissions = next;
  }
  await role.save();
  audit(req, 'role.updated', 'role', role._id, { name: role.name });
  const [withCount] = await withUserCounts([role]);
  ok(res, withCount);
});

export const remove = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw new ApiError(404, 'Role not found', { code: 'NOT_FOUND' });
  if (role.isSystem) throw new ApiError(403, 'System roles cannot be deleted', { code: 'PROTECTED_ROLE' });
  const userCount = await User.countDocuments({ role: role._id });
  if (userCount > 0) throw new ApiError(409, `This role is assigned to ${userCount} user(s). Reassign them first.`, { code: 'ROLE_IN_USE', details: [{ message: String(userCount) }] });
  await role.deleteOne();
  audit(req, 'role.deleted', 'role', role._id, { name: role.name });
  ok(res, { message: 'Role deleted' });
});

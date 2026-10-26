import { env } from '../config/env.js';
import { Order } from '../models/Order.js';
import { Role } from '../models/Role.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { canManageRole } from '../utils/permissions.js';
import { andFilter, buildSort, paginate, round2, searchCondition } from '../utils/query.js';
import { ok } from '../utils/response.js';
import { audit } from '../services/audit.js';
import { issueInvite } from '../services/invite.js';

const SORTABLE = ['createdAt', 'name', 'email', 'lastLoginAt', 'status'];
const LIGHT_ROLE = { path: 'role', select: 'name slug type isSuperAdmin' };
const FULL_ROLE = { path: 'role', select: 'name slug type isSuperAdmin permissions' };
const sameId = (a, b) => String(a) === String(b);

async function loadTarget(id) {
  const user = await User.findById(id).populate(FULL_ROLE);
  if (!user) throw new ApiError(404, 'User not found', { code: 'NOT_FOUND' });
  return user;
}

const assertCanManage = (actor, target) => {
  if (!canManageRole(actor, target.role)) throw new ApiError(403, 'You do not have permission to manage this user', { code: 'FORBIDDEN' });
};

async function assertNotLastSuperAdmin(target) {
  if (!target.role?.isSuperAdmin) return;
  const others = await User.countDocuments({ role: target.role._id, status: 'active', _id: { $ne: target._id } });
  if (others === 0) throw new ApiError(409, 'At least one active Super Admin must remain', { code: 'LAST_SUPER_ADMIN' });
}

async function loadAssignableRole(actor, roleId) {
  const role = await Role.findById(roleId);
  if (!role) throw new ApiError(400, 'Role not found', { details: [{ field: 'role', message: 'Role not found' }] });
  if (!canManageRole(actor, role)) throw new ApiError(403, 'You cannot assign a role with more permissions than your own', { code: 'FORBIDDEN' });
  return role;
}

async function applyStatus(req, target, status) {
  if (sameId(target._id, req.user._id)) throw new ApiError(400, 'You cannot change your own account status', { code: 'SELF_ACTION' });
  assertCanManage(req.user, target);
  if (status !== 'active') await assertNotLastSuperAdmin(target);
  const from = target.status;
  target.status = status;
  if (status !== 'active') target.tokenVersion += 1; // sign the user out everywhere
  await target.save();
  audit(req, 'user.status_changed', 'user', target._id, { from, to: status });
}

async function removeUser(req, target) {
  if (sameId(target._id, req.user._id)) throw new ApiError(400, 'You cannot delete your own account', { code: 'SELF_ACTION' });
  assertCanManage(req.user, target);
  await assertNotLastSuperAdmin(target);
  if (await Order.exists({ customer: target._id })) {
    throw new ApiError(409, 'This user has orders and cannot be deleted. Disable the account instead.', { code: 'USER_HAS_ORDERS' });
  }
  await target.deleteOne();
  audit(req, 'user.deleted', 'user', target._id, { email: target.email });
}

export const list = asyncHandler(async (req, res) => {
  const q = req.query;
  const conds = [searchCondition(q.search, ['name', 'email', 'phone'])];
  if (q.status) conds.push({ status: q.status });
  if (q.role) conds.push({ role: q.role });
  else if (q.roleType) conds.push({ role: { $in: await Role.find({ type: q.roleType }).distinct('_id') } });

  const { items, meta } = await paginate(User, andFilter(conds), {
    page: q.page, limit: q.limit, sort: buildSort(q.sortBy, q.order, SORTABLE), populate: LIGHT_ROLE,
  });

  // Attach order stats (useful for the Customers table) with a single aggregate
  const stats = await Order.aggregate([
    { $match: { customer: { $in: items.map((u) => u._id) } } },
    { $group: { _id: '$customer', ordersCount: { $sum: 1 }, totalSpent: { $sum: { $cond: [{ $in: ['$paymentStatus', ['paid']] }, '$total', 0] } } } },
  ]);
  const byUser = new Map(stats.map((s) => [String(s._id), s]));
  const data = items.map((u) => ({
    ...u.toJSON(),
    ordersCount: byUser.get(String(u._id))?.ordersCount ?? 0,
    totalSpent: round2(byUser.get(String(u._id))?.totalSpent),
  }));
  ok(res, data, meta);
});

export const getOne = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate(LIGHT_ROLE);
  if (!user) throw new ApiError(404, 'User not found', { code: 'NOT_FOUND' });
  const [recentOrders, [agg]] = await Promise.all([
    Order.find({ customer: user._id }).sort({ createdAt: -1 }).limit(10).select('-timeline -notes'),
    Order.aggregate([
      { $match: { customer: user._id } },
      { $group: { _id: null, ordersCount: { $sum: 1 }, totalSpent: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] } } } },
    ]),
  ]);
  ok(res, { user, stats: { ordersCount: agg?.ordersCount ?? 0, totalSpent: round2(agg?.totalSpent) }, recentOrders });
});

export const create = asyncHandler(async (req, res) => {
  const { sendInvite, ...body } = req.body;
  const role = await loadAssignableRole(req.user, body.role);
  if (await User.exists({ email: body.email })) {
    throw new ApiError(409, 'A user with this email already exists', { details: [{ field: 'email', message: 'Email already in use' }] });
  }
  const user = await User.create(body);
  let invite;
  if (sendInvite ?? role.type === 'staff') invite = await issueInvite(user);
  await user.populate(LIGHT_ROLE);
  audit(req, 'user.created', 'user', user._id, { email: user.email, role: role.name });
  // The link is only echoed back outside production (there is no email provider wired up yet).
  ok(res, { user, invite: invite ? { expiresAt: invite.expiresAt, ...(env.isProd ? {} : { link: invite.link }) } : null }, undefined, 201);
});

export const update = asyncHandler(async (req, res) => {
  const target = await loadTarget(req.params.id);
  const body = req.body;
  const isSelf = sameId(target._id, req.user._id);
  if (!isSelf) assertCanManage(req.user, target);

  if (body.role && !sameId(body.role, target.role._id)) {
    if (isSelf) throw new ApiError(400, 'You cannot change your own role', { code: 'SELF_ACTION' });
    await assertNotLastSuperAdmin(target);
    await loadAssignableRole(req.user, body.role);
    target.tokenVersion += 1;
  }
  if (body.status && body.status !== target.status) {
    await applyStatus(req, target, body.status);
    delete body.status;
  }
  if (body.email && body.email !== target.email && (await User.exists({ email: body.email, _id: { $ne: target._id } }))) {
    throw new ApiError(409, 'A user with this email already exists', { details: [{ field: 'email', message: 'Email already in use' }] });
  }
  target.set(body);
  await target.save();
  await target.populate(LIGHT_ROLE);
  audit(req, 'user.updated', 'user', target._id, { fields: Object.keys(body) });
  ok(res, target);
});

export const setStatus = asyncHandler(async (req, res) => {
  const target = await loadTarget(req.params.id);
  await applyStatus(req, target, req.body.status);
  await target.populate(LIGHT_ROLE);
  ok(res, target);
});

export const remove = asyncHandler(async (req, res) => {
  await removeUser(req, await loadTarget(req.params.id));
  ok(res, { message: 'User deleted' });
});

export const resendInvite = asyncHandler(async (req, res) => {
  const target = await loadTarget(req.params.id);
  assertCanManage(req.user, target);
  const invite = await issueInvite(target);
  audit(req, 'user.invite_sent', 'user', target._id);
  ok(res, { message: 'Invite sent', expiresAt: invite.expiresAt, ...(env.isProd ? {} : { link: invite.link }) });
});

export const activity = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const logs = await AuditLog.find({ $or: [{ actor: id }, { entity: 'user', entityId: id }] })
    .sort({ createdAt: -1 }).limit(50).populate('actor', 'name email');
  ok(res, logs);
});

export const bulk = asyncHandler(async (req, res) => {
  const { action, ids } = req.body;
  const results = [];
  for (const id of ids) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const target = await loadTarget(id);
      // eslint-disable-next-line no-await-in-loop
      if (action === 'delete') await removeUser(req, target);
      // eslint-disable-next-line no-await-in-loop
      else await applyStatus(req, target, { activate: 'active', disable: 'disabled', suspend: 'suspended' }[action]);
      results.push({ id, ok: true });
    } catch (err) {
      results.push({ id, ok: false, error: err.message });
    }
  }
  ok(res, { succeeded: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length, results });
});

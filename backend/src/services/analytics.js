import { ORDER_STATUSES } from '../config/constants.js';
import { Order } from '../models/Order.js';
import { Role } from '../models/Role.js';
import { User } from '../models/User.js';
import { bucketKeys, mongoFormat } from '../utils/dateRange.js';
import { round2 } from '../utils/query.js';

/**
 * Revenue definition (used everywhere): orders that are NOT cancelled and whose payment is NOT failed/refunded.
 * Pending COD orders therefore count as expected revenue; adjust REVENUE_COND if you prefer "paid only".
 */
const revenueCond = {
  $and: [{ $ne: ['$status', 'cancelled'] }, { $not: [{ $in: ['$paymentStatus', ['failed', 'refunded']] }] }],
};
const REVENUE_MATCH = { status: { $ne: 'cancelled' }, paymentStatus: { $nin: ['failed', 'refunded'] } };
const within = (start, end) => ({ createdAt: { $gte: start, $lt: end } });

export const percentChange = (cur, prev) => {
  if (!prev) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
};

export async function orderTimeSeries(range, tz) {
  const rows = await Order.aggregate([
    { $match: within(range.start, range.end) },
    {
      $group: {
        _id: { $dateToString: { format: mongoFormat[range.gran], date: '$createdAt', timezone: tz } },
        orders: { $sum: 1 },
        revenue: { $sum: { $cond: [revenueCond, '$total', 0] } },
      },
    },
  ]);
  const map = new Map(rows.map((r) => [r._id, r]));
  return bucketKeys(range, tz).map((k) => ({ date: k, revenue: round2(map.get(k)?.revenue), orders: map.get(k)?.orders ?? 0 }));
}

export async function periodTotals(start, end) {
  const [r] = await Order.aggregate([
    { $match: within(start, end) },
    {
      $group: {
        _id: null,
        orders: { $sum: 1 },
        revenue: { $sum: { $cond: [revenueCond, '$total', 0] } },
        revenueOrders: { $sum: { $cond: [revenueCond, 1, 0] } },
      },
    },
  ]);
  const revenue = round2(r?.revenue);
  const revenueOrders = r?.revenueOrders ?? 0;
  return { orders: r?.orders ?? 0, revenue, averageOrderValue: revenueOrders ? round2(revenue / revenueOrders) : 0 };
}

export async function statusBreakdown(range) {
  const rows = await Order.aggregate([{ $match: within(range.start, range.end) }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
  const map = new Map(rows.map((r) => [r._id, r.count]));
  const total = rows.reduce((s, r) => s + r.count, 0);
  return ORDER_STATUSES.map((status) => {
    const count = map.get(status) ?? 0;
    return { status, count, percentage: total ? Math.round((count / total) * 1000) / 10 : 0 };
  });
}

export async function topProducts(range, { metric = 'units', limit = 5 } = {}) {
  const rows = await Order.aggregate([
    { $match: { ...within(range.start, range.end), ...REVENUE_MATCH } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        sku: { $first: '$items.sku' },
        image: { $first: '$items.image' },
        units: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.subtotal' },
      },
    },
    { $sort: metric === 'revenue' ? { revenue: -1, units: -1 } : { units: -1, revenue: -1 } },
    { $limit: limit },
  ]);
  return rows.map((r) => ({ productId: r._id, name: r.name, sku: r.sku, image: r.image, units: r.units, revenue: round2(r.revenue) }));
}

export const customerRoleIds = () => Role.find({ type: 'customer' }).distinct('_id');

export async function customerSeries(range, tz) {
  const roles = await customerRoleIds();
  const rows = await User.aggregate([
    { $match: { role: { $in: roles }, ...within(range.start, range.end) } },
    { $group: { _id: { $dateToString: { format: mongoFormat[range.gran], date: '$createdAt', timezone: tz } }, customers: { $sum: 1 } } },
  ]);
  const map = new Map(rows.map((r) => [r._id, r.customers]));
  return bucketKeys(range, tz).map((k) => ({ date: k, customers: map.get(k) ?? 0 }));
}

export async function countCustomers(start, end) {
  const roles = await customerRoleIds();
  return User.countDocuments({ role: { $in: roles }, ...(start ? within(start, end) : {}) });
}

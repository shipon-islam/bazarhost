import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { csvRow, startCsv } from '../utils/csv.js';
import { localDayRange } from '../utils/dateRange.js';
import { andFilter, buildSort, paginate, searchCondition } from '../utils/query.js';
import { ok } from '../utils/response.js';
import { audit } from '../services/audit.js';
import { actorOf, createOrder, transitionOrder } from '../services/orderService.js';
import { getSettings } from '../services/settings.js';

const SORTABLE = ['createdAt', 'total', 'orderNumber', 'status', 'paymentStatus'];

async function buildFilter(q) {
  const { timezone } = await getSettings();
  const conds = [searchCondition(q.search, ['orderNumber', 'customerSnapshot.name', 'customerSnapshot.email', 'customerSnapshot.phone'])];
  for (const k of ['status', 'paymentStatus', 'paymentMethod', 'customer']) if (q[k]) conds.push({ [k]: q[k] });
  const dates = localDayRange(q.from, q.to, timezone);
  if (dates) conds.push({ createdAt: dates });
  if (q.archived === 'false') conds.push({ isArchived: false });
  if (q.archived === 'true') conds.push({ isArchived: true });
  return andFilter(conds);
}

const loadOrder = async (id) => {
  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, 'Order not found', { code: 'NOT_FOUND' });
  return order;
};

export const list = asyncHandler(async (req, res) => {
  const q = req.query;
  const { items, meta } = await paginate(Order, await buildFilter(q), {
    page: q.page, limit: q.limit, sort: buildSort(q.sortBy, q.order, SORTABLE), select: '-timeline -notes',
  });
  ok(res, items, meta);
});

export const getOne = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('customer', 'name email phone avatar');
  if (!order) throw new ApiError(404, 'Order not found', { code: 'NOT_FOUND' });
  ok(res, order);
});

export const create = asyncHandler(async (req, res) => {
  const order = await createOrder(req.body, req.user);
  audit(req, 'order.created', 'order', order._id, { orderNumber: order.orderNumber, total: order.total });
  ok(res, order, undefined, 201);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const order = await transitionOrder(await loadOrder(req.params.id), req.body.status, req.body.note, req.user);
  audit(req, 'order.status_changed', 'order', order._id, { to: req.body.status });
  ok(res, order);
});

export const bulkStatus = asyncHandler(async (req, res) => {
  const { ids, status, note } = req.body;
  const results = [];
  for (const id of ids) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await transitionOrder(await loadOrder(id), status, note, req.user);
      results.push({ id, ok: true });
    } catch (err) {
      results.push({ id, ok: false, error: err.message });
    }
  }
  audit(req, 'order.bulk_status', 'order', undefined, { ids, status });
  ok(res, { succeeded: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length, results });
});

export const updatePayment = asyncHandler(async (req, res) => {
  const order = await loadOrder(req.params.id);
  if (order.paymentStatus === 'refunded') throw new ApiError(409, 'A refunded order cannot be changed', { code: 'ALREADY_REFUNDED' });
  const { paymentStatus, transactionId } = req.body;
  order.paymentStatus = paymentStatus;
  if (transactionId !== undefined) order.transactionId = transactionId ?? undefined;
  order.timeline.push({ type: 'payment', status: paymentStatus, by: actorOf(req.user) });
  await order.save();
  audit(req, 'order.payment_updated', 'order', order._id, { paymentStatus });
  ok(res, order);
});

/**
 * Records a refund in the system only. No payment gateway is integrated, so the money must be returned
 * through your gateway / bank separately (or hook that call in here).
 */
export const refund = asyncHandler(async (req, res) => {
  const order = await loadOrder(req.params.id);
  if (order.paymentStatus !== 'paid') throw new ApiError(409, 'Only paid orders can be refunded', { code: 'NOT_REFUNDABLE' });
  order.paymentStatus = 'refunded';
  order.timeline.push({ type: 'payment', status: 'refunded', note: req.body.reason, by: actorOf(req.user) });
  await order.save();
  audit(req, 'order.refunded', 'order', order._id, { total: order.total });
  ok(res, order);
});

export const addNote = asyncHandler(async (req, res) => {
  const order = await loadOrder(req.params.id);
  order.notes.push({ text: req.body.text, by: actorOf(req.user) });
  await order.save();
  ok(res, order, undefined, 201);
});

/** Orders are financial records and are never deleted – archive them instead. */
export const archive = asyncHandler(async (req, res) => {
  const order = await loadOrder(req.params.id);
  if (req.body.archived && !['delivered', 'cancelled'].includes(order.status)) {
    throw new ApiError(409, 'Only delivered or cancelled orders can be archived', { code: 'NOT_ARCHIVABLE' });
  }
  order.isArchived = req.body.archived;
  await order.save();
  audit(req, req.body.archived ? 'order.archived' : 'order.unarchived', 'order', order._id);
  ok(res, order);
});

export const exportCsv = asyncHandler(async (req, res) => {
  const cursor = Order.find(await buildFilter(req.query)).sort({ createdAt: -1 }).limit(20000).select('-timeline -notes').cursor();
  startCsv(res, `orders-${new Date().toISOString().slice(0, 10)}.csv`);
  res.write(csvRow(['Order #', 'Date', 'Customer', 'Email', 'Phone', 'Items', 'Subtotal', 'Discount', 'Shipping', 'Tax', 'Total', 'Currency', 'Payment method', 'Payment status', 'Status', 'City']));
  for await (const o of cursor) {
    res.write(csvRow([
      o.orderNumber, o.createdAt, o.customerSnapshot.name, o.customerSnapshot.email, o.customerSnapshot.phone, o.itemsCount,
      o.subtotal, o.discount, o.shippingFee, o.tax, o.total, o.currency, o.paymentMethod, o.paymentStatus, o.status, o.shippingAddress?.city,
    ]));
  }
  res.end();
});

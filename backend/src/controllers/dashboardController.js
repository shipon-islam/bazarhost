import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { describeRange, resolveRange } from '../utils/dateRange.js';
import { hasPermission } from '../utils/permissions.js';
import { ok } from '../utils/response.js';
import { countCustomers, orderTimeSeries, percentChange, periodTotals, statusBreakdown, topProducts } from '../services/analytics.js';
import { getSettings } from '../services/settings.js';

const card = (value, current, previous) => ({ value, change: percentChange(current, previous) });

/**
 * One call for the whole dashboard. Each section is only computed when the user may see it;
 * sections the user cannot access are returned as null.
 *
 * "change" = % change versus the previous period of equal length. For totals that aren't period based
 * (products, customers) it compares *new additions* in this period vs the previous period.
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  const tz = settings.timezone;
  const range = resolveRange(req.query, tz);
  const can = (p) => hasPermission(req.user, p);
  const threshold = settings.lowStockThreshold;
  const lowStockFilter = { status: { $ne: 'archived' }, stockQuantity: { $lte: threshold } };

  const out = { range: describeRange(range, tz), currency: settings.currency, cards: {}, charts: null, recentOrders: null, lowStock: null, newProducts: null };
  const jobs = [];

  if (can('orders:view')) {
    jobs.push((async () => {
      const [cur, prev, pending, series, status, top, recent] = await Promise.all([
        periodTotals(range.start, range.end),
        periodTotals(range.prevStart, range.prevEnd),
        Order.countDocuments({ status: 'pending' }),
        orderTimeSeries(range, tz),
        statusBreakdown(range),
        topProducts(range, { metric: 'units', limit: 5 }),
        Order.find().sort({ createdAt: -1 }).limit(8).select('-timeline -notes'),
      ]);
      out.cards.revenue = card(cur.revenue, cur.revenue, prev.revenue);
      out.cards.orders = card(cur.orders, cur.orders, prev.orders);
      out.cards.averageOrderValue = card(cur.averageOrderValue, cur.averageOrderValue, prev.averageOrderValue);
      out.cards.pendingOrders = { value: pending, change: null };
      out.charts = {
        revenue: series.map(({ date, revenue }) => ({ date, revenue })),
        orders: series.map(({ date, orders }) => ({ date, orders })),
        statusDistribution: status,
        topProducts: top,
      };
      out.recentOrders = recent;
    })());
  }

  if (can('products:view')) {
    jobs.push((async () => {
      const [total, curNew, prevNew, low, lowList, newest] = await Promise.all([
        Product.countDocuments({ status: { $ne: 'archived' } }),
        Product.countDocuments({ createdAt: { $gte: range.start, $lt: range.end } }),
        Product.countDocuments({ createdAt: { $gte: range.prevStart, $lt: range.prevEnd } }),
        Product.countDocuments(lowStockFilter),
        Product.find(lowStockFilter).sort({ stockQuantity: 1 }).limit(8).select('name slug sku images stockQuantity stockStatus'),
        Product.find().sort({ createdAt: -1 }).limit(5).select('name slug sku images price status createdAt'),
      ]);
      out.cards.products = { value: total, newInPeriod: curNew, change: percentChange(curNew, prevNew) };
      out.cards.lowStock = { value: low, threshold, change: null };
      out.lowStock = lowList;
      out.newProducts = newest;
    })());
  }

  if (can('users:view')) {
    jobs.push((async () => {
      const [total, curNew, prevNew] = await Promise.all([countCustomers(), countCustomers(range.start, range.end), countCustomers(range.prevStart, range.prevEnd)]);
      out.cards.customers = { value: total, newInPeriod: curNew, change: percentChange(curNew, prevNew) };
    })());
  }

  await Promise.all(jobs);
  ok(res, out);
});

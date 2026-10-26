import { asyncHandler } from '../utils/asyncHandler.js';
import { csvRow, startCsv } from '../utils/csv.js';
import { describeRange, resolveRange } from '../utils/dateRange.js';
import { round2 } from '../utils/query.js';
import { ok } from '../utils/response.js';
import { customerSeries, orderTimeSeries, percentChange, periodTotals, statusBreakdown, topProducts } from '../services/analytics.js';
import { getSettings } from '../services/settings.js';

async function context(req) {
  const settings = await getSettings();
  const range = resolveRange(req.query, settings.timezone);
  return { settings, range, tz: settings.timezone, meta: { ...describeRange(range, settings.timezone), currency: settings.currency } };
}

export const revenue = asyncHandler(async (req, res) => {
  const { range, tz, meta } = await context(req);
  const [series, cur, prev] = await Promise.all([orderTimeSeries(range, tz), periodTotals(range.start, range.end), periodTotals(range.prevStart, range.prevEnd)]);
  ok(res, {
    ...meta,
    summary: { revenue: cur.revenue, previousRevenue: prev.revenue, change: percentChange(cur.revenue, prev.revenue), averageOrderValue: cur.averageOrderValue },
    series: series.map(({ date, revenue: r }) => ({ date, revenue: r })),
  });
});

export const orders = asyncHandler(async (req, res) => {
  const { range, tz, meta } = await context(req);
  const [series, cur, prev, byStatus] = await Promise.all([
    orderTimeSeries(range, tz), periodTotals(range.start, range.end), periodTotals(range.prevStart, range.prevEnd), statusBreakdown(range),
  ]);
  ok(res, {
    ...meta,
    summary: { orders: cur.orders, previousOrders: prev.orders, change: percentChange(cur.orders, prev.orders) },
    series: series.map(({ date, orders: n }) => ({ date, orders: n })),
    byStatus,
  });
});

export const products = asyncHandler(async (req, res) => {
  const { range, meta } = await context(req);
  ok(res, { ...meta, metric: req.query.metric, products: await topProducts(range, { metric: req.query.metric, limit: req.query.limit }) });
});

export const customers = asyncHandler(async (req, res) => {
  const { range, tz, meta } = await context(req);
  const series = await customerSeries(range, tz);
  ok(res, { ...meta, summary: { newCustomers: series.reduce((s, r) => s + r.customers, 0) }, series });
});

export const exportReport = asyncHandler(async (req, res) => {
  const { range, tz } = await context(req);
  const { type } = req.params;
  startCsv(res, `report-${type}-${new Date().toISOString().slice(0, 10)}.csv`);
  if (type === 'revenue') {
    res.write(csvRow(['Date', 'Revenue', 'Orders']));
    for (const r of await orderTimeSeries(range, tz)) res.write(csvRow([r.date, round2(r.revenue), r.orders]));
  } else if (type === 'products') {
    res.write(csvRow(['Product', 'SKU', 'Units sold', 'Revenue']));
    for (const p of await topProducts(range, { metric: req.query.metric ?? 'units', limit: 100 })) res.write(csvRow([p.name, p.sku, p.units, p.revenue]));
  } else {
    res.write(csvRow(['Date', 'New customers']));
    for (const r of await customerSeries(range, tz)) res.write(csvRow([r.date, r.customers]));
  }
  res.end();
});

import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Stock changes use atomic conditional updates (works on standalone MongoDB, no transactions needed).
 * Lines: [{ productId, quantity, name }]
 */
export async function syncStockStatus(ids) {
  if (!ids.length) return;
  await Product.bulkWrite([
    { updateMany: { filter: { _id: { $in: ids }, stockQuantity: { $lte: 0 }, stockStatus: 'in_stock' }, update: { $set: { stockStatus: 'out_of_stock' } } } },
    { updateMany: { filter: { _id: { $in: ids }, stockQuantity: { $gt: 0 }, stockStatus: 'out_of_stock' }, update: { $set: { stockStatus: 'in_stock' } } } },
  ]);
}

export async function restoreStock(lines) {
  if (!lines.length) return;
  await Product.bulkWrite(lines.map((l) => ({ updateOne: { filter: { _id: l.productId }, update: { $inc: { stockQuantity: l.quantity } } } })));
  await syncStockStatus(lines.map((l) => l.productId));
}

export async function reserveStock(lines) {
  const done = [];
  try {
    for (const l of lines) {
      // eslint-disable-next-line no-await-in-loop
      const r = await Product.updateOne(
        { _id: l.productId, status: 'active', stockStatus: { $ne: 'out_of_stock' }, stockQuantity: { $gte: l.quantity } },
        { $inc: { stockQuantity: -l.quantity } },
      );
      if (r.modifiedCount !== 1) throw new ApiError(409, `Insufficient stock for "${l.name}"`, { code: 'INSUFFICIENT_STOCK' });
      done.push(l);
    }
  } catch (err) {
    await restoreStock(done);
    throw err;
  }
  await syncStockStatus(lines.map((l) => l.productId));
}

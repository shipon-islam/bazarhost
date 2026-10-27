import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { audit } from '../services/audit.js';
import { descendantCategoryIds } from '../services/categoryTree.js';
import { getSettings } from '../services/settings.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { andFilter, buildSort, paginate, searchCondition } from '../utils/query.js';
import { ok } from '../utils/response.js';
import { uniqueSlug } from '../utils/slug.js';

const SORTABLE = ['name', 'price', 'stockQuantity', 'createdAt', 'status', 'sku'];
const CATEGORY_POPULATE = { path: 'category', select: 'name slug' };
const fieldError = (field, message) => ({ details: [{ field, message }] });

async function assertCategory(id) {
  if (!(await Category.exists({ _id: id }))) throw new ApiError(400, 'Category not found', fieldError('category', 'Category not found'));
}

async function assertSlugFree(slug, excludeId) {
  if (await Product.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    throw new ApiError(409, 'This slug is already in use', fieldError('slug', 'Slug already in use'));
  }
}

export const list = asyncHandler(async (req, res) => {
  const q = req.query;
  const conds = [searchCondition(q.search, ['name', 'sku', 'slug'])];
  if (q.category) conds.push({ category: { $in: await descendantCategoryIds(q.category) } });
  if (q.status) conds.push({ status: q.status });
  if (q.stockStatus) conds.push({ stockStatus: q.stockStatus });
  if (q.featured !== undefined) conds.push({ featured: q.featured });
  if (q.lowStock) {
    const { lowStockThreshold } = await getSettings();
    conds.push({ stockQuantity: { $lte: lowStockThreshold }, status: { $ne: 'archived' } });
  }
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    conds.push({ price: { ...(q.minPrice !== undefined && { $gte: q.minPrice }), ...(q.maxPrice !== undefined && { $lte: q.maxPrice }) } });
  }
  const { items, meta } = await paginate(Product, andFilter(conds), {
    page: q.page, limit: q.limit, sort: buildSort(q.sortBy, q.order, SORTABLE), populate: CATEGORY_POPULATE,
  });
  ok(res, items, meta);
});

export const getOne = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(CATEGORY_POPULATE);
  if (!product) throw new ApiError(404, 'Product not found', { code: 'NOT_FOUND' });
  ok(res, product);
});

export const create = asyncHandler(async (req, res) => {
  const body = req.body;
  await assertCategory(body.category);
  let slug = body.slug;
  if (slug) await assertSlugFree(slug);
  else slug = await uniqueSlug(Product, body.name);
  const product = await Product.create({ ...body, slug, createdBy: req.user._id });
  await product.populate(CATEGORY_POPULATE);
  audit(req, 'product.created', 'product', product._id, { name: product.name });
  ok(res, product, undefined, 201);
});

export const update = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found', { code: 'NOT_FOUND' });
  const body = req.body;
  if (body.category && String(body.category) !== String(product.category)) await assertCategory(body.category);
  if (body.slug && body.slug !== product.slug) await assertSlugFree(body.slug, product._id);
  product.set(body); // loaded-doc save() so model validators (e.g. sale < price) always run
  await product.save();
  await product.populate(CATEGORY_POPULATE);
  audit(req, 'product.updated', 'product', product._id, { fields: Object.keys(body) });
  ok(res, product);
});

export const remove = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found', { code: 'NOT_FOUND' });
  audit(req, 'product.deleted', 'product', product._id, { name: product.name });
  ok(res, { message: 'Product deleted' });
});

export const bulk = asyncHandler(async (req, res) => {
  const { action, ids } = req.body;
  const r = action === 'delete'
    ? await Product.deleteMany({ _id: { $in: ids } })
    : await Product.updateMany({ _id: { $in: ids } }, { $set: { status: req.body.status } });
  audit(req, `product.bulk_${action}`, 'product', undefined, { ids, status: req.body.status });
  ok(res, { affected: r.deletedCount ?? r.modifiedCount ?? 0 });
});

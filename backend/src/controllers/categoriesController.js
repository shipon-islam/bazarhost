import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { audit } from "../services/audit.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { removeUploadedFile } from "../utils/deleteImages.js";
import { moveToUploadFolder } from "../utils/moveToUploadFolder.js";
import {
  andFilter,
  buildSort,
  paginate,
  searchCondition,
} from "../utils/query.js";
import { ok } from "../utils/response.js";
import { uniqueSlug } from "../utils/slug.js";

const SORTABLE = ["name", "createdAt", "status", "slug"];
const fieldError = (field, message) => ({ details: [{ field, message }] });

async function assertSlugFree(slug, excludeId) {
  if (
    await Category.exists({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    throw new ApiError(
      409,
      "This slug is already in use",
      fieldError("slug", "Slug already in use"),
    );
  }
}

/** Parent must exist and must not be the category itself or any of its descendants. */
async function assertValidParent(id, parentId) {
  if (!parentId) return;
  if (id && String(parentId) === String(id))
    throw new ApiError(
      400,
      "A category cannot be its own parent",
      fieldError("parent", "Invalid parent"),
    );
  let cur = await Category.findById(parentId).select("parent");
  if (!cur)
    throw new ApiError(
      400,
      "Parent category not found",
      fieldError("parent", "Parent not found"),
    );
  const seen = new Set();
  while (cur?.parent && !seen.has(String(cur.parent))) {
    if (id && String(cur.parent) === String(id))
      throw new ApiError(
        400,
        "This would create a circular category hierarchy",
        {
          code: "CATEGORY_CYCLE",
          ...fieldError("parent", "Circular hierarchy"),
        },
      );
    seen.add(String(cur.parent));
    // eslint-disable-next-line no-await-in-loop
    cur = await Category.findById(cur.parent).select("parent");
  }
}

async function usage(id) {
  const [productCount, childCount] = await Promise.all([
    Product.countDocuments({ category: id }),
    Category.countDocuments({ parent: id }),
  ]);
  return { productCount, childCount };
}

async function deleteIfUnused(req, category) {
  const { productCount, childCount } = await usage(category._id);
  if (productCount > 0)
    throw new ApiError(
      409,
      `${productCount} product(s) use this category. Move or delete them first.`,
      {
        code: "CATEGORY_HAS_PRODUCTS",
        details: [{ message: String(productCount) }],
      },
    );
  if (childCount > 0)
    throw new ApiError(
      409,
      `This category has ${childCount} sub-categor${childCount > 1 ? "ies" : "y"}. Move or delete them first.`,
      { code: "CATEGORY_HAS_CHILDREN" },
    );
  await category.deleteOne();
  audit(req, "category.deleted", "category", category._id, {
    name: category.name,
  });
}

export const list = asyncHandler(async (req, res) => {
  const q = req.query;
  const conds = [searchCondition(q.search, ["name", "slug"])];
  if (q.status) conds.push({ status: q.status });
  if (q.parent) conds.push({ parent: q.parent === "root" ? null : q.parent });
  const { items, meta } = await paginate(Category, andFilter(conds), {
    page: q.page,
    limit: q.limit,
    sort: buildSort(q.sortBy, q.order, SORTABLE),
    populate: { path: "parent", select: "name slug" },
  });
  const counts = await Product.aggregate([
    { $match: { category: { $in: items.map((c) => c._id) } } },
    { $group: { _id: "$category", n: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.n]));
  ok(
    res,
    items.map((c) => ({
      ...c.toJSON(),
      productCount: map.get(String(c._id)) ?? 0,
    })),
    meta,
  );
});

/** Lightweight list for dropdowns (product form, parent picker). */
export const options = asyncHandler(async (_req, res) => {
  ok(
    res,
    await Category.find()
      .sort({ name: 1 })
      .limit(2000)
      .select("name slug parent status"),
  );
});

export const getOne = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate(
    "parent",
    "name slug",
  );
  if (!category)
    throw new ApiError(404, "Category not found", { code: "NOT_FOUND" });
  ok(res, { ...category.toJSON(), ...(await usage(category._id)) });
});

export const create = asyncHandler(async (req, res) => {
  const body = req.body;
  await assertValidParent(null, body.parent);
  let slug = body.slug;
  if (slug) await assertSlugFree(slug);
  else slug = await uniqueSlug(Category, body.name);
  const image = await moveToUploadFolder(body?.image);
  const category = await Category.create({ ...body, image, slug });

  audit(req, "category.created", "category", category._id, {
    name: category.name,
  });
  ok(res, category, undefined, 201);
});

export const update = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category)
    throw new ApiError(404, "Category not found", { code: "NOT_FOUND" });
  const body = req.body;
  if (body.parent !== undefined)
    await assertValidParent(category._id, body.parent);
  if (body.slug && body.slug !== category.slug)
    await assertSlugFree(body.slug, category._id);
  category.set(body);
  //store previous uploaded image
  const previousImage = category?.image;
  let newImage;
  //updated image upload system
  if (body?.image) {
    newImage = await moveToUploadFolder(body.image);
    category.set("image", newImage);
  }
  // Save the database
  await category.save();
  //delete existing image
  if (previousImage && newImage && previousImage !== newImage) {
    await removeUploadedFile(category?.image);
  }
  
  audit(req, "category.updated", "category", category._id, {
    fields: Object.keys(body),
  });
  ok(res, category);
});

export const remove = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category)
    throw new ApiError(404, "Category not found", { code: "NOT_FOUND" });
  await deleteIfUnused(req, category);
  await removeUploadedFile(category?.image);
  ok(res, { message: "Category deleted" });
});

export const bulk = asyncHandler(async (req, res) => {
  const { action, ids } = req.body;
  if (action === "status") {
    const r = await Category.updateMany(
      { _id: { $in: ids } },
      { $set: { status: req.body.status } },
    );
    return ok(res, { affected: r.modifiedCount });
  }
  const results = [];
  for (const id of ids) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const c = await Category.findById(id);
      if (!c) throw new ApiError(404, "Category not found");
      // eslint-disable-next-line no-await-in-loop
      await deleteIfUnused(req, c);
      await removeUploadedFile(c?.image);
      results.push({ id, ok: true });
    } catch (err) {
      results.push({ id, ok: false, error: err.message });
    }
  }
  return ok(res, {
    succeeded: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
});

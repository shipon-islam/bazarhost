export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Case-insensitive "contains" search across several fields. Returns a condition or null. */
export function searchCondition(search, fields) {
  if (!search) return null;
  const rx = new RegExp(escapeRegex(search), 'i');
  return { $or: fields.map((f) => ({ [f]: rx })) };
}

/** Combine conditions with $and (avoids clobbering multiple $or clauses). */
export const andFilter = (conds) => {
  const list = conds.filter(Boolean);
  return list.length ? { $and: list } : {};
};

export function buildSort(sortBy, order, allowed, fallback = 'createdAt') {
  const field = allowed.includes(sortBy) ? sortBy : fallback;
  return { [field]: order === 'asc' ? 1 : -1, _id: -1 };
}

export function pageMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

export async function paginate(Model, filter, { page, limit, sort, select, populate }) {
  let q = Model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
  if (select) q = q.select(select);
  if (populate) q = q.populate(populate);
  const [items, total] = await Promise.all([q, Model.countDocuments(filter)]);
  return { items, meta: pageMeta(page, limit, total) };
}

export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

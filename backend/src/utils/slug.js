import crypto from 'node:crypto';

export function slugify(input = '') {
  return String(input)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

/** Generates a slug that is unique within Model (appends -2, -3, ...). */
export async function uniqueSlug(Model, base, excludeId) {
  const root = slugify(base) || `item-${crypto.randomBytes(3).toString('hex')}`;
  let candidate = root;
  let i = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Model.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    i += 1;
    candidate = `${root}-${i}`;
  }
  return candidate;
}

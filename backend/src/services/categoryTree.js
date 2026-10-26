import { Category } from '../models/Category.js';

/** The category id plus all of its descendants (so filtering by a parent includes sub-categories). */
export async function descendantCategoryIds(rootId) {
  const ids = [String(rootId)];
  let frontier = [rootId];
  while (frontier.length) {
    // eslint-disable-next-line no-await-in-loop
    const children = await Category.find({ parent: { $in: frontier } }).distinct('_id');
    frontier = children.filter((c) => !ids.includes(String(c)));
    ids.push(...frontier.map(String));
  }
  return ids;
}

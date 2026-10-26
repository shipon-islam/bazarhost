import { Setting } from '../models/Setting.js';

/** Returns the singleton store settings document, creating it with defaults on first use. */
export async function getSettings() {
  let s = await Setting.findOne({ key: 'store' });
  if (!s) {
    try {
      s = await Setting.create({ key: 'store' });
    } catch {
      s = await Setting.findOne({ key: 'store' }); // lost a creation race
    }
  }
  return s;
}

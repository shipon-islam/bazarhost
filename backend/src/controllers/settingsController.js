import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { audit } from '../services/audit.js';
import { getSettings } from '../services/settings.js';

export const get = asyncHandler(async (_req, res) => ok(res, await getSettings()));

export const update = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  const { notifications, ...rest } = req.body;
  settings.set(rest);
  for (const [k, v] of Object.entries(notifications ?? {})) settings.set(`notifications.${k}`, v);
  await settings.save();
  audit(req, 'settings.updated', 'settings', settings._id, { fields: Object.keys(req.body) });
  ok(res, settings);
});

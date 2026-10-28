import { audit } from '../services/audit.js';
import { getSettings } from '../services/settings.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { moveToUploadFolder } from "../utils/moveToUploadFolder.js";
import { ok } from '../utils/response.js';
export const get = asyncHandler(async (_req, res) => ok(res, await getSettings()));

export const update = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  const { notifications, ...rest } = req.body;
  settings.set(rest);

  
  const previousLogo = settings.avatar;
  let newLogo;

  if (body?.logo) {
    newLogo = await moveToUploadFolder(body.logo);
    settings.set("logo", newLogo);
  }
  
  for (const [k, v] of Object.entries(notifications ?? {})) settings.set(`notifications.${k}`, v);
  await settings.save();

  // Delete the previous avatar after saving successfully
    if (previousLogo && newLogo && previousLogo !== newLogo) {
      await removeUploadedFile(previousLogo);
    }
    
  audit(req, 'settings.updated', 'settings', settings._id, { fields: Object.keys(req.body) });
  ok(res, settings);
});

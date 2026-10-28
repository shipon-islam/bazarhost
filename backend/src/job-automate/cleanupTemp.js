import cron from 'node-cron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { tempPath } from '../middleware/upload.js';

const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function startCleanupJob() {
  return cron.schedule('0 * * * *', async () => {
    try {
      for (const file of await fs.readdir(tempPath)) {
        const p = path.join(tempPath, file);
        const { mtimeMs } = await fs.stat(p);
        if (Date.now() - mtimeMs > MAX_AGE_MS) await fs.unlink(p).catch(() => {});
      }
    } catch (err) {
      console.error('Temp cleanup failed:', err.message);
    }
  });
}
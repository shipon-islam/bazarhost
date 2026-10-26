import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { sendInviteEmail } from './mailer.js';

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const INVITE_TTL_MS = 72 * 3600 * 1000;

/** Creates a single-use token (stored hashed), emails the link and returns it. */
export async function issueInvite(user) {
  const raw = crypto.randomBytes(32).toString('base64url');
  user.inviteTokenHash = sha256(raw);
  user.inviteExpiresAt = new Date(Date.now() + INVITE_TTL_MS);
  await user.save();
  const token = `${user._id}.${raw}`;
  const link = `${env.clientUrls[0]}/accept-invite?token=${encodeURIComponent(token)}`;
  await sendInviteEmail(user, link);
  return { link, expiresAt: user.inviteExpiresAt };
}

export function tokenMatches(rawSecret, storedHash) {
  if (!storedHash) return false;
  const a = Buffer.from(sha256(rawSecret));
  const b = Buffer.from(storedHash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

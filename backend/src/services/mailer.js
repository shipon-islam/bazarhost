import { env } from '../config/env.js';

/**
 * TODO: replace with a real provider (nodemailer / SES / Resend / SendGrid).
 * Until then, invite links are only printed in development.
 */
export async function sendInviteEmail(user, link) {
  if (!env.isProd) console.log(`[mailer] invite for ${user.email}: ${link}`);
  else console.warn(`[mailer] no email provider configured – invite for ${user.email} was NOT delivered`);
}

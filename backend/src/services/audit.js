import { AuditLog } from '../models/AuditLog.js';

/** Fire-and-forget audit trail entry. Never blocks or fails the request. */
export function audit(req, action, entity, entityId, meta) {
  AuditLog.create({ actor: req.user?._id, action, entity, entityId, meta, ip: req.ip }).catch((err) =>
    console.error('Audit log failed:', err.message),
  );
}

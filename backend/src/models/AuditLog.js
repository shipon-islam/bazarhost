import mongoose, { Schema } from 'mongoose';
import { cleanJSON } from './shared.js';

const auditSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true }, // e.g. "user.status_changed"
    entity: { type: String, required: true }, // e.g. "user", "order"
    entityId: { type: Schema.Types.ObjectId },
    meta: Schema.Types.Mixed,
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false }, toJSON: cleanJSON() },
);

auditSchema.index({ entity: 1, entityId: 1, createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditSchema);

import mongoose, { Schema } from 'mongoose';
import { ALL_PERMISSIONS } from '../config/constants.js';
import { cleanJSON } from './shared.js';

const roleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, lowercase: true, immutable: true },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    // "staff" roles can sign in to the admin panel; "customer" roles are storefront accounts.
    type: { type: String, enum: ['staff', 'customer'], default: 'staff', immutable: true },
    // Flat list such as "products:view", "orders:edit" (see config/constants.js)
    permissions: { type: [{ type: String, enum: ALL_PERMISSIONS }], default: [] },
    isSystem: { type: Boolean, default: false, immutable: true },
    isSuperAdmin: { type: Boolean, default: false, immutable: true },
  },
  { timestamps: true, toJSON: cleanJSON() },
);

export const Role = mongoose.model('Role', roleSchema);

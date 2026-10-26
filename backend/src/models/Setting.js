import mongoose, { Schema } from 'mongoose';
import { cleanJSON } from './shared.js';

const settingSchema = new Schema(
  {
    key: { type: String, default: 'store', unique: true, immutable: true },
    storeName: { type: String, default: 'BazarHost', trim: true, maxlength: 120 },
    logo: { type: String, trim: true, maxlength: 500 },
    contactEmail: { type: String, trim: true, lowercase: true, maxlength: 254 },
    contactPhone: { type: String, trim: true, maxlength: 30 },
    timezone: { type: String, default: 'Asia/Dhaka' },
    currency: { type: String, default: 'BDT', uppercase: true, minlength: 3, maxlength: 3 },
    language: { type: String, default: 'en' },
    weightUnit: { type: String, enum: ['kg', 'g', 'lb', 'oz'], default: 'kg' },
    defaultOrderStatus: { type: String, enum: ['pending', 'processing'], default: 'pending' },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    notifications: {
      newOrderEmail: { type: Boolean, default: true },
      newOrderSms: { type: Boolean, default: false },
      lowStockEmail: { type: Boolean, default: true },
      notificationEmail: { type: String, trim: true, lowercase: true, maxlength: 254 },
    },
  },
  { timestamps: true, toJSON: cleanJSON(['key']) },
);

export const Setting = mongoose.model('Setting', settingSchema);

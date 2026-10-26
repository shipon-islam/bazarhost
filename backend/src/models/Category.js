import mongoose, { Schema } from 'mongoose';
import { CATEGORY_STATUSES } from '../config/constants.js';
import { cleanJSON } from './shared.js';

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    image: { type: String, trim: true, maxlength: 500 },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    status: { type: String, enum: CATEGORY_STATUSES, default: 'active', index: true },
    seoTitle: { type: String, trim: true, maxlength: 120 },
    seoDescription: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true, toJSON: cleanJSON() },
);

export const Category = mongoose.model('Category', categorySchema);

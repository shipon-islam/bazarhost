import mongoose, { Schema } from 'mongoose';
import { PRODUCT_STATUSES, STOCK_STATUSES } from '../config/constants.js';
import { cleanJSON } from './shared.js';

const imageSchema = new Schema(
  { url: { type: String, required: true, trim: true, maxlength: 500 }, alt: { type: String, trim: true, maxlength: 200 } },
  { _id: false },
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, trim: true, maxlength: 64, default: undefined },
    shortDescription: { type: String, trim: true, maxlength: 500, default: '' },
    description: { type: String, maxlength: 20000, default: '' }, // may contain HTML: sanitise on render
    images: { type: [imageSchema], default: [], validate: [(v) => v.length <= 10, 'Max 10 images'] }, // first = primary
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: {
      type: Number,
      min: 0,
      default: null,
      validate: {
        validator(v) { return v === null || v === undefined || v < this.price; },
        message: 'Sale price must be lower than the regular price',
      },
    },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    stockStatus: { type: String, enum: STOCK_STATUSES, required: true },
    status: { type: String, enum: PRODUCT_STATUSES, default: 'draft', index: true },
    featured: { type: Boolean, default: false },
    seoTitle: { type: String, trim: true, maxlength: 120 },
    seoDescription: { type: String, trim: true, maxlength: 300 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: cleanJSON() },
);

// SKU is unique only when it is an actual string (so many products may have no SKU)
productSchema.index({ sku: 1 }, { unique: true, partialFilterExpression: { sku: { $type: 'string' } } });
productSchema.index({ createdAt: -1 });
productSchema.index({ stockQuantity: 1 });

// Derive stock status from quantity unless the admin set it explicitly (or it's on backorder).
productSchema.pre('validate', function deriveStock(next) {
  if (!this.stockStatus || (this.isModified('stockQuantity') && !this.isModified('stockStatus') && this.stockStatus !== 'on_backorder')) {
    this.stockStatus = this.stockQuantity > 0 ? 'in_stock' : 'out_of_stock';
  }
  next();
});

export const Product = mongoose.model('Product', productSchema);

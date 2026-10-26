import mongoose, { Schema } from 'mongoose';
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../config/constants.js';
import { cleanJSON, addressSchema } from './shared.js';

// Items snapshot the product at purchase time so history survives edits/deletes.
const itemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    sku: String,
    image: String,
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const actorSchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User' }, name: String }, { _id: false });

const timelineSchema = new Schema(
  {
    type: { type: String, enum: ['status', 'payment', 'system'], default: 'status' },
    status: String,
    note: { type: String, maxlength: 500 },
    by: actorSchema,
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const noteSchema = new Schema({ text: { type: String, required: true, maxlength: 1000 }, by: actorSchema, at: { type: Date, default: Date.now } });

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    customerSnapshot: {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      phone: String,
    },
    items: { type: [itemSchema], validate: [(v) => v.length > 0, 'Order needs at least one item'] },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'BDT' },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'pending', index: true },
    transactionId: { type: String, trim: true, maxlength: 100 },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    billingAddress: addressSchema,
    shippingAddress: addressSchema,
    timeline: { type: [timelineSchema], default: [] },
    notes: { type: [noteSchema], default: [] }, // internal admin notes
    isArchived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, toJSON: cleanJSON() },
);

orderSchema.virtual('itemsCount').get(function itemsCount() {
  return (this.items ?? []).reduce((n, i) => n + i.quantity, 0);
});

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ customer: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);

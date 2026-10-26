import { Schema } from 'mongoose';

/** Common toJSON options: expose `id`, hide `_id`, `__v` and any sensitive fields. */
export const cleanJSON = (hidden = []) => ({
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    delete ret._id;
    for (const k of hidden) delete ret[k];
    return ret;
  },
});

export const addressSchema = new Schema(
  {
    fullName: { type: String, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 30 },
    line1: { type: String, trim: true, maxlength: 200 },
    line2: { type: String, trim: true, maxlength: 200 },
    city: { type: String, trim: true, maxlength: 100 },
    state: { type: String, trim: true, maxlength: 100 },
    postalCode: { type: String, trim: true, maxlength: 20 },
    country: { type: String, trim: true, maxlength: 100 },
  },
  { _id: false },
);

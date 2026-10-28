import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";
import { USER_STATUSES } from "../config/constants.js";
import { addressSchema, cleanJSON } from "./shared.js";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    phone: { type: String, trim: true, maxlength: 30 },
    avatar: { type: String, trim: true, maxlength: 500 },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: USER_STATUSES,
      default: "active",
      index: true,
    },
    address: addressSchema,
    passwordSet: { type: Boolean, default: false }, // false => invite still pending
    passwordHash: { type: String, select: false },
    inviteTokenHash: { type: String, select: false },
    inviteExpiresAt: { type: Date, select: false },
    // Incrementing this invalidates every JWT issued earlier (password change, disable, role change)
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: cleanJSON([
      "passwordHash",
      "inviteTokenHash",
      "inviteExpiresAt",
      "tokenVersion",
    ]),
  },
);

userSchema.index({ createdAt: -1 });

userSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await bcrypt.hash(plain, 12);
  this.passwordSet = true;
  this.tokenVersion += 1;
  this.inviteTokenHash = undefined;
  this.inviteExpiresAt = undefined;
};

export const User = mongoose.model("User", userSchema);

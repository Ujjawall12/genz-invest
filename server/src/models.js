import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const brandSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  company: String,
  ticker: String,
  color: String,
  category: String,
  price: Number,
  r1y: Number, // illustrative 1-year return, %
  risk: { type: String, enum: ['Low', 'Medium', 'High'] },
  about: String,
  why: String
}, { versionKey: false });

const userSchema = new Schema({
  name: { type: String, required: true },
  // Mock UPI spends for the last 30 days (real spend tracking is out of scope)
  spends: [{ _id: false, brand: String, amount: Number, count: Number, unit: String }],
  contacts: [{ _id: false, key: String, name: String, color: String }]
}, { versionKey: false });

const basketSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  brands: { type: [String], required: true },
  amount: { type: Number, required: true, min: 100 },
  mode: { type: String, enum: ['sip', 'once'], required: true },
  core: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });

const memberSchema = new Schema({
  key: String,
  name: String,
  color: String,
  isMe: { type: Boolean, default: false },
  amount: { type: Number, default: 0, min: 0 }
}, { _id: false });

const squadSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 40 },
  emoji: String,
  target: { type: Number, required: true, min: 500 },
  months: { type: Number, required: true, min: 1, max: 60 },
  members: [memberSchema],
  feed: [{ _id: false, text: String, at: { type: Date, default: Date.now } }]
}, { timestamps: true, versionKey: false });

export const Brand = model('Brand', brandSchema);
export const User = model('User', userSchema);
export const Basket = model('Basket', basketSchema);
export const Squad = model('Squad', squadSchema);

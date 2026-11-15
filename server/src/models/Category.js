import mongoose from 'mongoose';

export const CATEGORY_TYPES = ['expense', 'income'];

const categorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    type: { type: String, enum: CATEGORY_TYPES, required: true },
    color: { type: String, default: '#64748b' },
    icon: { type: String, default: '🏷️', maxlength: 8 },
  },
  { timestamps: true }
);

categorySchema.index({ userId: 1, name: 1 }, { unique: true });

export const Category = mongoose.model('Category', categorySchema);

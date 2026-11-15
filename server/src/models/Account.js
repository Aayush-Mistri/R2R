import mongoose from 'mongoose';

export const ACCOUNT_TYPES = ['cash', 'bank', 'upi', 'credit_card', 'wallet', 'other'];

const accountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    type: { type: String, enum: ACCOUNT_TYPES, default: 'bank' },
    openingBalance: { type: Number, default: 0 },
    color: { type: String, default: '#64748b' },
  },
  { timestamps: true }
);

accountSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Account = mongoose.model('Account', accountSchema);

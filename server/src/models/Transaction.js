import mongoose from 'mongoose';

export const TRANSACTION_TYPES = ['expense', 'income'];

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    note: { type: String, default: '', trim: true, maxlength: 200 },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1, createdAt: -1 });
transactionSchema.index({ userId: 1, accountId: 1 });
transactionSchema.index({ userId: 1, categoryId: 1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);

import { Account } from '../models/Account.js';
import { Category } from '../models/Category.js';

const DEFAULT_ACCOUNTS = [
  { name: 'Cash', type: 'cash', color: '#10b981' },
  { name: 'UPI', type: 'upi', color: '#6366f1' },
  { name: 'Credit Card', type: 'credit_card', color: '#ef4444' },
];

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', type: 'expense', color: '#f97316', icon: '🍛' },
  { name: 'Groceries', type: 'expense', color: '#84cc16', icon: '🛒' },
  { name: 'Transport', type: 'expense', color: '#0ea5e9', icon: '🚕' },
  { name: 'Rent', type: 'expense', color: '#8b5cf6', icon: '🏠' },
  { name: 'Bills & Utilities', type: 'expense', color: '#eab308', icon: '⚡' },
  { name: 'Shopping', type: 'expense', color: '#ec4899', icon: '🛍️' },
  { name: 'Health', type: 'expense', color: '#ef4444', icon: '🩺' },
  { name: 'Entertainment', type: 'expense', color: '#6366f1', icon: '🎬' },
  { name: 'Travel', type: 'expense', color: '#14b8a6', icon: '✈️' },
  { name: 'Education', type: 'expense', color: '#64748b', icon: '📚' },
  { name: 'Other', type: 'expense', color: '#94a3b8', icon: '🏷️' },
  { name: 'Salary', type: 'income', color: '#10b981', icon: '💼' },
  { name: 'Freelance', type: 'income', color: '#22c55e', icon: '🧑‍💻' },
  { name: 'Interest', type: 'income', color: '#06b6d4', icon: '🏦' },
  { name: 'Other Income', type: 'income', color: '#64748b', icon: '➕' },
];

export async function seedDefaults(userId) {
  await Promise.all([
    Account.insertMany(DEFAULT_ACCOUNTS.map((account) => ({ ...account, userId }))),
    Category.insertMany(DEFAULT_CATEGORIES.map((category) => ({ ...category, userId }))),
  ]);
}

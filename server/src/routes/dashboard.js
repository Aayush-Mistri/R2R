import { Router } from 'express';
import mongoose from 'mongoose';
import { Account } from '../models/Account.js';
import { Category } from '../models/Category.js';
import { Transaction } from '../models/Transaction.js';
import { asyncHandler, currentMonth, lastNMonths, monthRange, round2 } from '../utils/http.js';
import { serializeTransaction, TXN_POPULATE } from '../utils/serialize.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(req.query.month || '')
      ? req.query.month
      : currentMonth();
    const { start, end } = monthRange(month);
    const userId = new mongoose.Types.ObjectId(req.userId);

    const months = lastNMonths(month, 6);
    const trendStart = `${months[0]}-01`;

    const [accounts, accountSums, monthTotals, categoryTotals, trendRows, recent] =
      await Promise.all([
        Account.find({ userId: req.userId }).sort({ createdAt: 1 }),
        Transaction.aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: { accountId: '$accountId', type: '$type' },
              total: { $sum: '$amount' },
              count: { $sum: 1 },
            },
          },
        ]),
        Transaction.aggregate([
          { $match: { userId, date: { $gte: start, $lt: end } } },
          { $group: { _id: '$type', total: { $sum: '$amount' } } },
        ]),
        Transaction.aggregate([
          {
            $match: {
              userId,
              type: 'expense',
              date: { $gte: start, $lt: end },
            },
          },
          { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
          { $sort: { total: -1 } },
        ]),
        Transaction.aggregate([
          { $match: { userId, date: { $gte: trendStart, $lt: end } } },
          {
            $group: {
              _id: {
                month: { $substr: ['$date', 0, 7] },
                type: '$type',
              },
              total: { $sum: '$amount' },
            },
          },
        ]),
        Transaction.find({ userId: req.userId })
          .sort({ date: -1, createdAt: -1 })
          .limit(8)
          .populate(TXN_POPULATE),
      ]);

    const accountTotals = new Map();
    for (const row of accountSums) {
      const key = String(row._id.accountId);
      const entry = accountTotals.get(key) || { income: 0, expense: 0, count: 0 };
      if (row._id.type === 'income') entry.income += row.total;
      else entry.expense += row.total;
      entry.count += row.count;
      accountTotals.set(key, entry);
    }

    const accountsOut = accounts.map((account) => {
      const entry = accountTotals.get(String(account._id)) || {
        income: 0,
        expense: 0,
        count: 0,
      };
      return {
        id: String(account._id),
        name: account.name,
        type: account.type,
        color: account.color,
        balance: round2(account.openingBalance + entry.income - entry.expense),
        txnCount: entry.count,
      };
    });

    const totals = { income: 0, expense: 0 };
    for (const row of monthTotals) totals[row._id] = round2(row.total);

    const categories = await Category.find({
      _id: { $in: categoryTotals.map((row) => row._id) },
      userId,
    });
    const categoryMap = new Map(categories.map((c) => [String(c._id), c]));

    const byCategory = categoryTotals.map((row) => {
      const category = categoryMap.get(String(row._id));
      return {
        id: String(row._id),
        name: category?.name || 'Unknown',
        color: category?.color || '#94a3b8',
        icon: category?.icon || '🏷️',
        total: round2(row.total),
      };
    });

    const trendMap = new Map();
    for (const row of trendRows) {
      const entry = trendMap.get(row._id.month) || { income: 0, expense: 0 };
      entry[row._id.type] = round2(row.total);
      trendMap.set(row._id.month, entry);
    }
    const trend = months.map((m) => ({
      month: m,
      income: trendMap.get(m)?.income || 0,
      expense: trendMap.get(m)?.expense || 0,
    }));

    const totalBalance = round2(
      accountsOut.reduce((sum, account) => sum + account.balance, 0)
    );

    res.json({
      month,
      totals: { ...totals, net: round2(totals.income - totals.expense) },
      totalBalance,
      byCategory,
      trend,
      recent: recent.map(serializeTransaction),
      accounts: accountsOut,
    });
  })
);

export default router;

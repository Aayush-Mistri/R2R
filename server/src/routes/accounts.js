import { Router } from 'express';
import mongoose from 'mongoose';
import { Account } from '../models/Account.js';
import { Transaction } from '../models/Transaction.js';
import { asyncHandler, round2 } from '../utils/http.js';
import { accountSchema, accountPatchSchema, parse } from '../utils/schemas.js';

const router = Router();

async function withBalances(userId) {
  const accounts = await Account.find({ userId }).sort({ createdAt: 1 });
  const sums = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: { accountId: '$accountId', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const byAccount = new Map();
  for (const row of sums) {
    const key = String(row._id.accountId);
    const entry = byAccount.get(key) || { income: 0, expense: 0, count: 0 };
    if (row._id.type === 'income') entry.income += row.total;
    else entry.expense += row.total;
    entry.count += row.count;
    byAccount.set(key, entry);
  }

  return accounts.map((account) => {
    const entry = byAccount.get(String(account._id)) || { income: 0, expense: 0, count: 0 };
    return {
      id: String(account._id),
      name: account.name,
      type: account.type,
      color: account.color,
      openingBalance: round2(account.openingBalance),
      balance: round2(account.openingBalance + entry.income - entry.expense),
      txnCount: entry.count,
    };
  });
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const accounts = await withBalances(req.userId);
    const total = round2(accounts.reduce((sum, account) => sum + account.balance, 0));
    res.json({ accounts, total });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = parse(accountSchema, req.body);
    const account = await Account.create({ ...body, userId: req.userId });
    res.status(201).json({
      account: {
        id: String(account._id),
        name: account.name,
        type: account.type,
        color: account.color,
        openingBalance: account.openingBalance,
        balance: account.openingBalance,
        txnCount: 0,
      },
    });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const body = parse(accountPatchSchema, req.body);
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      body,
      { new: true, runValidators: true }
    );
    if (!account) return res.status(404).json({ error: 'Account not found' });
    const [withBalance] = (await withBalances(req.userId)).filter(
      (item) => item.id === String(account._id)
    );
    return res.json({ account: withBalance });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const account = await Account.findOne({ _id: req.params.id, userId: req.userId });
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const used = await Transaction.countDocuments({ userId: req.userId, accountId: account._id });
    if (used > 0) {
      return res.status(409).json({
        error: `This account has ${used} transaction${used === 1 ? '' : 's'}. Move or delete them first.`,
      });
    }

    await account.deleteOne();
    return res.json({ ok: true });
  })
);

export default router;

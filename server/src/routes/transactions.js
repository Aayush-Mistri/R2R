import { Router } from 'express';
import mongoose from 'mongoose';
import { Account } from '../models/Account.js';
import { Category } from '../models/Category.js';
import { Transaction } from '../models/Transaction.js';
import { asyncHandler, monthRange, round2 } from '../utils/http.js';
import {
  parse,
  transactionPatchSchema,
  transactionSchema,
} from '../utils/schemas.js';
import { serializeTransaction, TXN_POPULATE } from '../utils/serialize.js';

const router = Router();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isObjectId = (value) => mongoose.isValidObjectId(value);

async function assertCategory(userId, categoryId, type) {
  const category = await Category.findOne({ _id: categoryId, userId });
  if (!category) {
    const error = new Error('Category not found');
    error.status = 400;
    throw error;
  }
  if (type && category.type !== type) {
    const error = new Error(`Pick a ${type} category for this transaction`);
    error.status = 400;
    throw error;
  }
  return category;
}

async function assertAccount(userId, accountId) {
  const account = await Account.findOne({ _id: accountId, userId });
  if (!account) {
    const error = new Error('Account not found');
    error.status = 400;
    throw error;
  }
  return account;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { month, type, categoryId, accountId, q } = req.query;
    const filter = { userId: req.userId };

    if (month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      const { start, end } = monthRange(month);
      filter.date = { $gte: start, $lt: end };
    }
    if (type === 'expense' || type === 'income') filter.type = type;
    if (categoryId && isObjectId(categoryId)) filter.categoryId = categoryId;
    if (accountId && isObjectId(accountId)) filter.accountId = accountId;
    if (q && String(q).trim()) {
      filter.note = { $regex: escapeRegex(String(q).trim()), $options: 'i' };
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

    const [total, items] = await Promise.all([
      Transaction.countDocuments(filter),
      Transaction.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(TXN_POPULATE),
    ]);

    res.json({
      items: items.map(serializeTransaction),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = parse(transactionSchema, req.body);
    await Promise.all([
      assertCategory(req.userId, body.categoryId, body.type),
      assertAccount(req.userId, body.accountId),
    ]);

    const txn = await Transaction.create({
      ...body,
      amount: round2(body.amount),
      userId: req.userId,
    });
    await txn.populate(TXN_POPULATE);
    res.status(201).json({ transaction: serializeTransaction(txn) });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const body = parse(transactionPatchSchema, req.body);
    const txn = await Transaction.findOne({ _id: req.params.id, userId: req.userId });
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });

    const nextType = body.type || txn.type;
    const nextCategoryId = body.categoryId || String(txn.categoryId);
    const nextAccountId = body.accountId || String(txn.accountId);

    await Promise.all([
      assertCategory(req.userId, nextCategoryId, nextType),
      assertAccount(req.userId, nextAccountId),
    ]);

    Object.assign(txn, body, {
      amount: body.amount !== undefined ? round2(body.amount) : txn.amount,
    });
    await txn.save();
    await txn.populate(TXN_POPULATE);
    return res.json({ transaction: serializeTransaction(txn) });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const txn = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    return res.json({ ok: true });
  })
);

export default router;

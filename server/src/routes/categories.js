import { Router } from 'express';
import { Category } from '../models/Category.js';
import { Transaction } from '../models/Transaction.js';
import { asyncHandler } from '../utils/http.js';
import { categoryPatchSchema, categorySchema, parse } from '../utils/schemas.js';

const router = Router();

const shape = (category) => ({
  id: String(category._id),
  name: category.name,
  type: category.type,
  color: category.color,
  icon: category.icon,
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const categories = await Category.find({ userId: req.userId }).sort({ name: 1 });
    res.json({
      expense: categories.filter((c) => c.type === 'expense').map(shape),
      income: categories.filter((c) => c.type === 'income').map(shape),
    });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = parse(categorySchema, req.body);
    const category = await Category.create({ ...body, userId: req.userId });
    res.status(201).json({ category: shape(category) });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const body = parse(categoryPatchSchema, req.body);
    const category = await Category.findOne({ _id: req.params.id, userId: req.userId });
    if (!category) return res.status(404).json({ error: 'Category not found' });

    if (body.type && body.type !== category.type) {
      const used = await Transaction.countDocuments({
        userId: req.userId,
        categoryId: category._id,
      });
      if (used > 0) {
        return res.status(409).json({
          error: 'This category already has transactions, so its type cannot change.',
        });
      }
    }

    Object.assign(category, body);
    await category.save();
    return res.json({ category: shape(category) });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await Category.findOne({ _id: req.params.id, userId: req.userId });
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const used = await Transaction.countDocuments({
      userId: req.userId,
      categoryId: category._id,
    });
    if (used > 0) {
      return res.status(409).json({
        error: `This category is used by ${used} transaction${used === 1 ? '' : 's'}.`,
      });
    }

    await category.deleteOne();
    return res.json({ ok: true });
  })
);

export default router;

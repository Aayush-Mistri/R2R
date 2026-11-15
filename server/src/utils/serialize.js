export const publicUser = (user) => ({
  id: String(user._id),
  username: user.username,
  hasPin: Boolean(user.pinHash),
  createdAt: user.createdAt,
});

export const serializeTransaction = (txn) => ({
  id: String(txn._id),
  type: txn.type,
  amount: txn.amount,
  date: txn.date,
  note: txn.note,
  category: txn.categoryId
    ? {
        id: String(txn.categoryId._id),
        name: txn.categoryId.name,
        color: txn.categoryId.color,
        icon: txn.categoryId.icon,
      }
    : null,
  account: txn.accountId
    ? {
        id: String(txn.accountId._id),
        name: txn.accountId.name,
        type: txn.accountId.type,
        color: txn.accountId.color,
      }
    : null,
  createdAt: txn.createdAt,
});

export const TXN_POPULATE = [
  { path: 'categoryId', select: 'name color icon' },
  { path: 'accountId', select: 'name type color' },
];

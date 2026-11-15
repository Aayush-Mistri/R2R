const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const moneyWhole = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatMoney = (value, { whole = false } = {}) => {
  const amount = Number(value) || 0;
  return whole ? moneyWhole.format(amount) : money.format(amount);
};

export const formatSignedMoney = (value, type) => {
  const sign = type === 'income' ? '+' : '−';
  return `${sign}${formatMoney(Math.abs(Number(value) || 0))}`;
};

export const compactMoney = (value) => {
  const amount = Math.abs(Number(value) || 0);
  const sign = Number(value) < 0 ? '−' : '';
  if (amount >= 10000000) return `${sign}₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `${sign}₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${sign}₹${Math.round(amount / 1000)}k`;
  return `${sign}₹${Math.round(amount)}`;
};

export const parseDateOnly = (value) => new Date(`${value}T00:00:00`);

export const todayISO = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

export const currentMonth = () => todayISO().slice(0, 7);

export const shiftMonth = (month, delta) => {
  const [year, mon] = month.split('-').map(Number);
  const date = new Date(year, mon - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const monthLabel = (month) => {
  const [year, mon] = month.split('-').map(Number);
  return new Date(year, mon - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
};

export const monthShort = (month) => {
  const [year, mon] = month.split('-').map(Number);
  return new Date(year, mon - 1, 1).toLocaleDateString('en-IN', { month: 'short' });
};

export const formatDate = (value) =>
  parseDateOnly(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export const formatDateWithYear = (value) =>
  parseDateOnly(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const ACCOUNT_TYPE_LABELS = {
  cash: 'Cash',
  bank: 'Bank',
  upi: 'UPI',
  credit_card: 'Credit card',
  wallet: 'Wallet',
  other: 'Other',
};

export const sanitizeAmount = (raw) => {
  const cleaned = String(raw).replace(/[^\d.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  if (rest.length === 0) return whole.slice(0, 9);
  return `${whole.slice(0, 9)}.${rest.join('').slice(0, 2)}`;
};

export const percent = (part, total) => {
  if (!total) return 0;
  return Math.round((part / total) * 100);
};

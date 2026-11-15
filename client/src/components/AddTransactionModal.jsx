import { useEffect, useState } from 'react';
import Modal from './ui/Modal.jsx';
import Field from './ui/Field.jsx';
import FormError from './ui/FormError.jsx';
import { Spinner } from './BootScreen.jsx';
import { toast } from './ui/toast.jsx';
import { useFinance } from '../context/FinanceContext.jsx';
import { formatMoney, sanitizeAmount, todayISO } from '../lib/format.js';

const EMPTY_FORM = {
  type: 'expense',
  amount: '',
  date: todayISO(),
  categoryId: '',
  accountId: '',
  note: '',
};

export default function AddTransactionModal() {
  const {
    transactionModalOpen,
    editingTransaction,
    closeTransactionModal,
    categories,
    accounts,
    createTransaction,
    updateTransaction,
  } = useFinance();

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!transactionModalOpen) return;

    if (editingTransaction) {
      setForm({
        type: editingTransaction.type,
        amount: String(editingTransaction.amount),
        date: editingTransaction.date,
        categoryId: editingTransaction.category?.id || '',
        accountId: editingTransaction.account?.id || '',
        note: editingTransaction.note || '',
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        date: todayISO(),
        categoryId: categories.expense[0]?.id || '',
        accountId: accounts[0]?.id || '',
      });
    }
    setError('');
    setSaving(false);
  }, [transactionModalOpen, editingTransaction, categories, accounts]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleType = (type) => {
    setForm((current) => ({
      ...current,
      type,
      categoryId: categories[type]?.[0]?.id || '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    if (!form.categoryId) {
      setError('Pick a category.');
      return;
    }
    if (!form.accountId) {
      setError('Pick an account.');
      return;
    }
    if (!form.date) {
      setError('Pick a date.');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, amount, note: form.note.trim() };
      const categoryName =
        categories[form.type].find((category) => category.id === form.categoryId)?.name ||
        'Uncategorised';
      const accountName =
        accounts.find((account) => account.id === form.accountId)?.name || 'Account';
      const summary = `${formatMoney(amount)} · ${categoryName} · ${accountName}`;

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, payload);
        toast.success('Transaction updated', { description: summary });
      } else {
        await createTransaction(payload);
        toast.success(form.type === 'expense' ? 'Expense added' : 'Income added', {
          description: summary,
        });
      }
      closeTransactionModal();
    } catch (err) {
      setError(err.message);
      toast.error('Could not save transaction', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const list = categories[form.type] || [];

  return (
    <Modal
      open={transactionModalOpen}
      onClose={closeTransactionModal}
      title={editingTransaction ? 'Edit transaction' : 'New transaction'}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={closeTransactionModal}>
            Cancel
          </button>
          <button type="submit" form="transaction-form" className="btn btn-primary" disabled={saving}>
            {saving && <Spinner />}
            {editingTransaction ? 'Save changes' : `Add ${form.type}`}
          </button>
        </>
      }
    >
      <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
          {['expense', 'income'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleType(type)}
              className={`rounded-md py-1.5 text-sm font-medium capitalize transition ${
                form.type === type
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <FormError message={error} />

        <div>
          <label className="label" htmlFor="txn-amount">
            Amount
          </label>
          <div className="flex items-baseline gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 transition focus-within:border-zinc-400 focus-within:ring-4 focus-within:ring-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-within:border-zinc-600 dark:focus-within:ring-white/5">
            <span className="text-2xl font-medium text-zinc-400 dark:text-zinc-500">₹</span>
            <input
              id="txn-amount"
              className="num w-full border-0 bg-transparent p-0 text-3xl font-semibold tracking-tight text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-0 dark:text-zinc-50 dark:placeholder:text-zinc-700"
              inputMode="decimal"
              placeholder="0"
              value={form.amount}
              onChange={(event) => update('amount', sanitizeAmount(event.target.value))}
              autoFocus
            />
          </div>
        </div>

        <div>
          <span className="label">Category</span>
          {list.length === 0 ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              No {form.type} categories yet — add one from the Categories page.
            </p>
          ) : (
            <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto pr-1">
              {list.map((category) => {
                const selected = form.categoryId === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => update('categoryId', category.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
                      selected
                        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span aria-hidden="true">{category.icon}</span>
                    {category.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" htmlFor="txn-date">
            <input
              id="txn-date"
              type="date"
              className="input"
              value={form.date}
              onChange={(event) => update('date', event.target.value)}
            />
          </Field>
          <Field label="Account" htmlFor="txn-account">
            <select
              id="txn-account"
              className="input"
              value={form.accountId}
              onChange={(event) => update('accountId', event.target.value)}
            >
              {accounts.length === 0 && <option value="">No accounts</option>}
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Note" htmlFor="txn-note">
          <input
            id="txn-note"
            className="input"
            placeholder="What was it for? (optional)"
            maxLength={200}
            value={form.note}
            onChange={(event) => update('note', event.target.value)}
          />
        </Field>
      </form>
    </Modal>
  );
}

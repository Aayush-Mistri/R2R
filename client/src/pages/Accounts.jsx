import { useState } from 'react';
import {
  Banknote,
  CircleDollarSign,
  CreditCard,
  Landmark,
  Pencil,
  Plus,
  Smartphone,
  Trash2,
  Wallet,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Modal from '../components/ui/Modal.jsx';
import Field from '../components/ui/Field.jsx';
import FormError from '../components/ui/FormError.jsx';
import ColorSwatches from '../components/ui/ColorSwatches.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { toast } from '../components/ui/toast.jsx';
import { Spinner } from '../components/BootScreen.jsx';
import { useFinance } from '../context/FinanceContext.jsx';
import { api } from '../lib/api.js';
import { ACCOUNT_TYPE_LABELS, formatMoney } from '../lib/format.js';

const TYPE_ICONS = {
  cash: Banknote,
  bank: Landmark,
  upi: Smartphone,
  credit_card: CreditCard,
  wallet: Wallet,
  other: CircleDollarSign,
};

const EMPTY_FORM = { name: '', type: 'bank', openingBalance: '', color: '#6366f1' };

export default function Accounts() {
  const { accounts, totalBalance, reload } = useFinance();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (account) => {
    setEditing(account);
    setForm({
      name: account.name,
      type: account.type,
      openingBalance: String(account.openingBalance),
      color: account.color,
    });
    setError('');
    setModalOpen(true);
  };

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Give the account a name.');
      return;
    }
    const openingBalance = Number(form.openingBalance || 0);
    if (!Number.isFinite(openingBalance)) {
      setError('Opening balance must be a number.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        openingBalance,
        color: form.color,
      };
      if (editing) {
        await api.patch(`/accounts/${editing.id}`, payload);
        toast.success('Account updated', {
          description: `${payload.name} · ${ACCOUNT_TYPE_LABELS[payload.type]}`,
        });
      } else {
        await api.post('/accounts', payload);
        toast.success('Account added', {
          description: `${payload.name} · ${ACCOUNT_TYPE_LABELS[payload.type]}`,
        });
      }
      await reload();
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/accounts/${toDelete.id}`);
      await reload();
      toast.success('Account deleted', { description: toDelete.name });
      setToDelete(null);
    } catch (err) {
      toast.error('Could not delete account', { description: err.message });
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Accounts"
        subtitle="Cash, bank, UPI and cards — balances update as you log."
        actions={
          <button type="button" className="btn btn-primary" onClick={openNew}>
            <Plus className="h-4 w-4" />
            Add account
          </button>
        }
      />

      {accounts.length > 0 && (
        <div className="card flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Total across accounts
            </p>
            <p
              className={`mt-1 text-2xl font-semibold tracking-tight num ${
                totalBalance < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-zinc-900 dark:text-zinc-50'
              }`}
            >
              {formatMoney(totalBalance)}
            </p>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
          </p>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Wallet}
            title="No accounts yet"
            description="Start with cash or UPI, then add bank and credit card accounts."
            action={
              <button type="button" className="btn btn-secondary btn-sm" onClick={openNew}>
                <Plus className="h-3.5 w-3.5" />
                Add your first account
              </button>
            }
            className="py-16"
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => {
            const Icon = TYPE_ICONS[account.type] || CircleDollarSign;
            return (
              <div key={account.id} className="card group relative p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                      style={{ backgroundColor: `${account.color}1f`, color: account.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {account.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        {ACCOUNT_TYPE_LABELS[account.type] || account.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => openEdit(account)}
                      className="grid h-7 w-7 place-items-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                      aria-label={`Edit ${account.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(account)}
                      className="grid h-7 w-7 place-items-center rounded-md text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                      aria-label={`Delete ${account.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p
                  className={`mt-5 text-2xl font-semibold tracking-tight num ${
                    account.balance < 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-zinc-900 dark:text-zinc-50'
                  }`}
                >
                  {formatMoney(account.balance)}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px] text-zinc-400 dark:border-zinc-800/80 dark:text-zinc-500">
                  <span className="num">Opening {formatMoney(account.openingBalance)}</span>
                  <span>
                    {account.txnCount} {account.txnCount === 1 ? 'transaction' : 'transactions'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit account' : 'New account'}
        description={
          editing ? undefined : 'Opening balance is what the account held before you started tracking.'
        }
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="account-form" className="btn btn-primary" disabled={saving}>
              {saving && <Spinner />}
              {editing ? 'Save changes' : 'Add account'}
            </button>
          </>
        }
      >
        <form id="account-form" onSubmit={handleSave} className="space-y-4" noValidate>
          <FormError message={error} />

          <Field label="Name" htmlFor="account-name">
            <input
              id="account-name"
              className="input"
              placeholder="e.g. HDFC Savings"
              maxLength={40}
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type" htmlFor="account-type">
              <select
                id="account-type"
                className="input"
                value={form.type}
                onChange={(event) => update('type', event.target.value)}
              >
                {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Opening balance" htmlFor="account-opening">
              <input
                id="account-opening"
                type="number"
                step="0.01"
                className="input num"
                placeholder="0"
                value={form.openingBalance}
                onChange={(event) => update('openingBalance', event.target.value)}
              />
            </Field>
          </div>

          <div>
            <span className="label">Color</span>
            <ColorSwatches value={form.color} onChange={(color) => update('color', color)} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Delete account?"
        message={
          toDelete
            ? `"${toDelete.name}" will be removed. Accounts with transactions can't be deleted.`
            : ''
        }
        loading={deleting}
      />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import MonthNav from '../components/ui/MonthNav.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { toast } from '../components/ui/toast.jsx';
import { useFinance } from '../context/FinanceContext.jsx';
import { api } from '../lib/api.js';
import {
  formatDate,
  formatMoney,
  formatSignedMoney,
  monthLabel,
} from '../lib/format.js';

const PAGE_SIZE = 50;

function TypeBadge({ type }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
        type === 'income'
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
          : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
      }`}
    >
      {type}
    </span>
  );
}

export default function Transactions() {
  const { month, setMonth, categories, accounts, version, openTransactionModal, deleteTransaction } =
    useFinance();

  const [search, setSearch] = useState('');  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [month, type, categoryId, accountId, query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const params = new URLSearchParams({ month, page: String(page), limit: String(PAGE_SIZE) });
    if (type) params.set('type', type);
    if (categoryId) params.set('categoryId', categoryId);
    if (accountId) params.set('accountId', accountId);
    if (query) params.set('q', query);

    api
      .get(`/transactions?${params.toString()}`)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [month, type, categoryId, accountId, query, page, version]);

  const hasFilters = Boolean(type || categoryId || accountId || query);
  const clearFilters = () => {
    setSearch('');
    setQuery('');
    setType('');
    setCategoryId('');
    setAccountId('');
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteTransaction(toDelete.id);
      toast.success('Transaction deleted', {
        description: `${toDelete.note || toDelete.category?.name} · ${formatMoney(toDelete.amount)}`,
      });
      setToDelete(null);
    } catch (err) {
      toast.error('Could not delete transaction', { description: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const start = data.total === 0 ? 0 : (data.page - 1) * PAGE_SIZE + 1;
  const end = Math.min(data.page * PAGE_SIZE, data.total);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transactions"
        subtitle={loading ? 'Loading your ledger…' : `${data.total} transactions · ${monthLabel(month)}`}
        actions={
          <>
            <MonthNav month={month} onChange={setMonth} />
            <button type="button" className="btn btn-primary" onClick={() => openTransactionModal()}>
              <Plus className="h-4 w-4" />
              Add
            </button>
          </>
        }
      />

      <div className="card p-3 sm:p-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_140px_170px_150px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              className="input pl-9"
              placeholder="Search notes…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search transactions"
            />
          </div>

          <select
            className="input"
            value={type}
            onChange={(event) => setType(event.target.value)}
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>

          <select
            className="input"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.expense.length > 0 && (
              <optgroup label="Expense">
                {categories.expense.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </optgroup>
            )}
            {categories.income.length > 0 && (
              <optgroup label="Income">
                {categories.income.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          <select
            className="input"
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            aria-label="Filter by account"
          >
            <option value="">All accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>

          <div className="flex items-center">
            {hasFilters ? (
              <button type="button" className="btn btn-ghost w-full lg:w-auto" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Clear
              </button>
            ) : (
              <span className="hidden text-[11px] text-zinc-400 dark:text-zinc-500 lg:block">
                Search runs on notes
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {error ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Couldn&apos;t load transactions
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
          </div>
        ) : loading ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-5 py-4">
                <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-2.5 w-1/4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                </div>
                <div className="h-3 w-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={Search}
            title={hasFilters ? 'No matching transactions' : 'Nothing here yet'}
            description={
              hasFilters
                ? 'Try a different search, category or account.'
                : `No transactions recorded in ${monthLabel(month)}.`
            }
            action={
              hasFilters ? (
                <button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>
                  Clear filters
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => openTransactionModal()}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add a transaction
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-[11px] uppercase tracking-wide text-zinc-400 dark:border-zinc-800/80 dark:text-zinc-500">
                    <th className="px-5 py-2.5 font-medium">Date</th>
                    <th className="px-3 py-2.5 font-medium">Details</th>
                    <th className="px-3 py-2.5 font-medium">Category</th>
                    <th className="px-3 py-2.5 font-medium">Account</th>
                    <th className="px-5 py-2.5 text-right font-medium">Amount</th>
                    <th className="w-[76px] px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((txn) => (
                    <tr
                      key={txn.id}
                      className="group border-b border-zinc-100 transition last:border-0 hover:bg-zinc-50/70 dark:border-zinc-800/60 dark:hover:bg-zinc-800/30"
                    >
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-zinc-500 num dark:text-zinc-400">
                        {formatDate(txn.date)}
                      </td>
                      <td className="max-w-[240px] px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px]"
                            style={{ backgroundColor: `${txn.category?.color || '#a1a1aa'}1f` }}
                            aria-hidden="true"
                          >
                            {txn.category?.icon}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-zinc-800 dark:text-zinc-100">
                              {txn.note || txn.category?.name}
                            </p>
                            <div className="mt-0.5">
                              <TypeBadge type={txn.type} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: txn.category?.color }}
                          />
                          {txn.category?.name}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                        {txn.account?.name}
                      </td>
                      <td
                        className={`whitespace-nowrap px-5 py-3 text-right font-medium num ${
                          txn.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {formatSignedMoney(txn.amount, txn.type)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                          <button
                            type="button"
                            onClick={() => openTransactionModal(txn)}
                            className="grid h-7 w-7 place-items-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                            aria-label="Edit transaction"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setToDelete(txn)}
                            className="grid h-7 w-7 place-items-center rounded-md text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                            aria-label="Delete transaction"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/80 md:hidden">
              {data.items.map((txn) => (
                <li key={txn.id} className="flex items-start gap-3 px-4 py-3">
                  <span
                    className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm"
                    style={{ backgroundColor: `${txn.category?.color || '#a1a1aa'}1f` }}
                    aria-hidden="true"
                  >
                    {txn.category?.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                        {txn.note || txn.category?.name}
                      </p>
                      <span
                        className={`shrink-0 text-sm font-medium num ${
                          txn.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {formatSignedMoney(txn.amount, txn.type)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                      {txn.category?.name} · {txn.account?.name} · {formatDate(txn.date)}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openTransactionModal(txn)}
                        className="text-[11px] font-medium text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(txn)}
                        className="text-[11px] font-medium text-rose-600 underline-offset-4 hover:underline dark:text-rose-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {!loading && !error && data.items.length > 0 && (
          <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3 dark:border-zinc-800/80">
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Showing <span className="num">{start}</span>–<span className="num">{end}</span> of{' '}
              <span className="num">{data.total}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-[11px] text-zinc-500 num dark:text-zinc-400">
                {data.page} / {data.pages}
              </span>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                onClick={() => setPage((current) => Math.min(data.pages, current + 1))}
                disabled={page >= data.pages}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Delete this transaction?"
        message={
          toDelete
            ? `${toDelete.note || toDelete.category?.name} · ${formatMoney(toDelete.amount)} on ${formatDate(
                toDelete.date
              )}. This cannot be undone.`
            : ''
        }
        loading={deleting}
      />
    </div>
  );
}

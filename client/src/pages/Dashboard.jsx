import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  PiggyBank,
  Plus,
  ReceiptText,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import MonthNav from '../components/ui/MonthNav.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import CashFlowChart from '../components/charts/CashFlowChart.jsx';
import CategoryDonut from '../components/charts/CategoryDonut.jsx';
import { useFinance } from '../context/FinanceContext.jsx';
import { api } from '../lib/api.js';
import {
  ACCOUNT_TYPE_LABELS,
  formatDate,
  formatMoney,
  formatSignedMoney,
  monthLabel,
  percent,
} from '../lib/format.js';

function StatCard({ label, value, sub, icon: Icon, valueClass = '' }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <Icon className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
      </div>
      <p
        className={`mt-2.5 truncate text-[21px] font-semibold tracking-tight text-zinc-900 num dark:text-zinc-50 sm:text-[23px] ${valueClass}`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 truncate text-[11px] text-zinc-400 dark:text-zinc-500">{sub}</p>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card h-[104px] animate-pulse bg-zinc-100/70 dark:bg-zinc-900" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="card h-[340px] animate-pulse bg-zinc-100/70 dark:bg-zinc-900 lg:col-span-3" />
        <div className="card h-[340px] animate-pulse bg-zinc-100/70 dark:bg-zinc-900 lg:col-span-2" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { month, setMonth, version, openTransactionModal } = useFinance();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError('');

    api
      .get(`/dashboard?month=${month}`)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [month, version, reloadKey]);

  const header = (
    <PageHeader
      title="Overview"
      subtitle="Your money at a glance."
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
  );

  if (error) {
    return (
      <div className="space-y-6">
        {header}
        <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Couldn&apos;t load your dashboard
          </p>
          <p className="max-w-sm text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={load}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        {header}
        <Skeleton />
      </div>
    );
  }

  const { totals, totalBalance, byCategory, trend, recent, accounts } = data;
  const hasTrendData = trend.some((row) => row.income > 0 || row.expense > 0);
  const expenseTotal = byCategory.reduce((sum, item) => sum + item.total, 0);
  const topCategories = byCategory.slice(0, 5);
  const otherCategories = byCategory.slice(5);
  const legend = [...topCategories];

  if (otherCategories.length > 0) {
    legend.push({
      id: 'other',
      name: 'Other categories',
      color: '#a1a1aa',
      total: otherCategories.reduce((sum, item) => sum + item.total, 0),
    });
  }

  return (
    <div className="space-y-6">
      {header}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          label="Spent this month"
          value={formatMoney(totals.expense, { whole: true })}
          sub={monthLabel(month)}
          icon={ReceiptText}
        />
        <StatCard
          label="Income this month"
          value={formatMoney(totals.income, { whole: true })}
          sub={monthLabel(month)}
          icon={TrendingUp}
        />
        <StatCard
          label="Net saved"
          value={formatMoney(totals.net, { whole: true })}
          sub="Income minus spending"
          icon={PiggyBank}
          valueClass={totals.net < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}
        />
        <StatCard
          label="Total balance"
          value={formatMoney(totalBalance, { whole: true })}
          sub="Across all accounts"
          icon={Wallet}
          valueClass={totalBalance < 0 ? 'text-rose-600 dark:text-rose-400' : ''}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="section-title">Cash flow</h2>
              <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Last 6 months</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Expense
              </span>
            </div>
          </div>

          <div className="mt-4">
            {hasTrendData ? (
              <CashFlowChart data={trend} />
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No cash flow yet"
                description="Add your first income or expense and the monthly trend will build itself."
                action={
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => openTransactionModal()}>
                    <Plus className="h-3.5 w-3.5" />
                    Add transaction
                  </button>
                }
                className="py-12"
              />
            )}
          </div>
        </section>

        <section className="card p-5 lg:col-span-2">
          <div>
            <h2 className="section-title">Spending by category</h2>
            <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{monthLabel(month)}</p>
          </div>

          {byCategory.length === 0 ? (
            <EmptyState
              icon={ReceiptText}
              title="Nothing spent yet"
              description="No expenses recorded for this month."
              className="py-12"
            />
          ) : (
            <>
              <div className="mt-1">
                <CategoryDonut data={byCategory} total={expenseTotal} />
              </div>
              <ul className="mt-2 space-y-2.5">
                {legend.map((item) => (
                  <li key={item.id} className="flex items-center gap-2.5 text-xs">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate text-zinc-600 dark:text-zinc-300">{item.name}</span>
                    <span className="ml-auto shrink-0 text-[11px] text-zinc-400 num dark:text-zinc-500">
                      {percent(item.total, expenseTotal)}%
                    </span>
                    <span className="w-[74px] shrink-0 text-right font-medium text-zinc-800 num dark:text-zinc-200">
                      {formatMoney(item.total, { whole: true })}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="card lg:col-span-3">
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="section-title">Recent activity</h2>
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon={ReceiptText}
              title="No transactions yet"
              description="Your recent expenses and income will show up here."
              action={
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => openTransactionModal()}>
                  <Plus className="h-3.5 w-3.5" />
                  Add your first one
                </button>
              }
              className="pb-6"
            />
          ) : (
            <ul className="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {recent.map((txn) => (
                <li key={txn.id}>
                  <button
                    type="button"
                    onClick={() => openTransactionModal(txn)}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                  >
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm"
                      style={{ backgroundColor: `${txn.category?.color || '#a1a1aa'}1f` }}
                      aria-hidden="true"
                    >
                      {txn.category?.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                        {txn.note || txn.category?.name}
                      </p>
                      <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                        {txn.category?.name} · {txn.account?.name} · {formatDate(txn.date)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-medium num ${
                        txn.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {formatSignedMoney(txn.amount, txn.type)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="section-title">Accounts</h2>
            <Link
              to="/accounts"
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {accounts.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No accounts yet"
              description="Add cash, bank, UPI or credit card accounts to track balances."
              action={
                <Link to="/accounts" className="btn btn-secondary btn-sm">
                  Add account
                </Link>
              }
              className="pb-6"
            />
          ) : (
            <ul className="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {accounts.map((account) => (
                <li key={account.id} className="flex items-center gap-3 px-5 py-3">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: account.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                      {account.name}
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      {ACCOUNT_TYPE_LABELS[account.type] || account.type}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-medium num ${
                      account.balance < 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {formatMoney(account.balance)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {accounts.length > 0 && (
            <div className="mt-1 flex items-center justify-between border-t border-zinc-100 px-5 py-3.5 dark:border-zinc-800/80">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total</span>
              <span className="text-sm font-semibold text-zinc-900 num dark:text-zinc-50">
                {formatMoney(totalBalance)}
              </span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

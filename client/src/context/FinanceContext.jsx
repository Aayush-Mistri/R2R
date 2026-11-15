import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '../lib/api.js';
import { currentMonth } from '../lib/format.js';
import { useAuth } from './AuthContext.jsx';

const FinanceContext = createContext(null);

const EMPTY_CATEGORIES = { expense: [], income: [] };

export function FinanceProvider({ children }) {
  const { state } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState(EMPTY_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const [month, setMonth] = useState(currentMonth);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const load = useCallback(async () => {
    const [accountData, categoryData] = await Promise.all([
      api.get('/accounts'),
      api.get('/categories'),
    ]);
    setAccounts(accountData.accounts);
    setCategories(categoryData);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (state !== 'authed') {
      setAccounts([]);
      setCategories(EMPTY_CATEGORIES);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    load()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [state, load]);

  const notifyDataChanged = useCallback(() => {
    setVersion((current) => current + 1);
  }, []);

  const reload = useCallback(async () => {
    await load();
    notifyDataChanged();
  }, [load, notifyDataChanged]);

  const createTransaction = useCallback(
    async (payload) => {
      const data = await api.post('/transactions', payload);
      notifyDataChanged();
      return data.transaction;
    },
    [notifyDataChanged]
  );

  const updateTransaction = useCallback(
    async (id, payload) => {
      const data = await api.patch(`/transactions/${id}`, payload);
      notifyDataChanged();
      return data.transaction;
    },
    [notifyDataChanged]
  );

  const deleteTransaction = useCallback(
    async (id) => {
      await api.delete(`/transactions/${id}`);
      notifyDataChanged();
    },
    [notifyDataChanged]
  );

  const openTransactionModal = useCallback((transaction = null) => {
    setEditingTransaction(transaction);
    setTransactionModalOpen(true);
  }, []);

  const closeTransactionModal = useCallback(() => {
    setTransactionModalOpen(false);
    setEditingTransaction(null);
  }, []);

  const totalBalance = useMemo(
    () => Math.round(accounts.reduce((sum, account) => sum + account.balance, 0) * 100) / 100,
    [accounts]
  );

  const value = useMemo(
    () => ({
      accounts,
      categories,
      loading,
      version,
      month,
      setMonth,
      totalBalance,
      reload,
      notifyDataChanged,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      transactionModalOpen,
      editingTransaction,
      openTransactionModal,
      closeTransactionModal,
    }),
    [
      accounts,
      categories,
      loading,
      version,
      month,
      totalBalance,
      reload,
      notifyDataChanged,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      transactionModalOpen,
      editingTransaction,
      openTransactionModal,
      closeTransactionModal,
    ]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used inside FinanceProvider');
  return context;
};

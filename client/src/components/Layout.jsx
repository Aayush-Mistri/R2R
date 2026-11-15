import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  Settings,
  Sun,
  Tags,
  Wallet,
  X,
} from 'lucide-react';
import Brand from '../components/Brand.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import AddTransactionModal from '../components/AddTransactionModal.jsx';
import { toast } from './ui/toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFinance } from '../context/FinanceContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/accounts', label: 'Accounts', icon: Wallet },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const { openTransactionModal } = useFinance();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Signed out', { description: 'Your PIN will be asked next time.' });
    navigate('/login', { replace: true });
  };

  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Brand />
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-4">
        <button
          type="button"
          onClick={() => {
            openTransactionModal();
            onNavigate?.();
          }}
          className="btn btn-primary w-full"
        >
          <Plus className="h-4 w-4" />
          Add transaction
        </button>
      </div>

      <nav className="mt-5 flex-1 space-y-1 overflow-y-auto px-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-zinc-200/80 px-3 py-3 dark:border-zinc-800/80">
        <button type="button" onClick={toggleTheme} className="nav-item w-full">
          <ThemeIcon className="h-[18px] w-[18px]" />
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

        <div className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-zinc-900 text-[11px] font-semibold uppercase text-white dark:bg-zinc-100 dark:text-zinc-900">
            {user?.username?.slice(0, 1) || '?'}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-700 dark:text-zinc-200">
            {user?.username}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="grid h-7 w-7 place-items-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppShell({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { openTransactionModal } = useFinance();

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-950 lg:block">
        <SidebarContent />
      </aside>

      <div className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-zinc-200/80 bg-white/90 px-4 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/90 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          aria-label="Open menu"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>
        <Brand />
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => openTransactionModal()}
            className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-900 text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            aria-label="Add transaction"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-zinc-950/40 backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] animate-slide-in-left border-r border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <main className="lg:pl-[248px]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children ?? <Outlet />}
        </div>
      </main>

      <AddTransactionModal />
    </div>
  );
}

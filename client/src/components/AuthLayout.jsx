import { LockKeyhole } from 'lucide-react';
import Brand from './Brand.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="flex items-center justify-between px-5 pb-2 pt-[calc(env(safe-area-inset-top)_+_1.25rem)] sm:px-8 sm:pb-5">
        <Brand />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 justify-center px-3 pb-[calc(env(safe-area-inset-bottom)_+_1.75rem)] pt-2 sm:px-6">
        <div className="my-auto w-full max-w-[440px] animate-slide-up">
          <div className="card p-5 sm:p-7">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {title}
            </h1>
            {subtitle && <p className="mt-1 text-sm muted">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>

          {footer && (
            <div className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">{footer}</div>
          )}

          <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            <LockKeyhole className="h-3 w-3" />
            PIN protected · data stays in your own account
          </p>
        </div>
      </main>
    </div>
  );
}

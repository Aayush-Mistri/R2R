import { Loader2 } from 'lucide-react';
import Brand from './Brand.jsx';

export function Spinner({ className = 'h-4 w-4' }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export default function BootScreen() {
  return (
    <div className="grid min-h-dvh place-items-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <Brand />
        <span className="text-xs text-zinc-400 dark:text-zinc-500">Preparing your ledger…</span>
      </div>
    </div>
  );
}

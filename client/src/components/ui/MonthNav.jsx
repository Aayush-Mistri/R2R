import { ChevronLeft, ChevronRight } from 'lucide-react';
import { monthLabel, currentMonth, shiftMonth } from '../../lib/format.js';

export default function MonthNav({ month, onChange }) {
  const isCurrent = month === currentMonth();

  return (
    <div className="inline-flex h-9 items-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        onClick={() => onChange(shiftMonth(month, -1))}
        className="grid h-8 w-8 place-items-center rounded-l-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => !isCurrent && onChange(currentMonth())}
        title={isCurrent ? undefined : 'Jump to this month'}
        className="min-w-[126px] px-1 text-center text-[13px] font-medium text-zinc-700 dark:text-zinc-200"
      >
        {monthLabel(month)}
      </button>
      <button
        type="button"
        onClick={() => onChange(shiftMonth(month, 1))}
        className="grid h-8 w-8 place-items-center rounded-r-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

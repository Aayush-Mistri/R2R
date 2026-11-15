import { formatMoney } from '../../lib/format.js';

export default function ChartTooltip({ active, payload, label, labelFormatter }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg shadow-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/30">
      <p className="mb-1.5 font-medium text-zinc-500 dark:text-zinc-400">
        {labelFormatter ? labelFormatter(label) : label}
      </p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={`${entry.name}-${entry.dataKey}`} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color || entry.payload?.fill || '#a1a1aa' }}
            />
            <span className="text-zinc-500 dark:text-zinc-400">{entry.name}</span>
            <span className="ml-auto pl-4 font-medium text-zinc-900 num dark:text-zinc-100">
              {formatMoney(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

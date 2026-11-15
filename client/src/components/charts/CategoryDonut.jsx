import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatMoney } from '../../lib/format.js';
import ChartTooltip from './ChartTooltip.jsx';

export default function CategoryDonut({ data, total }) {
  return (
    <div className="relative h-[196px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="name"
            innerRadius="63%"
            outerRadius="92%"
            paddingAngle={2}
            cornerRadius={4}
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry) => (
              <Cell key={entry.id} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
            Spent
          </p>
          <p className="mt-0.5 text-lg font-semibold tracking-tight text-zinc-900 num dark:text-zinc-50">
            {formatMoney(total, { whole: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

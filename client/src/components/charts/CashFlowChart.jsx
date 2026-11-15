import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { compactMoney, monthLabel, monthShort } from '../../lib/format.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import ChartTooltip from './ChartTooltip.jsx';

export default function CashFlowChart({ data }) {
  const { theme } = useTheme();
  const grid = theme === 'dark' ? '#27272a' : '#e9e9ec';
  const tick = theme === 'dark' ? '#71717a' : '#a1a1aa';
  const cursor = theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barGap={4} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={grid} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fill: tick, fontSize: 11 }}
          tickFormatter={monthShort}
          dy={6}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: tick, fontSize: 11 }}
          tickFormatter={(value) => (value === 0 ? '0' : compactMoney(value))}
          width={52}
        />
        <Tooltip
          cursor={{ fill: cursor }}
          content={<ChartTooltip labelFormatter={monthLabel} />}
        />
        <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={22} />
        <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

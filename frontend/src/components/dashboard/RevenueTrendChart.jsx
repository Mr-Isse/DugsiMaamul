import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import ChartCard from './ChartCard';
import EmptyState from './EmptyState';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../ui/chart';

const revenueTrendConfig = {
  amount: {
    label: 'Revenue',
    theme: {
      light: '#6366f1',
      dark: '#818cf8',
    },
  },
};

const ChartSkeleton = ({ height = 200 }) => (
  <div className="space-y-3 p-1">
    <div className="flex items-end justify-between gap-1.5" style={{ height }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-md"
          style={{ height: `${20 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  </div>
);

const RevenueTrendChart = ({ revenueData = [], isLoading, formatCurrency }) => {
  const data = useMemo(
    () => revenueData.map((d) => ({ ...d, amount: Number(d.amount || 0) })),
    [revenueData]
  );

  return (
    <ChartCard
      title="Revenue Trend"
      description="Last 6 months performance"
      icon={BarChart3}
      badge="6 months"
      delay={0.5}
    >
      {isLoading ? (
        <div className="h-[220px]"><ChartSkeleton height={200} /></div>
      ) : data.length > 0 ? (
        <ChartContainer config={revenueTrendConfig} className="w-full" style={{ height: 220 }}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-amount)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-amount)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <ChartTooltip>
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex min-w-[130px] items-center justify-between gap-2 leading-none font-bold">
                    <span className="text-slate-600 dark:text-slate-300 text-[11.5px]">{name}</span>
                    <span className="tabular-nums text-[12px]">
                      {formatCurrency ? formatCurrency(value) : value}
                    </span>
                  </div>
                )}
                className="rounded-xl px-3 py-2 border-slate-200 dark:border-slate-700 shadow-lg"
              />
            </ChartTooltip>
            <Area type="monotone" dataKey="amount" name="Revenue" stroke="var(--color-amount)" strokeWidth={2.5} fill="url(#gradRevenue)" dot={{ r: 3, fill: 'var(--color-amount)' }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ChartContainer>
      ) : (
        <EmptyState title="No revenue data yet" description="Revenue will appear once payments are recorded" />
      )}
    </ChartCard>
  );
};

export default React.memo(RevenueTrendChart);

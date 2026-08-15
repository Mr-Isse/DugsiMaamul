import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import { Layers } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import ChartCard from './ChartCard';
import EmptyState from './EmptyState';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../ui/chart';

const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6', '#0ea5e9', '#f97316'];

const revenueByClassConfig = {
  amount: { label: 'Revenue' },
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

const RevenueByClassChart = ({ revenuePerClass = [], isLoading, formatCurrency }) => {
  const data = useMemo(() => revenuePerClass.slice(0, 8), [revenuePerClass]);
  const count = revenuePerClass.length;

  return (
    <ChartCard
      title="Revenue by Class"
      description="Top performing classes"
      icon={Layers}
      badge={`${count} classes`}
      delay={0.58}
    >
      {isLoading ? (
        <div className="h-[220px]"><ChartSkeleton height={200} /></div>
      ) : data.length > 0 ? (
        <ChartContainer config={revenueByClassConfig} className="w-full" style={{ height: 220 }}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={0} angle={-30} textAnchor="end" height={50} />
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
            <Bar dataKey="amount" name="Revenue" radius={[6, 6, 0, 0]} maxBarSize={36}>
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      ) : (
        <EmptyState title="No class revenue data" description="Revenue by class will appear once payments are linked" />
      )}
    </ChartCard>
  );
};

export default React.memo(RevenueByClassChart);

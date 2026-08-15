import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import ChartCard from './ChartCard';
import EmptyState from './EmptyState';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../ui/chart';

const GREEN = '#10b981';
const RED = '#f43f5e';

const paymentStatusConfig = {
  paid: {
    label: 'Paid',
    theme: {
      light: GREEN,
      dark: '#34d399',
    },
  },
  unpaid: {
    label: 'Unpaid',
    theme: {
      light: RED,
      dark: '#fb7185',
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

const PaymentStatusChart = ({ paidVsUnpaid, isLoading }) => {
  const paid = paidVsUnpaid?.paid || 0;
  const unpaid = paidVsUnpaid?.unpaid || 0;
  const total = paid + unpaid;
  const paidPercent = total > 0 ? Math.round((paid / total) * 100) : 0;

  const data = useMemo(
    () =>
      [
        { name: 'Paid', value: paid, fill: GREEN },
        { name: 'Unpaid', value: unpaid, fill: RED },
      ].filter((d) => d.value > 0),
    [paid, unpaid]
  );

  return (
    <ChartCard
      title="Payment Status"
      description="Paid vs unpaid students"
      icon={PieChartIcon}
      delay={0.66}
    >
      {isLoading ? (
        <div className="h-[200px]"><ChartSkeleton height={180} /></div>
      ) : data.length > 0 ? (
        <div className="flex items-center gap-4">
          <div className="w-1/2" style={{ height: 180 }}>
            <ChartContainer config={paymentStatusConfig} className="w-full h-full">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip>
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex min-w-[120px] items-center justify-between gap-2 leading-none font-bold">
                        <span className="text-slate-600 dark:text-slate-300 text-[11.5px]">{name}</span>
                        <span className="tabular-nums text-[12px]">{value}</span>
                      </div>
                    )}
                    className="rounded-xl px-3 py-2 border-slate-200 dark:border-slate-700 shadow-lg"
                  />
                </ChartTooltip>
              </PieChart>
            </ChartContainer>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{paid}</p>
                <p className="text-[10px] text-slate-400">Paid</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{unpaid}</p>
                <p className="text-[10px] text-slate-400">Unpaid</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">{paidPercent}%</p>
              <p className="text-[10px] text-slate-400">Collection rate</p>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState title="No payment data" description="Payment status will appear once payments are recorded" />
      )}
    </ChartCard>
  );
};

export default React.memo(PaymentStatusChart);

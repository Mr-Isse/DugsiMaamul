import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { Award } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import ChartCard from './ChartCard';
import EmptyState from './EmptyState';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../ui/chart';

const PALETTE = ['#8b5cf6', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

const classRankingConfig = {
  average: { label: 'Average' },
  students: { label: 'Students' },
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

const ClassRankingsChart = ({ classRanks = [], isLoading }) => {
  const data = useMemo(
    () =>
      classRanks.slice(0, 6).map((d) => ({
        name: d.name,
        average: d.averageMarks || 0,
        students: d.studentCount || 0,
      })),
    [classRanks]
  );

  return (
    <ChartCard
      title="Class Rankings"
      description="Top classes by average marks"
      icon={Award}
      delay={0.82}
    >
      {isLoading ? (
        <div className="h-[200px]"><ChartSkeleton height={180} /></div>
      ) : data.length > 0 ? (
        <ChartContainer config={classRankingConfig} className="w-full" style={{ height: 200 }}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <ChartTooltip>
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex min-w-[130px] items-center justify-between gap-2 leading-none font-bold">
                    <span className="text-slate-600 dark:text-slate-300 text-[11.5px]">{name}</span>
                    <span className="tabular-nums text-[12px]">
                      {value}{name === 'Average' ? '%' : ''}
                    </span>
                  </div>
                )}
                className="rounded-xl px-3 py-2 border-slate-200 dark:border-slate-700 shadow-lg"
              />
            </ChartTooltip>
            <Bar dataKey="average" name="Average" radius={[0, 6, 6, 0]} maxBarSize={20}>
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      ) : (
        <EmptyState title="No class rankings" description="Rankings will appear once exam marks are recorded" />
      )}
    </ChartCard>
  );
};

export default React.memo(ClassRankingsChart);

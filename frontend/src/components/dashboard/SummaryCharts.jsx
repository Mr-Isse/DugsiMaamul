import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp, Users, Activity } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useGetStatsQuery, useGetExecutiveDashboardQuery } from '../../store/adminApiSlice';
import ChartCard from './ChartCard';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../ui/chart';

const revenueChartConfig = {
  amount: {
    label: 'Revenue',
    theme: {
      light: '#6366f1',
      dark: '#818cf8',
    },
  },
};

const attendanceChartConfig = {
  rate: {
    label: 'Attendance',
    theme: {
      light: '#10b981',
      dark: '#34d399',
    },
  },
};

const enrollmentChartConfig = {
  count: {
    label: 'Students',
    theme: {
      light: '#f59e0b',
      dark: '#fbbf24',
    },
  },
};

const ChartSkeletonLoader = () => (
  <div className="space-y-3 p-1">
    <div className="flex items-end justify-between h-[200px] gap-1.5">
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

const SummaryCharts = () => {
  const { data: statsResponse, isLoading: statsLoading } = useGetStatsQuery();
  const { data: execRes, isLoading: execLoading } = useGetExecutiveDashboardQuery();

  const stats = statsResponse;
  const exec = execRes?.data;
  const isLoading = statsLoading || execLoading;

  const revenueData = useMemo(() => {
    if (exec?.charts?.revenueTrend?.length > 0) {
      return exec.charts.revenueTrend;
    }
    return [];
  }, [exec]);

  const attendanceData = useMemo(() => {
    if (exec?.charts?.attendanceTrend?.length > 0) {
      return exec.charts.attendanceTrend;
    }
    return [];
  }, [exec]);

  const enrollmentData = useMemo(() => {
    if (exec?.charts?.enrollmentByGrade?.length > 0) {
      return exec.charts.enrollmentByGrade;
    }
    return [];
  }, [exec]);

  const hasRevenue = revenueData.length > 0;
  const hasAttendance = attendanceData.length > 0;
  const hasEnrollment = enrollmentData.length > 0;

  if (!hasRevenue && !hasAttendance && !hasEnrollment && !isLoading) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {hasRevenue && (
        <ChartCard
          title="Revenue Trend"
          description="Monthly revenue overview"
          icon={TrendingUp}
          badge="+12% vs last month"
          delay={0.3}
        >
          {isLoading ? (
            <ChartSkeletonLoader />
          ) : (
            <ChartContainer config={revenueChartConfig} className="h-[220px] w-full">
              <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-amount)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--color-amount)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800/50" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} dy={8} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip cursor={{ stroke: 'var(--color-amount)', strokeWidth: 1, strokeDasharray: '4 4' }}>
                  <ChartTooltipContent
                    hideLabel={false}
                    indicator="dot"
                    formatter={(value, name) => (
                      <div className="flex min-w-[130px] items-center justify-between gap-2 leading-none font-bold">
                        <span className="text-slate-600 dark:text-slate-300 text-[11.5px]">{name}</span>
                        <span className="tabular-nums text-[12px]">
                          {typeof value === 'number' && value > 999
                            ? `$${value.toLocaleString()}`
                            : value}
                        </span>
                      </div>
                    )}
                    className="rounded-xl px-3 py-2 border-slate-200 dark:border-slate-700 shadow-lg"
                  />
                </ChartTooltip>
                <Area type="monotone" dataKey="amount" name="Revenue" stroke="var(--color-amount)" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: 'var(--color-amount)', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ChartContainer>
          )}
        </ChartCard>
      )}

      {hasAttendance && (
        <ChartCard
          title="Attendance Trend"
          description="Monthly attendance rate"
          icon={Activity}
          badge="Target: 95%"
          delay={0.4}
        >
          {isLoading ? (
            <ChartSkeletonLoader />
          ) : (
            <ChartContainer config={attendanceChartConfig} className="h-[220px] w-full">
              <LineChart data={attendanceData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800/50" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} dy={8} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <ChartTooltip cursor={{ stroke: 'var(--color-rate)', strokeWidth: 1, strokeDasharray: '4 4' }}>
                  <ChartTooltipContent
                    hideLabel={false}
                    indicator="line"
                    formatter={(value, name) => (
                      <div className="flex min-w-[130px] items-center justify-between gap-2 leading-none font-bold">
                        <span className="text-slate-600 dark:text-slate-300 text-[11.5px]">{name}</span>
                        <span className="tabular-nums text-[12px]">{value}%</span>
                      </div>
                    )}
                    className="rounded-xl px-3 py-2 border-slate-200 dark:border-slate-700 shadow-lg"
                  />
                </ChartTooltip>
                <Line type="monotone" dataKey="rate" name="Attendance" stroke="var(--color-rate)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--color-rate)', strokeWidth: 0 }} activeDot={{ r: 5, fill: 'var(--color-rate)', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ChartContainer>
          )}
        </ChartCard>
      )}

      {hasEnrollment && (
        <ChartCard
          title="Enrollment by Grade"
          description="Student distribution"
          icon={Users}
          badge={`${enrollmentData.reduce((s, r) => s + (r.count || 0), 0)} total`}
          delay={0.5}
        >
          {isLoading ? (
            <ChartSkeletonLoader />
          ) : (
            <ChartContainer config={enrollmentChartConfig} className="h-[220px] w-full">
              <BarChart data={enrollmentData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800/50" vertical={false} />
                <XAxis dataKey="grade" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} dy={8} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <ChartTooltip cursor={{ fill: 'var(--color-count)', opacity: 0.05 }}>
                  <ChartTooltipContent
                    hideLabel={false}
                    indicator="dot"
                    formatter={(value, name) => (
                      <div className="flex min-w-[130px] items-center justify-between gap-2 leading-none font-bold">
                        <span className="text-slate-600 dark:text-slate-300 text-[11.5px]">{name}</span>
                        <span className="tabular-nums text-[12px]">{value?.toLocaleString?.() ?? value}</span>
                      </div>
                    )}
                    className="rounded-xl px-3 py-2 border-slate-200 dark:border-slate-700 shadow-lg"
                  />
                </ChartTooltip>
                <Bar dataKey="count" name="Students" fill="var(--color-count)" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ChartContainer>
          )}
        </ChartCard>
      )}
    </div>
  );
};

export default React.memo(SummaryCharts);

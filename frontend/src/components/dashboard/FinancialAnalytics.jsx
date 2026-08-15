import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { DollarSign, Receipt, TrendingDown, PieChart as PieChartIcon } from 'lucide-react';
import { useGetPaymentStatsQuery, useGetExpenseStatsQuery } from '../../store/adminApiSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Skeleton } from '../ui/skeleton';
import { motion } from 'framer-motion';
import EmptyState from './EmptyState';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6', '#0ea5e9', '#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-bold text-slate-500 dark:text-slate-400 mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="font-semibold" style={{ color: entry.color || entry.fill }}>
          {entry.name}: {typeof entry.value === 'number' && entry.value > 999
            ? `$${entry.value.toLocaleString()}`
            : entry.value}
        </p>
      ))}
    </div>
  );
};

const StatMini = ({ label, value, color }) => (
  <div className="flex items-center gap-2">
    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
    <div>
      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{value}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  </div>
);

const FinanceSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="text-center">
          <Skeleton className="h-3 w-16 mx-auto mb-1.5 rounded" />
          <Skeleton className="h-6 w-20 mx-auto rounded" />
        </div>
      ))}
    </div>
    <Skeleton className="h-48 w-full rounded-xl" />
  </div>
);

const FinancialAnalytics = ({ formatCurrency }) => {
  const { data: paymentRes, isLoading: paymentLoading } = useGetPaymentStatsQuery();
  const { data: expenseRes, isLoading: expenseLoading } = useGetExpenseStatsQuery();

  const isLoading = paymentLoading || expenseLoading;
  const paymentStats = paymentRes?.stats;
  const expenseData = expenseRes?.data;

  const expenseByCategory = useMemo(() => {
    if (!expenseData?.byCategory) return [];
    return expenseData.byCategory.map((c) => ({
      name: c._id,
      value: c.totalAmount,
      count: c.count,
    }));
  }, [expenseData]);

  const expenseMonthlyTrend = useMemo(() => {
    if (!expenseData?.monthlyTrend) return [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return expenseData.monthlyTrend.map((m) => ({
      name: monthNames[(m._id.month || 1) - 1],
      amount: m.totalAmount,
      count: m.count,
    }));
  }, [expenseData]);

  const expenseByStatus = useMemo(() => {
    if (!expenseData?.byStatus) return [];
    return expenseData.byStatus.map((s) => ({
      name: s._id,
      value: s.totalAmount,
      count: s.count,
    }));
  }, [expenseData]);

  if (isLoading) {
    return (
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden h-full">
        <CardContent className="p-5">
          <FinanceSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.45 }}
      className="h-full"
    >
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden h-full">
        <CardHeader className="pb-2 pt-5 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
                <DollarSign size={16} className="text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">Financial Overview</CardTitle>
                <CardDescription className="text-[11px]">{paymentStats?.currentMonth || 'Current month'}</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {paymentStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expected</p>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(paymentStats.totalExpected)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Collected</p>
                  <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(paymentStats.totalCollected)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Unpaid</p>
                  <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                    {formatCurrency(paymentStats.totalUnpaid)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-slate-400 justify-center">
                <span>{paymentStats.paidCount} paid</span>
                <span>·</span>
                <span>{paymentStats.unpaidCount} unpaid</span>
                <span>·</span>
                <span>{paymentStats.totalStudents} total records</span>
              </div>

              {expenseByCategory.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Expense by Category</p>
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="50%" height={140}>
                      <PieChart>
                        <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {expenseByCategory.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {expenseByCategory.slice(0, 4).map((cat, i) => (
                        <StatMini key={cat.name} label={cat.name} value={formatCurrency(cat.value)} color={COLORS[i % COLORS.length]} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {expenseMonthlyTrend.length > 1 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Expense Trend</p>
                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={expenseMonthlyTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="amount" name="Expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#expGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : (
            <EmptyState title="No financial data" description="Payment and expense stats will appear here" />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(FinancialAnalytics);

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { ClipboardCheck, Users, AlertTriangle } from 'lucide-react';
import { useGetPayrollStatsQuery, useGetLeaveStatsQuery } from '../../store/adminApiSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Skeleton } from '../ui/skeleton';
import { motion } from 'framer-motion';
import EmptyState from './EmptyState';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6'];
const STATUS_COLORS = { Draft: '#94a3b8', Approved: '#6366f1', Paid: '#10b981', Pending: '#f59e0b', Rejected: '#f43f5e' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-semibold" style={{ color: entry.color || entry.fill }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

const HRPayrollWidget = ({ formatCurrency }) => {
  const { data: payrollRes, isLoading: payrollLoading } = useGetPayrollStatsQuery();
  const { data: leaveRes, isLoading: leaveLoading } = useGetLeaveStatsQuery();

  const isLoading = payrollLoading || leaveLoading;
  const payroll = payrollRes?.data;
  const leave = leaveRes?.data;

  const leaveByStatus = useMemo(() => {
    if (!leave?.byStatus) return [];
    return leave.byStatus.map((s) => ({
      name: s._id,
      value: s.count,
      days: s.totalDays,
    }));
  }, [leave]);

  const payrollByStatus = useMemo(() => {
    if (!payroll?.byStatus) return [];
    return payroll.byStatus.map((s) => ({
      name: s._id,
      value: s.count,
      totalNet: s.totalNet,
    }));
  }, [payroll]);

  if (isLoading) {
    return (
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden h-full">
        <CardContent className="p-5 space-y-3">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-6 w-24 rounded" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.45 }}
      className="h-full"
    >
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden h-full">
        <CardHeader className="pb-2 pt-5 px-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center">
              <Users size={16} className="text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">HR & Payroll</CardTitle>
              <CardDescription className="text-[11px]">Payroll and leave overview</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {payroll?.summary ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gross Salary</p>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white">{formatCurrency(payroll.summary.totalGross)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Salary</p>
                  <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(payroll.summary.totalNet)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tax</p>
                  <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{formatCurrency(payroll.summary.totalTax)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deductions</p>
                  <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400">{formatCurrency(payroll.summary.totalDeduc)}</p>
                </div>
              </div>

              {payrollByStatus.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Payroll Status</p>
                  <div className="flex items-center gap-3">
                    <ResponsiveContainer width="40%" height={100}>
                      <PieChart>
                        <Pie data={payrollByStatus} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {payrollByStatus.map((entry, i) => (
                            <Cell key={i} fill={STATUS_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1.5">
                      {payrollByStatus.map((s, i) => (
                        <div key={s.name} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[s.name] || COLORS[i % COLORS.length] }} />
                          <span className="text-[10px] text-slate-500 flex-1">{s.name}</span>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {leaveByStatus.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Leave Requests</p>
                  <div className="flex items-center gap-3">
                    <ResponsiveContainer width="40%" height={100}>
                      <PieChart>
                        <Pie data={leaveByStatus} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {leaveByStatus.map((entry, i) => (
                            <Cell key={i} fill={STATUS_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1.5">
                      {leaveByStatus.map((s, i) => (
                        <div key={s.name} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[s.name] || COLORS[i % COLORS.length] }} />
                          <span className="text-[10px] text-slate-500 flex-1">{s.name}</span>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{s.value} ({s.days}d)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState title="No payroll data" description="Payroll and leave stats will appear once records exist" />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(HRPayrollWidget);

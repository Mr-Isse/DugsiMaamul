import React, { useMemo } from 'react';
import { Users, CreditCard, ChevronRight } from 'lucide-react';
import { useGetStudentsQuery, useGetMonthlyPaymentsQuery } from '../../store/adminApiSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState';
import { Button } from '../ui/button';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);

const TableSkeleton = () => (
  <div className="space-y-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 py-2.5 px-3">
        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
        <Skeleton className="h-4 flex-1 rounded" />
        <div className="flex gap-2 shrink-0">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

const RecentTable = ({ title, subtitle, icon: Icon, items, columns, onRowClick, viewAllPath, isLoading, delay = 0 }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full overflow-hidden">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</CardTitle>
                <CardDescription className="text-xs mt-0.5">{subtitle}</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(viewAllPath)}
              className="h-8 shrink-0 gap-0.5 px-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:text-indigo-700 dark:hover:text-indigo-300"
              aria-label={`View all ${title.toLowerCase()}`}
            >
              View All <ChevronRight size={14} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          {isLoading ? (
            <TableSkeleton />
          ) : items.length > 0 ? (
            <div className="space-y-0.5">
              {columns.header && (
                <div className={cn('rounded-t-lg', columns.gridClass, 'px-3 py-2 border-b border-slate-100 dark:border-slate-800')}>
                  {columns.header.map((h) => (
                    <span key={h} className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">{h}</span>
                  ))}
                </div>
              )}
              {items.map((item, i) => (
                <motion.div
                  key={item._id || i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + i * 0.03 }}
                  className={`${columns.gridClass} rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.render(item, i)}
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState title={`No ${title.toLowerCase()} yet`} description={`${title} will appear here`} />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

const RecentStudentsTable = ({ delay = 0 }) => {
  const navigate = useNavigate();
  const { data: studentsRes, isLoading } = useGetStudentsQuery();

  const students = useMemo(() => {
    const list = Array.isArray(studentsRes) ? studentsRes : Array.isArray(studentsRes?.data) ? studentsRes.data : [];
    return list.slice(0, 6);
  }, [studentsRes]);

  return (
    <RecentTable
      title="Recent Students"
      subtitle="Latest registered"
      icon={Users}
      items={students}
      isLoading={isLoading}
      viewAllPath="/students"
      delay={delay}
      onRowClick={(s) => navigate(`/students/${s.customId || s._id}`)}
      columns={{
        gridClass: 'grid grid-cols-[1fr_80px] gap-3 items-center px-3 py-2.5',
        header: ['Name', 'Class'],
        render: (s) => (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-extrabold shrink-0">
                {(s.name || 'S').charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{s.name || 'Unknown'}</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{s.class?.name || s.class || '\u2014'}</span>
          </>
        ),
      }}
    />
  );
};

const RecentPaymentsTable = ({ delay = 0 }) => {
  const navigate = useNavigate();
  const { data: paymentsRes, isLoading } = useGetMonthlyPaymentsQuery();

  const payments = useMemo(() => {
    const list = Array.isArray(paymentsRes?.data) ? paymentsRes.data : Array.isArray(paymentsRes) ? paymentsRes : [];
    return list
      .sort((a, b) => new Date(b.paymentDate || b.createdAt || 0) - new Date(a.paymentDate || a.createdAt || 0))
      .slice(0, 6);
  }, [paymentsRes]);

  return (
    <RecentTable
      title="Recent Payments"
      subtitle="Latest transactions"
      icon={CreditCard}
      items={payments}
      isLoading={isLoading}
      viewAllPath="/payments"
      delay={delay}
      columns={{
        gridClass: 'grid grid-cols-[1fr_80px_70px] gap-3 items-center px-3 py-2.5',
        header: ['Student', 'Amount', 'Status'],
        render: (p) => (
          <>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold shrink-0">
                {(p.student?.name || p.studentName || 'S').charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {p.student?.name || p.studentName || 'Unknown'}
              </p>
            </div>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">{formatCurrency(p.amount)}</span>
            <Badge variant={p.status === 'PAID' ? 'success' : 'destructive'} className="text-[11px] font-extrabold px-2 py-0.5 w-fit">
              {p.status || '\u2014'}
            </Badge>
          </>
        ),
      }}
    />
  );
};

const RecentTables = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <RecentStudentsTable delay={0.45} />
    <RecentPaymentsTable delay={0.5} />
  </div>
);

export { RecentStudentsTable, RecentPaymentsTable, RecentTables };
export default React.memo(RecentTables);

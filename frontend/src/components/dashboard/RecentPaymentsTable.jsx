import React, { useMemo } from 'react';
import { CreditCard, ChevronRight } from 'lucide-react';
import { useGetMonthlyPaymentsQuery } from '../../store/adminApiSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/skeleton';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState';

const TableSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 py-2">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <Skeleton className="h-3.5 flex-1 rounded" />
        <Skeleton className="h-3.5 w-16 rounded" />
        <Skeleton className="h-3.5 w-12 rounded" />
      </div>
    ))}
  </div>
);

const RecentPaymentsTable = ({ formatCurrency }) => {
  const navigate = useNavigate();
  const { data: paymentsRes, isLoading } = useGetMonthlyPaymentsQuery();

  const payments = useMemo(() => {
    const list = Array.isArray(paymentsRes?.data) ? paymentsRes.data : Array.isArray(paymentsRes) ? paymentsRes : [];
    return list
      .sort((a, b) => new Date(b.paymentDate || b.createdAt || 0) - new Date(a.paymentDate || a.createdAt || 0))
      .slice(0, 8);
  }, [paymentsRes]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.45 }}
      className="h-full"
    >
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden h-full">
        <CardHeader className="pb-2 pt-5 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
                <CreditCard size={16} className="text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent Payments</CardTitle>
                <CardDescription className="text-[11px]">Latest payment records</CardDescription>
              </div>
            </div>
            <button
              onClick={() => navigate('/payments')}
              className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              aria-label="View all payments"
            >
              View All <ChevronRight size={12} />
            </button>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {isLoading ? (
            <TableSkeleton />
          ) : payments.length > 0 ? (
            <div className="space-y-0.5">
              <div className="grid grid-cols-[1fr_90px_80px_70px] gap-2 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Student</span>
                <span>Amount</span>
                <span>Date</span>
                <span>Status</span>
              </div>
              {payments.map((p, i) => (
                <motion.div
                  key={p._id || i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.03 }}
                  className="grid grid-cols-[1fr_90px_80px_70px] gap-2 items-center px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {(p.student?.name || p.studentName || 'S').charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                      {p.student?.name || p.studentName || 'Unknown'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{formatCurrency(p.amount)}</span>
                  <span className="text-[11px] text-slate-500">
                    {p.paymentDate
                      ? new Date(p.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : '—'}
                  </span>
                  <Badge variant={p.status === 'PAID' ? 'success' : 'destructive'} className="text-[9px] w-fit">
                    {p.status || 'Unknown'}
                  </Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState title="No payments yet" description="Payment records will appear here" />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(RecentPaymentsTable);

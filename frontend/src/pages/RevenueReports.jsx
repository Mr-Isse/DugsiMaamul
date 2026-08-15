import React, { useMemo } from 'react';
import { TrendingUp, DollarSign, CalendarDays, CircleDollarSign, ArrowUpRight, BadgeCheck, Clock3 } from 'lucide-react';
import { useGetMonthlyPaymentsQuery, useGetPaymentStatsQuery } from '../store/adminApiSlice';
import { Skeleton } from '../components/ui/skeleton';
import { MonthlyRevenueLine, CollectedVsPendingStack, RevenueByBranchPie, TopClassesHorizontal } from '../components/charts/RevenueCharts';

function RevenueReports() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const { data: statsPayload, isLoading: loadingStats } = useGetPaymentStatsQuery({ month: currentMonth, year: currentYear });
  const { data: paymentsPayload, isLoading: loadingPayments } = useGetMonthlyPaymentsQuery({ month: currentMonth, year: currentYear });
  const isLoading = loadingStats || loadingPayments;

  const stats = statsPayload || {};
  const payments = useMemo(() => {
    if (Array.isArray(paymentsPayload?.data)) return paymentsPayload.data;
    if (Array.isArray(paymentsPayload)) return paymentsPayload;
    return [];
  }, [paymentsPayload]);

  const totalExpected = Number(stats.totalAmount || stats.totalFeeAmount || stats.expectedAmount || 0);
  const paidAmount = Number(stats.paidAmount || stats.totalPaid || stats.paid || 0);
  const pendingAmount = Math.max(0, totalExpected - paidAmount);
  const collectionRate = totalExpected > 0 ? Math.round((paidAmount / totalExpected) * 100) : 0;
  const paidCount = payments.filter((payment) => payment.status === 'PAID').length;
  const pendingCount = payments.filter((payment) => payment.status !== 'PAID').length;
  const chartMax = Math.max(totalExpected || 1, paidAmount || 1, pendingAmount || 1);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <PageHeaderSkeleton />
        <StatsGridSkeleton count={3} />
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <ChartSkeleton height={220} />
          <CardSkeleton />
        </div>
        <TableSkeleton rows={6} columns={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 tracking-tight">Revenue Reports</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">Live fee collection insights for the current period</p>
        </div>
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
          <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          Updated today
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700"><DollarSign size={20} /></div>
            <div>
              <p className="text-sm text-slate-500">Collected</p>
              <p className="text-xl font-bold text-slate-800">${paidAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-2 text-amber-700"><CircleDollarSign size={20} /></div>
            <div>
              <p className="text-sm text-slate-500">Outstanding</p>
              <p className="text-xl font-bold text-slate-800">${pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-2 text-indigo-700"><CalendarDays size={20} /></div>
            <div>
              <p className="text-sm text-slate-500">Collection Rate</p>
              <p className="text-xl font-bold text-slate-800">{collectionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-2 text-indigo-700"><TrendingUp size={20} /></div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Collection performance</h2>
              <p className="text-sm text-slate-500">A clear view of expected vs actual fee collection.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <MonthlyRevenueLine payments={payments} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <CollectedVsPendingStack payments={payments} expected={totalExpected} />
              </div>
              <div>
                <RevenueByBranchPie payments={payments} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700"><ArrowUpRight size={20} /></div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Quick summary</h2>
              <p className="text-sm text-slate-500">Highlights from the current billing cycle.</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <BadgeCheck size={16} />
                Paid successfully
              </div>
              <p className="mt-2 text-sm text-slate-600">{paidCount} students have completed their fees this month.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                <Clock3 size={16} />
                Follow-up needed
              </div>
              <p className="mt-2 text-sm text-slate-600">{pendingCount} fee entries still need attention before the cycle closes.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Top Paying Classes</h3>
              <TopClassesHorizontal payments={payments} />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800">Recent payments</h2>
        </div>
        {payments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No payment data for the selected period yet.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Student</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.slice(0, 8).map((payment) => (
                <tr key={payment._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-700">{payment.student?.name || payment.studentName || 'Student'}</td>
                  <td className="px-6 py-4 text-slate-700">${Number(payment.amount || 0).toLocaleString()}</td>
                  <td className="px-6 py-4"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${payment.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{payment.status || 'Pending'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default RevenueReports;

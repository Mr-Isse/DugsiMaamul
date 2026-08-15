import React, { useMemo } from 'react';
import { FileCheck, Plus, Loader2, DollarSign } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { useGenerateMonthlyPaymentsMutation, useGetMonthlyPaymentsQuery } from '../store/adminApiSlice';

function InvoicesManagement() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const { data: paymentsPayload, isLoading, refetch } = useGetMonthlyPaymentsQuery({ month: currentMonth, year: currentYear });
  const [generateMonthlyPayments, { isLoading: generating }] = useGenerateMonthlyPaymentsMutation();

  const invoices = useMemo(() => {
    if (Array.isArray(paymentsPayload?.data)) return paymentsPayload.data;
    if (Array.isArray(paymentsPayload)) return paymentsPayload;
    return [];
  }, [paymentsPayload]);

  const handleGenerateInvoices = async () => {
    try {
      await generateMonthlyPayments({ month: currentMonth, year: currentYear }).unwrap();
      toast.success('Invoices generated for the current month');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Could not generate invoices');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Invoices</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review generated fee invoices and billing status</p>
        </div>
        <button onClick={handleGenerateInvoices} disabled={generating} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold transition disabled:opacity-50">
          {generating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
          Generate Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500">Invoices</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{invoices.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500">Paid</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{invoices.filter((invoice) => invoice.status === 'PAID').length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500">Outstanding</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{invoices.filter((invoice) => invoice.status !== 'PAID').length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-6"><StatsGridSkeleton count={3} /><TableSkeleton rows={6} columns={5} /></div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16">
            <FileCheck className="mx-auto mb-4 text-slate-400" size={48} />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">No invoices yet</h3>
            <p className="text-slate-500 dark:text-slate-400">Generate a batch of invoices for the current month to populate this module.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Invoice</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Student</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {invoices.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30"><FileCheck size={18} /></div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">#{invoice.invoiceId || invoice._id?.slice(-6).toUpperCase()}</p>
                        <p className="text-sm text-slate-500">{invoice.month || invoice.paymentMonth || 'Current month'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{invoice.student?.name || invoice.studentName || 'Student'}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">${Number(invoice.amount || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {invoice.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default InvoicesManagement;

import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  CreditCard,
  Search,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Trash2,
  CalendarDays,
  ChevronDown,
  Users,
  RefreshCw,
  LayoutGrid,
  List,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Printer,
  Download,
  FileSpreadsheet,
  Settings,
  History,
  Zap,
  Globe
} from 'lucide-react';
import { PageLayout, PageHeader, ContentCard, StatsGrid2 } from '../components/PageLayout';
import { hasFeatureAccess } from '../utils/featureAccess';
import {
  useGetPaymentMonthsQuery,
  useGetMonthlyPaymentsQuery,
  useGetClassesQuery,
  useDeletePaymentMonthMutation,
  useMarkPaymentPaidMutation,
  useMarkPaymentUnpaidMutation,
  useGetStatsQuery,
  useGenerateMonthlyPaymentsMutation,
} from '../store/adminApiSlice';
import { MonthlyRevenueLine, RevenueByBranchPie } from '../components/charts/RevenueCharts';
import { Skeleton } from '../components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import ConfirmModal from '../components/ConfirmModal';
import PaymentSettingsPage from '../components/PaymentSettingsPage';
import TransactionHistory from '../components/TransactionHistory';
import PaymentModal from '../components/PaymentModal';

// ── Constants ─────────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];
const fmt = (n) => `$${Number(n || 0).toLocaleString()}`;

// ── Status Badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) =>
  status === 'PAID' ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      <CheckCircle size={11} /> PAID
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
      <XCircle size={11} /> UNPAID
    </span>
  );

// ── Main Component ─────────────────────────────────────────────────────────
const PaymentsManagement = () => {
  const [activeTab, setActiveTab]     = useState('payments');
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterMonth, setFilterMonth]   = useState(MONTHS[new Date().getMonth()]);
  const [filterYear, setFilterYear]     = useState(CURRENT_YEAR);
  const [filterClass, setFilterClass]   = useState('All Classes');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { userInfo } = useSelector(state => state.auth);
  const { selectedBranch } = useSelector((state) => state.branch);
  const hasPaymentIntegration = hasFeatureAccess(userInfo, 'payment-integration');

  // Reset tab if it was 'settings' and payment integration is now disabled
  useEffect(() => {
    if (activeTab === 'settings' && !hasPaymentIntegration) {
      setActiveTab('payments');
    }
  }, [activeTab, hasPaymentIntegration]);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger',
    confirmText: 'Confirm'
  });

  // Queries
  const { data: statsData, refetch: refetchStats } = useGetStatsQuery();
  const { data: classes }      = useGetClassesQuery();
  const { data: paymentMonths, isLoading: monthsLoading, refetch: refetchMonths } = useGetPaymentMonthsQuery({
    classId: filterClass !== 'All Classes' ? filterClass : undefined,
    status: filterStatus !== 'All Status' ? filterStatus : undefined,
  });
  const { data: allPayments, isLoading: paymentsLoading, refetch: refetchPayments } = useGetMonthlyPaymentsQuery({
    month: filterMonth !== 'All Months' ? filterMonth : undefined,
    year: filterYear,
    classId: filterClass !== 'All Classes' ? filterClass : undefined,
    status: filterStatus !== 'All Status' ? filterStatus : undefined,
  });

  // Mutations
  const [generateMonthlyPayments, { isLoading: isGenerating }] = useGenerateMonthlyPaymentsMutation();
  const [deletePaymentMonth] = useDeletePaymentMonthMutation();
  const [markPaid]           = useMarkPaymentPaidMutation();
  const [markUnpaid]         = useMarkPaymentUnpaidMutation();

  // Filtered payments (client-side search)
  const filteredPayments = useMemo(() => {
    if (!allPayments) return [];
    const s = search.toLowerCase();
    if (!s) return allPayments;
    return allPayments.filter(p =>
      p.student?.name?.toLowerCase().includes(s) ||
      p.student?.customId?.toLowerCase().includes(s)
    );
  }, [allPayments, search]);

  // KPI Calculations based on filtered data
  const kpis = useMemo(() => {
    if (!allPayments) return { expected: 0, collected: 0, unpaid: 0, rate: 0, studentCount: 0 };
    
    // We use allPayments (filtered by month/year/class/status from server) for KPIs
    const expected = allPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const collected = allPayments.filter(p => p.status === 'PAID').reduce((acc, p) => acc + (p.amount || 0), 0);
    const unpaid = allPayments.filter(p => p.status === 'UNPAID').reduce((acc, p) => acc + (p.amount || 0), 0);
    const rate = expected > 0 ? Math.round((collected / expected) * 100) : 0;
    const studentCount = new Set(allPayments.map(p => p.student?._id)).size;

    return { expected, collected, unpaid, rate, studentCount };
  }, [allPayments]);

  const handleGeneratePayments = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Generate Payment Records',
      message: `This will create payment records for all active students for ${filterMonth === 'All Months' ? MONTHS[new Date().getMonth()] : filterMonth} ${filterYear}. This action is critical as it affects financial records for all students. Continue?`,
      confirmText: 'Generate Now',
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await generateMonthlyPayments({
            month: filterMonth === 'All Months' ? MONTHS[new Date().getMonth()] : filterMonth,
            year: filterYear,
          }).unwrap();
          toast.success(res.message || 'Payments generated successfully');
          refetchPayments();
          refetchMonths();
          refetchStats();
        } catch (err) {
          toast.error(err?.data?.message || 'Failed to generate payments');
        }
      }
    });
  };

  const handleDeleteMonth = async (id, label) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Payment Month',
      message: `Delete "${label}" and all its student records? This action cannot be undone.`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deletePaymentMonth(id).unwrap();
          toast.success(`"${label}" deleted.`);
        } catch (err) {
          toast.error(err?.data?.message || 'Delete failed.');
        }
      }
    });
  };

  const handleMarkPaid = async (row) => {
    try {
      await markPaid({ id: row._id }).unwrap();
      toast.success(`${row.student?.name} marked PAID.`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed.');
    }
  };

  const handleMarkUnpaid = async (row) => {
    try {
      await markUnpaid(row._id).unwrap();
      toast.success(`${row.student?.name} reverted to UNPAID.`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed.');
    }
  };

  const exportData = (format) => {
    const data = filteredPayments.map(p => ({
      'Student ID': p.student?.customId,
      'Student Name': p.student?.name,
      'Class': p.student?.class?.name || 'N/A',
      'Month': `${p.month} ${p.year}`,
      'Amount': p.amount,
      'Status': p.status,
      'Date': p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : 'N/A'
    }));

    if (format === 'excel' || format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Payments");
      XLSX.writeFile(wb, `payments_export.${format === 'excel' ? 'xlsx' : 'csv'}`);
    } else if (format === 'pdf') {
      window.print();
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Payments Management"
        description="Automatic monthly fee charging and payment tracking"
        actions={
          <button
            onClick={handleGeneratePayments}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 transition-all text-sm"
          >
            <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
            Generate Payments
          </button>
        }
      />

      {/* Automatic Billing Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 flex gap-4 items-start">
        <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Automatic Monthly Billing Active</h4>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
            The system automatically generates payment records on the 1st of every month for all active students using their assigned monthly fee. Use the "Generate Payments" button to manually trigger for this month.
          </p>
        </div>
      </div>

      <StatsGrid2>
        {[
          { label: 'Expected Revenue', value: fmt(kpis.expected), icon: CreditCard, color: 'blue' },
          { label: 'Collected', value: fmt(kpis.collected), sub: `${kpis.studentCount} students`, icon: TrendingUp, color: 'emerald' },
          { label: 'Unpaid Balance', value: fmt(kpis.unpaid), sub: `${allPayments?.filter(p => p.status === 'UNPAID').length || 0} students`, icon: TrendingDown, color: 'red' },
          { label: 'Collection Rate', value: `${kpis.rate}%`, sub: `${allPayments?.length || 0} total`, icon: Users, color: 'indigo' },
        ].map((kpi, idx) => (
          <ContentCard key={idx} className="p-6" padding={false}>
            <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-${kpi.color}-50 dark:bg-${kpi.color}-900/20 text-${kpi.color}-600 dark:text-${kpi.color}-400`}>
              <kpi.icon size={24} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none">{kpi.value}</h3>
            {kpi.sub && <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">{kpi.sub}</p>}
          </ContentCard>
        ))}
      </StatsGrid2>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Monthly Collection Trend</h3>
          {paymentsLoading ? <Skeleton className="h-40 w-full" /> : <MonthlyRevenueLine payments={allPayments || []} />}
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Revenue By Branch</h3>
          {paymentsLoading ? <Skeleton className="h-40 w-full" /> : <RevenueByBranchPie payments={allPayments || []} />}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Month</label>
            <select 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500/50 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
            >
              <option>All Months</option>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Year</label>
            <select 
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500/50 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
            >
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Class</label>
            <select 
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500/50 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
            >
              <option>All Classes</option>
              {classes?.map(c => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500/50 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
            >
              <option>All Status</option>
              <option value="PAID">PAID</option>
              <option value="UNPAID">UNPAID</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Student name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500/50 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl overflow-x-auto">
        {[
          { key: 'payments', label: 'Fee Management', icon: List },
          { key: 'months',   label: 'Payment Months', icon: LayoutGrid },
          { key: 'transactions', label: 'Transactions', icon: History },
          ...(hasPaymentIntegration ? [{ key: 'settings', label: 'Payment Settings', icon: Settings }] : []),
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === key
                ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'settings' ? (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <PaymentSettingsPage />
          </motion.div>
        ) : activeTab === 'transactions' ? (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <TransactionHistory />
          </motion.div>
        ) : activeTab === 'payments' ? (
          <motion.div
            key="payments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student Name</th>
                    {!selectedBranch && <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Branch</th>}
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Class</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Month</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {paymentsLoading ? (
                    <tr><td colSpan="7" className="py-12 text-center text-gray-400">Loading payments...</td></tr>
                  ) : filteredPayments.length === 0 ? (
                    <tr><td colSpan="7" className="py-12 text-center text-gray-400">No payment records found</td></tr>
                  ) : (
                    filteredPayments.map((row) => (
                      <tr key={row._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{row.student?.customId}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{row.student?.name}</td>
                        {!selectedBranch && (
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                              {row.branch?.name || 'Main Branch'}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 text-xs font-bold text-gray-500">{row.student?.class?.name}</td>
                        <td className="px-6 py-4 text-xs font-bold text-gray-500">{row.month} {row.year}</td>
                        <td className="px-6 py-4 text-sm font-black text-gray-900 dark:text-white">{fmt(row.amount)}</td>
                        <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {row.status === 'UNPAID' ? (
                              <button
                                onClick={() => handleMarkPaid(row)}
                                className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20"
                              >
                                Mark Paid
                              </button>
                            ) : (
                              <button
                                onClick={() => handleMarkUnpaid(row)}
                                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Revert
                              </button>
                            )}
                            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors" title="Print Receipt">
                              <Printer size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="months"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {monthsLoading ? (
              <div className="col-span-full py-12 text-center text-gray-400 font-bold uppercase tracking-widest">Loading payment months...</div>
            ) : !paymentMonths || paymentMonths.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400 font-bold uppercase tracking-widest">No payment months created yet</div>
            ) : (
              paymentMonths.map((pm) => {
                const rate = pm.totalStudents > 0 ? Math.round((pm.paidCount / pm.totalStudents) * 100) : 0;
                const selectedClassName = filterClass !== 'All Classes' ? classes?.find(c => c._id === filterClass)?.name : null;
                const displayLabel = selectedClassName ? `${pm.monthLabel} - ${selectedClassName}` : pm.monthLabel;

                return (
                  <div key={pm._id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm relative group overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        {!selectedBranch && (
                          <div className="flex items-center gap-1.5 mb-2 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg w-fit">
                            <Globe size={10} />
                            {pm.branch?.name || 'Main Branch'}
                          </div>
                        )}
                        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{displayLabel}</h3>
                        <p className="text-sm font-black text-indigo-600 mt-1">{fmt(pm.amount)}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteMonth(pm._id, pm.monthLabel)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <span>Collection Rate {filterStatus !== 'All Status' ? `(${filterStatus})` : ''}</span>
                        <span className="text-indigo-600">{rate}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${rate}%` }}
                          className="h-full bg-indigo-600 rounded-full"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl text-center">
                          <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Total</p>
                          <p className="text-sm font-black text-gray-900 dark:text-white">{pm.totalStudents}</p>
                        </div>
                        <div className={`bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded-xl text-center ${filterStatus === 'UNPAID' ? 'opacity-30' : ''}`}>
                          <p className="text-[8px] font-bold text-emerald-500 uppercase mb-1">Paid</p>
                          <p className="text-sm font-black text-emerald-600">{pm.paidCount}</p>
                        </div>
                        <div className={`bg-red-50 dark:bg-red-900/10 p-2 rounded-xl text-center ${filterStatus === 'PAID' ? 'opacity-30' : ''}`}>
                          <p className="text-[8px] font-bold text-rose-500 uppercase mb-1">Unpaid</p>
                          <p className="text-sm font-black text-red-600">{pm.unpaidCount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Section */}
      <div className="flex justify-end gap-3 pt-4">
        <button onClick={() => exportData('excel')} className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-all">
          <FileSpreadsheet size={16} /> Export Excel
        </button>
        <button onClick={() => exportData('csv')} className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-all">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </PageLayout>
  );
};

export default PaymentsManagement;

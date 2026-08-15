import { useState, useMemo } from 'react';
import {
  BarChart3, Plus, Search, TrendingUp, DollarSign,
  Users, GraduationCap, RefreshCw, Download,
} from 'lucide-react';
import { useToast } from '../components/ToastContainer';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetBIReportsQuery,
  useGenerateBIReportMutation,
  useGetExecutiveDashboardQuery,
  useGetKPIDashboardQuery,
  useGetFinancialAnalyticsQuery,
  useGetAcademicAnalyticsQuery,
  useGetComparativeReportsQuery,
} from '../store/adminApiSlice';

const REPORT_TYPES = ['Executive', 'Financial', 'Academic', 'Comparative', 'Custom'];

const STATUS_COLORS = {
  Generated: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Failed:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const fmtPct = (n) => `${(n || 0).toFixed(1)}%`;

const fmtDate = (d) => {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const ProgressBar = ({ label, value, max = 100, color = 'bg-indigo-500' }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-xs font-bold text-slate-900 dark:text-white">{value}%</span>
    </div>
    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, max)}%` }} />
    </div>
  </div>
);

const GenerateModal = ({ onClose }) => {
  const toast = useToast();
  const [reportType, setReportType] = useState('Executive');
  const [generateReport] = useGenerateBIReportMutation();

  const handleGenerate = async () => {
    try {
      await generateReport({ type: reportType }).unwrap();
      toast.success('Report generated');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to generate report');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Generate Report</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <span className="sr-only">Close</span>
            <span className="text-slate-400">&times;</span>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Report Type</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button onClick={handleGenerate}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              <Download size={16} /> Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BIDashboard = () => {
  const toast = useToast();
  const [showGenerate, setShowGenerate] = useState(false);

  const { data: reportsData, isLoading: reportsLoading } = useGetBIReportsQuery();
  const { data: execData, isLoading: execLoading } = useGetExecutiveDashboardQuery();
  const { data: kpiData } = useGetKPIDashboardQuery();
  const { data: financialData } = useGetFinancialAnalyticsQuery();
  const { data: academicData } = useGetAcademicAnalyticsQuery();
  const { data: comparativeData } = useGetComparativeReportsQuery();
  const { data: reportsListData, isLoading: listLoading } = useGetBIReportsQuery();

  const reports = reportsListData?.data || reportsListData?.reports || [];
  const exec = execData?.data || {};
  const kpis = kpiData?.data || kpiData?.kpis || [];
  const financial = financialData?.data || {};
  const academic = academicData?.data || {};
  const comparative = comparativeData?.data || comparativeData?.reports || [];

  const isLoading = reportsLoading || execLoading;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="text-indigo-600" size={28} />
            BI Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Executive summaries, KPIs, and performance analytics.
          </p>
        </div>
        <button onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
          <Plus size={16} /> Generate Report
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Revenue" value={fmt(exec.revenue || financial.totalRevenue || 0)} icon={DollarSign} color="bg-green-500" />
          <StatCard label="Students" value={exec.students || academic.totalStudents || 0} icon={Users} color="bg-blue-500" />
          <StatCard label="Attendance Rate" value={fmtPct(exec.attendanceRate || academic.attendanceRate || 0)} icon={TrendingUp} color="bg-indigo-500" />
          <StatCard label="Satisfaction" value={fmtPct(exec.satisfaction || 0)} icon={GraduationCap} color="bg-purple-500" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 size={18} /> KPI Overview
          </h2>
          {kpis.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No KPI data available.</p>
          ) : (
            <div className="space-y-4">
              {kpis.map((kpi, i) => (
                <ProgressBar key={kpi._id || i} label={kpi.name || kpi.label} value={kpi.value || kpi.percentage || 0}
                  color={kpi.color || 'bg-indigo-500'} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign size={18} /> Financial Summary
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Revenue</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{fmt(financial.totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Expenses</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{fmt(financial.totalExpenses)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Net Income</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">{fmt(financial.netIncome)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Budget Utilization</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{fmtPct(financial.budgetUtilization)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <GraduationCap size={18} /> Academic Overview
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Total Students</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{academic.totalStudents || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Average GPA</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{academic.averageGPA || '\u2014'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Pass Rate</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">{fmtPct(academic.passRate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Attendance Rate</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{fmtPct(academic.attendanceRate)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} /> Comparative Reports
          </h2>
          {comparative.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No comparative data available.</p>
          ) : (
            <div className="space-y-2">
              {comparative.map((c, i) => (
                <div key={c._id || i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{c.name || c.title}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{c.period || fmtDate(c.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Generated Reports</h2>
        </div>
        {listLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : reports.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <BarChart3 size={28} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No reports generated</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Click "Generate Report" to create your first report.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Generated</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reports.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{r.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{r.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{fmtDate(r.createdAt || r.generatedAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[r.status] || ''}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors ml-auto">
                        <Download size={14} /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showGenerate && <GenerateModal onClose={() => setShowGenerate(false)} />}
    </div>
  );
};

export default BIDashboard;

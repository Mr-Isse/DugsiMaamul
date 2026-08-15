import React, { useMemo, useCallback, lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  useGetStatsQuery,
  useGetSubscriptionSummaryQuery,
  useGetSchoolProfileStatusQuery,
} from '../store/adminApiSlice';
import { hasFeatureAccess } from '../utils/featureAccess';
import {
  Bell,
  RefreshCw,
  TrendingUp,
  Activity as ActivityIcon,
  Database,
  Clock,
  Zap,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Calendar,
  MessageCircle,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import OnboardingBanner from '../components/dashboard/OnboardingBanner';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import PlanUsage from '../components/dashboard/PlanUsage';
import EnterpriseKPISection from '../components/dashboard/EnterpriseKPISection';
import QuickActions from '../components/dashboard/QuickActions';
import SummaryCharts from '../components/dashboard/SummaryCharts';
import NotificationCenter from '../components/dashboard/NotificationCenter';
import SystemHealth from '../components/dashboard/SystemHealth';
import RecentTables from '../components/dashboard/RecentTables';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { PageLayout, SectionHeader } from '../components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../components/ui/chart';

const FinancialAnalytics = lazy(() => import('../components/dashboard/FinancialAnalytics'));
const HRPayrollWidget = lazy(() => import('../components/dashboard/HRPayrollWidget'));

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);

const Dashboard = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const { data: profileStatus } = useGetSchoolProfileStatusQuery();
  const {
    data: statsResponse,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useGetStatsQuery();
  const {
    data: subSummaryRes,
    isLoading: subLoading,
    isError: subError,
    refetch: refetchSub,
  } = useGetSubscriptionSummaryQuery();

  const stats = statsResponse;
  const subSummary = subSummaryRes?.data;
  const isLoading = statsLoading || subLoading;
  const hasError = statsError || subError;

  const showOnboardingBanner = useMemo(
    () =>
      profileStatus &&
      !profileStatus.onboarding?.isCompleted &&
      userInfo?.role === 'schooladmin',
    [profileStatus, userInfo?.role]
  );

  const handleRefresh = useCallback(() => {
    refetchStats();
    refetchSub();
  }, [refetchStats, refetchSub]);

  const showFinance = hasFeatureAccess(userInfo, 'finance');
  const showPayroll = hasFeatureAccess(userInfo, 'payroll');

  return (
    <PageLayout className="!max-w-full !px-0 !space-y-8 sm:!space-y-10">
      {/* Dashboard Hero Header (Welcome) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5"
      >
        <div className="space-y-2 min-w-0">
          <h1 className="text-[28px] sm:text-[32px] lg:text-[34px] font-black tracking-[-0.025em] text-slate-900 dark:text-slate-50 leading-[1.15]">
            Welcome back, {userInfo?.firstName || userInfo?.name || 'Admin'} 👋
          </h1>
          <p className="text-[15px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
            Here's what's happening in {userInfo?.school?.name || 'your school'} today.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="lg"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-11 rounded-2xl border-slate-200 dark:border-slate-800 gap-2 px-4 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm"
            aria-label="Refresh dashboard data"
          >
            <RefreshCw size={17} strokeWidth={2.2} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Onboarding (preserved logic & localStorage dismiss) */}
      {showOnboardingBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <OnboardingBanner onNavigate={navigate} />
        </motion.div>
      )}

      {/* Global error state */}
      {hasError && (
        <Alert variant="destructive" className="border-rose-200 dark:border-rose-800">
          <Bell size={18} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <AlertTitle className="font-bold text-sm">Failed to load dashboard data</AlertTitle>
            <AlertDescription className="text-xs mt-0.5">
              There was a problem fetching your latest information.
            </AlertDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="shrink-0 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30"
          >
            Try Again
          </Button>
        </Alert>
      )}

      {/* KPI CARDS - Using EnterpriseKPISection with real backend data */}
      <EnterpriseKPISection userInfo={userInfo} />

      {/* Quick Actions (below KPIs) */}
      <QuickActions userInfo={userInfo} />

      {/* Section: Executive Analytics */}
      <SectionHeader
        icon={TrendingUp}
        title="Overview Analytics"
        description="Insights across attendance, enrollment & revenue performance"
      />

      {/* Summary Charts (Area / Line / Bar) with real backend data */}
      <SummaryCharts />

      {/* Finance + HR lazy widgets (preserved feature gating) */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {showFinance && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card p-5">
                <Skeleton className="h-5 w-40 mb-4 rounded" />
                <Skeleton className="h-56 w-full rounded-xl" />
              </div>
            )}
            {showPayroll && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card p-5">
                <Skeleton className="h-5 w-40 mb-4 rounded" />
                <Skeleton className="h-56 w-full rounded-xl" />
              </div>
            )}
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {showFinance && <FinancialAnalytics formatCurrency={formatCurrency} />}
          {showPayroll && <HRPayrollWidget formatCurrency={formatCurrency} />}
        </div>
      </Suspense>

      {/* Section: Activity & Notifications */}
      <SectionHeader
        icon={ActivityIcon}
        title="Activity & Notifications"
        description="Recent actions across your organization"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTimeline
          recentActions={stats?.recentActions || []}
          isLoading={isLoading}
        />
        <NotificationCenter />
      </div>

      {/* Section: Recent Data */}
      <SectionHeader
        icon={Database}
        title="Recent Records"
        description="Latest student admissions and payment transactions"
      />
      <RecentTables />

      {/* Section: System Health + Plan Usage */}
      <SectionHeader
        icon={Clock}
        title="Operations & Plan"
        description="System status and subscription usage overview"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemHealth />
        <PlanUsage
          subSummary={subSummary}
          onNavigate={navigate}
          isLoading={subLoading}
        />
      </div>
    </PageLayout>
  );
};

export default Dashboard;
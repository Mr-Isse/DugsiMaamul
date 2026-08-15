import React from 'react';
import { useGetDashboardStatsQuery, useGetBusinessAnalyticsQuery, useGetSystemHealthQuery } from '../../store/superAdminApiSlice';
import { 
  Users, 
  School, 
  CreditCard, 
  TrendingUp, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Server,
  Database,
  ShieldCheck,
  MessageSquare,
  Zap,
  UserCog,
  ClipboardList,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, subValue, icon: Icon, variant = 'default', trend, isLoading }) => {
  const navigate = useNavigate();
  if (isLoading) return <Skeleton className="h-32 w-full rounded-2xl" />;

  const variants = {
    default: "from-blue-500 to-indigo-600",
    success: "from-emerald-500 to-teal-600",
    warning: "from-amber-500 to-orange-600",
    dark: "from-slate-700 to-slate-900",
    purple: "from-violet-500 to-fuchsia-600",
  };

  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg shadow-indigo-500/20", variants[variant] || variants.default)}>
            <Icon size={22} className="text-white" />
          </div>
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full",
              trend > 0 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : "text-rose-600 bg-rose-50 dark:bg-rose-500/10"
            )}>
              {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="mt-6">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
            {subValue && <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{subValue}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const QuickActionCard = ({ title, description, icon: Icon, href, color }) => {
  const navigate = useNavigate();
  return (
    <Card 
      className="border-none shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
      onClick={() => navigate(href)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0",
                color
              )}>
                <Icon size={18} />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white truncate">{title}</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
          </div>
          <ArrowUpRight size={18} className="text-slate-400 group-hover:text-indigo-600 group-hover:-translate-y-1 transition-all shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};

const SystemHealthCard = ({ health, isLoading }) => {
  return (
    <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
          <Server size={16} className="text-indigo-600 dark:text-indigo-400" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <Database size={16} className="text-indigo-500" />
                </div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Database</span>
              </div>
              <Badge variant={health?.database === 'Healthy' ? 'success' : 'destructive'} className="font-black">{health?.database || 'Unknown'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <Activity size={16} className="text-indigo-500" />
                </div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Uptime</span>
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white">{health?.uptime || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <ShieldCheck size={16} className="text-emerald-500" />
                </div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Security</span>
              </div>
              <Badge variant="success" className="font-black">Secured</Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: analytics, isLoading: analyticsLoading } = useGetBusinessAnalyticsQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: health, isLoading: healthLoading } = useGetSystemHealthQuery(undefined, { refetchOnMountOrArgChange: true });

  const isLoading = statsLoading || analyticsLoading || healthLoading;

  const quickLinks = [
    { title: 'Schools', description: 'Manage institutions', icon: School, href: '/admin/schools', color: 'bg-blue-500' },
    { title: 'Admins', description: 'Admin management', icon: UserCog, href: '/admin/admins', color: 'bg-violet-500' },
    { title: 'Subscriptions', description: 'Plan management', icon: ClipboardList, href: '/admin/subscriptions', color: 'bg-emerald-500' },
    { title: 'Plans', description: 'Pricing tiers', icon: CreditCard, href: '/admin/plans', color: 'bg-amber-500' },
    { title: 'Leads', description: 'Sales funnel', icon: Users, href: '/admin/leads', color: 'bg-rose-500' },
    { title: 'Support', description: 'Ticket system', icon: MessageSquare, href: '/admin/tickets', color: 'bg-cyan-500' },
    { title: 'Features', description: 'Platform toggles', icon: Zap, href: '/admin/features', color: 'bg-fuchsia-500' },
    { title: 'System', description: 'Settings & config', icon: Settings, href: '/admin/system', color: 'bg-slate-700' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Command Center</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Global platform overview and quick access</p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Schools" 
          value={analytics?.summary?.totalSchools ?? 0} 
          subValue={`Active: ${analytics?.summary?.activeSchools ?? 0}`}
          icon={School} 
          variant="default"
          trend={12}
          isLoading={isLoading}
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${(stats?.revenue?.paid ?? 0).toLocaleString()}`}
          subValue="Lifetime"
          icon={TrendingUp} 
          variant="success"
          trend={8}
          isLoading={isLoading}
        />
        <StatCard 
          title="Active Users" 
          value={analytics?.summary?.activeUsersLast7d ?? 0} 
          subValue="Last 7 days"
          icon={Users} 
          variant="purple"
          trend={-2}
          isLoading={isLoading}
        />
        <StatCard 
          title="Total Students" 
          value={(stats?.platform?.totalStudents ?? 0).toLocaleString()} 
          subValue="Platform-wide"
          icon={Activity} 
          variant="dark"
          trend={15}
          isLoading={isLoading}
        />
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SystemHealthCard health={health} isLoading={healthLoading} />
        </div>
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                        <MessageSquare size={16} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Support</span>
                    </div>
                    <Badge variant="default" className="font-black">{analytics?.supportStats?.openTickets ?? 0}</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Pending</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{analytics?.supportStats?.pendingTickets ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Resolved (30d)</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-500">{analytics?.supportStats?.resolvedLast30d ?? 0}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-indigo-500/20"
                    onClick={() => navigate('/admin/tickets')}
                  >
                    Manage Support
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                        <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Leads</span>
                    </div>
                    <Badge variant="default" className="font-black">{analytics?.summary?.totalLeads ?? 0}</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Conversion</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-500">{analytics?.summary?.conversionRate || '0%'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">New</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{analytics?.summary?.totalLeads ?? 0}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-emerald-500/20"
                    onClick={() => navigate('/admin/leads')}
                  >
                    View Leads
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <LayoutDashboard size={16} />
          Quick Links
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <QuickActionCard key={link.href} {...link} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

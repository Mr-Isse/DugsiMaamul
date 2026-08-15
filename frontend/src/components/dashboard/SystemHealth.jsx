import React from 'react';
import {
  Server,
  Database,
  Wifi,
  HardDrive,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/skeleton';
import { useGetHealthDashboardQuery } from '../../store/adminApiSlice';
import { cn } from '../../lib/utils';

const STATUS_CONFIG = {
  healthy: { color: 'bg-emerald-500', badge: 'success', icon: CheckCircle2, label: 'Healthy' },
  degraded: { color: 'bg-amber-500', badge: 'warning', icon: AlertTriangle, label: 'Degraded' },
  down: { color: 'bg-rose-500', badge: 'destructive', icon: XCircle, label: 'Down' },
  unknown: { color: 'bg-slate-400', badge: 'secondary', icon: Clock, label: 'Unknown' },
};

const HealthItem = ({ label, status, icon: Icon, detail, index }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
    >
      <div className={cn('w-2 h-2 rounded-full shrink-0', config.color)} />
      <Icon size={16} className="text-slate-500 dark:text-slate-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{label}</p>
        {detail && (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{detail}</p>
        )}
      </div>
      <Badge variant={config.badge} className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 shrink-0">
        {config.label}
      </Badge>
    </motion.div>
  );
};

const HealthSkeleton = () => (
  <div className="space-y-1">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 py-2.5 px-3">
        <Skeleton className="h-2 w-2 rounded-full shrink-0" />
        <Skeleton className="h-4 w-4 rounded shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

const SystemHealth = () => {
  const { data: healthRes, isLoading } = useGetHealthDashboardQuery();
  const health = healthRes?.data;

  const items = [];

  if (health) {
    items.push({
      label: 'API Server',
      status: health.api?.status || 'unknown',
      icon: Server,
      detail: health.api?.uptime ? `Uptime: ${health.api.uptime}` : undefined,
    });
    items.push({
      label: 'Database',
      status: health.database?.status || 'unknown',
      icon: Database,
      detail: health.database?.responseTime ? `${health.database.responseTime}ms` : undefined,
    });
    items.push({
      label: 'Queue (BullMQ)',
      status: health.queue?.status || 'unknown',
      icon: Activity,
      detail: health.queue?.waiting ? `${health.queue.waiting} waiting` : undefined,
    });
    items.push({
      label: 'Redis Cache',
      status: health.cache?.status || 'unknown',
      icon: Wifi,
      detail: health.cache?.hitRate ? `${health.cache.hitRate}% hit rate` : undefined,
    });
    items.push({
      label: 'Storage (Cloudinary)',
      status: health.storage?.status || 'unknown',
      icon: HardDrive,
      detail: health.storage?.used ? `${health.storage.used} used` : undefined,
    });
  }

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card overflow-hidden">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
              <Server size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">System Health</CardTitle>
              <CardDescription className="text-xs mt-0.5">Service infrastructure status</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          <HealthSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) return null;

  const overallStatus = items.every((i) => i.status === 'healthy')
    ? 'healthy'
    : items.some((i) => i.status === 'down')
    ? 'down'
    : 'degraded';

  const overallConfig = STATUS_CONFIG[overallStatus];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card hover:shadow-card-hover transition-shadow duration-200 overflow-hidden">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                <Server size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">System Health</CardTitle>
                <CardDescription className="text-xs mt-0.5">Service infrastructure status</CardDescription>
              </div>
            </div>
            <Badge variant={overallConfig.badge} className="text-[11px] font-extrabold uppercase tracking-wider shrink-0">
              {overallConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          <div className="space-y-0.5">
            {items.map((item, i) => (
              <HealthItem key={item.label} {...item} index={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(SystemHealth);

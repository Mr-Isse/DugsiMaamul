import React, { useMemo, useCallback } from 'react';
import {
  Users,
  GraduationCap,
  Building2,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';

const UsageMetric = ({ label, current, limit, icon: Icon }) => {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : (current / limit) * 100;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 truncate">
            {label}
          </span>
        </div>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 tabular-nums shrink-0">
          {current} / {isUnlimited ? '∞' : limit}
        </span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${isUnlimited ? 5 : Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'h-full rounded-full',
            percentage > 90 ? 'bg-rose-500' : percentage > 70 ? 'bg-amber-500' : 'bg-indigo-600'
          )}
        />
      </div>
    </div>
  );
};

const PlanUsage = ({ subSummary, onNavigate, isLoading }) => {
  const plan = subSummary?.plan;
  const subscription = subSummary?.subscription;
  const usage = subSummary?.usage;

  const statusVariant = useMemo(() => {
    if (subscription?.status === 'Active') return 'success';
    if (subscription?.status === 'Expiring Soon') return 'warning';
    return 'destructive';
  }, [subscription?.status]);

  const handleUpgrade = useCallback(() => {
    if (onNavigate) onNavigate('/settings');
  }, [onNavigate]);

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2.5">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subSummary) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card hover:shadow-card-hover transition-shadow duration-200 overflow-hidden">
        <CardContent className="p-6 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm shadow-violet-500/20 shrink-0">
                <Sparkles size={22} className="text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
                  Plan Usage & Limits
                  <Badge variant={statusVariant} className="text-[11px] font-extrabold px-2.5 py-0.5 uppercase tracking-wider">
                    {subscription?.status || 'Unknown'}
                  </Badge>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Currently on{' '}
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {plan?.name || 'No Plan'}
                  </span>
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpgrade}
              className="shrink-0"
            >
              Upgrade Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <UsageMetric
              label="Students"
              current={usage?.students?.current || 0}
              limit={usage?.students?.limit ?? -1}
              icon={Users}
            />
            <UsageMetric
              label="Teachers"
              current={usage?.teachers?.current || 0}
              limit={usage?.teachers?.limit ?? -1}
              icon={GraduationCap}
            />
            <UsageMetric
              label="Branches"
              current={usage?.branches?.current || 0}
              limit={usage?.branches?.limit ?? -1}
              icon={Building2}
            />
            <UsageMetric
              label="Academic Years"
              current={usage?.academicYears?.current || 0}
              limit={usage?.academicYears?.limit ?? -1}
              icon={CalendarDays}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(PlanUsage);

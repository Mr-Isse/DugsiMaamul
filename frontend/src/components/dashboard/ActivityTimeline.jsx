import React, { useMemo } from 'react';
import {
  Users,
  Award,
  UserCheck,
  CreditCard,
  Calendar,
  Activity,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import EmptyState from './EmptyState';
import { ScrollArea } from '../ui/scroll-area';

const ACTION_ICON_MAP = {
  Student: Users,
  Marks: Award,
  Exam: Award,
  Attendance: UserCheck,
  Payment: CreditCard,
  Schedule: Calendar,
};

const ACTION_COLOR_MAP = {
  Student: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
  Marks: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40',
  Exam: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40',
  Attendance: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
  Payment: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
  Schedule: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40',
};

const getIconForAction = (action) => {
  for (const [key, Icon] of Object.entries(ACTION_ICON_MAP)) {
    if (action.includes(key)) return Icon;
  }
  return Activity;
};

const getColorForAction = (action) => {
  for (const [key, color] of Object.entries(ACTION_COLOR_MAP)) {
    if (action.includes(key)) return color;
  }
  return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800';
};

const timeAgo = (dateStr) => {
  if (!dateStr) { return ''; }
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) { return 'Just now'; }
  if (mins < 60) { return mins.toString() + 'm ago'; }
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) { return hrs.toString() + 'h ago'; }
  const days = Math.floor(hrs / 24);
  return days.toString() + 'd ago';
};

const ActivitySkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 py-3">
        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
        <Skeleton className="h-3 w-14 shrink-0 rounded" />
      </div>
    ))}
  </div>
);

const ActivityTimeline = ({ recentActions = [], isLoading }) => {
  const actions = useMemo(() => recentActions.slice(0, 8), [recentActions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card hover:shadow-card-hover transition-shadow duration-200 h-full overflow-hidden">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0">
              <Zap size={18} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">Recent Activity</CardTitle>
              <CardDescription className="text-xs mt-0.5">Latest system actions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {isLoading ? (
            <ActivitySkeleton />
          ) : actions.length > 0 ? (
            <ScrollArea className="h-[340px] pr-3 -mr-3">
              <div className="relative pl-5">
                <div className="absolute left-[19px] top-1 bottom-1 w-px bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-1">
                  {actions.map((item, i) => {
                    const Icon = getIconForAction(item.action);
                    const colorClass = getColorForAction(item.action);
                    return (
                      <motion.div
                        key={item.id || i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.04, duration: 0.3 }}
                        className="relative flex items-start gap-3 py-2.5 -ml-5 pl-5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className={`absolute left-0 top-3.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0 pl-12">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                            {item.action}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {item.user}{item.branch ? ` \u00B7 ${item.branch}` : ''}
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0 pt-0.5">
                          {timeAgo(item.datetime)}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          ) : (
            <EmptyState title="No recent activity" description="Actions will appear here as your team works" />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(ActivityTimeline);

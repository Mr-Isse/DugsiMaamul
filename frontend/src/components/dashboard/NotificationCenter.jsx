import React, { useMemo } from 'react';
import { Bell, CheckCircle2, MessageSquare, ChevronRight } from 'lucide-react';
import { useGetNotificationsQuery, useGetUnreadCountQuery } from '../../store/adminApiSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState';
import { Button } from '../ui/button';

const NotificationSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 py-2.5">
        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
        <Skeleton className="h-3 w-14 rounded" />
      </div>
    ))}
  </div>
);

const TYPE_ICON_COLORS = {
  success: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400' },
  error: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400' },
  info: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400' },
};

const NotificationCenter = () => {
  const navigate = useNavigate();
  const { data: unreadRes, isLoading: unreadLoading } = useGetUnreadCountQuery();
  const { data: notifRes, isLoading: notifLoading } = useGetNotificationsQuery();

  const isLoading = unreadLoading || notifLoading;
  const unreadCount = unreadRes?.data || 0;

  const notifications = useMemo(() => {
    const list = Array.isArray(notifRes) ? notifRes : Array.isArray(notifRes?.data) ? notifRes.data : [];
    return list.slice(0, 6);
  }, [notifRes]);

  const timeAgo = (dateStr) => {
    if (!dateStr) { return ''; }
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) { return 'Just now'; }
    if (mins < 60) { return mins.toString() + 'm ago'; }
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) { return hrs.toString() + 'h ago'; }
    return Math.floor(hrs / 24).toString() + 'd ago';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card hover:shadow-card-hover transition-shadow duration-200 overflow-hidden h-full">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center relative shrink-0">
                <Bell size={18} className="text-rose-600 dark:text-rose-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">Notifications</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/notifications')}
              className="h-8 shrink-0 gap-0.5 px-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:text-indigo-700 dark:hover:text-indigo-300"
              aria-label="View all notifications"
            >
              View All <ChevronRight size={14} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {isLoading ? (
            <NotificationSkeleton />
          ) : notifications.length > 0 ? (
            <ScrollArea className="h-[340px] pr-3 -mr-3">
              <div className="space-y-0.5">
                {notifications.map((n, i) => {
                  const typeKey = TYPE_ICON_COLORS[n.type] || TYPE_ICON_COLORS.info;
                  return (
                    <motion.div
                      key={n._id || i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.32 + i * 0.03 }}
                      className="flex items-start gap-3 py-2.5 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeKey.bg} ${typeKey.text}`}>
                        <MessageSquare size={18} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{n.title || n.message || 'Notification'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 leading-snug line-clamp-2">{n.message || n.body || ''}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 pt-1">
                        {n.status === 'unread' && (
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        )}
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{timeAgo(n.createdAt)}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="No notifications"
              description="You're all caught up!"
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(NotificationCenter);

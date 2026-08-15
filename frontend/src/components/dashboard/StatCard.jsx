import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/Card';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';

const GRADIENT_MAP = {
  blue: 'from-blue-500 to-blue-600',
  indigo: 'from-indigo-500 to-indigo-600',
  amber: 'from-amber-500 to-orange-500',
  emerald: 'from-emerald-500 to-teal-500',
  rose: 'from-rose-500 to-pink-500',
  cyan: 'from-cyan-500 to-sky-500',
  violet: 'from-violet-500 to-purple-500',
  default: 'from-slate-500 to-slate-600',
};

const StatCard = ({ title, value, icon: Icon, variant = 'default', subValue, trend, trendValue, isLoading, index = 0 }) => {
  if (isLoading) {
    return (
      <motion.div
        custom={index}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.4 }}
      >
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-3 flex-1">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-7 w-16 rounded-md" />
                <Skeleton className="h-3 w-28 rounded-md" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const gradient = GRADIENT_MAP[variant] || GRADIENT_MAP.default;

  return (
    <motion.div
      custom={index}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden group cursor-default">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {title}
              </p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                {value}
              </p>
              {subValue && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
                  {subValue}
                </p>
              )}
              {trendValue !== undefined && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-[11px] font-bold mt-1',
                    trend === 'up' && 'text-emerald-500',
                    trend === 'down' && 'text-rose-500',
                    !trend && 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  {trend === 'up' && <TrendingUp size={12} />}
                  {trend === 'down' && <TrendingDown size={12} />}
                  {!trend && <Minus size={12} />}
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            <div
              className={cn(
                'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-sm',
                'group-hover:scale-110 transition-transform duration-300',
                gradient
              )}
            >
              {Icon && <Icon size={20} className="text-white" />}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(StatCard);

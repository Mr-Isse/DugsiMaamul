import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { Skeleton } from './skeleton';
import { cn } from '../../lib/utils';

const variantGradients = {
  blue: 'from-blue-500 to-blue-600',
  indigo: 'from-indigo-500 to-indigo-600',
  violet: 'from-violet-500 to-purple-600',
  amber: 'from-amber-500 to-orange-500',
  emerald: 'from-emerald-500 to-teal-500',
  rose: 'from-rose-500 to-pink-500',
  cyan: 'from-cyan-500 to-sky-500',
  slate: 'from-slate-500 to-slate-600',
  fuchsia: 'from-fuchsia-500 to-pink-500',
  orange: 'from-orange-500 to-red-500',
};

const KpiCard = ({
  title,
  value,
  icon: Icon,
  variant = 'blue',
  subtitle,
  trend,
  trendValue,
  isLoading,
  index = 0,
  className,
  onClick,
}) => {
  const gradient = variantGradients[variant] || variantGradients.blue;

  if (isLoading) {
    return (
      <Card className={cn('border-none shadow-sm rounded-2xl overflow-hidden', className)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
            <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={onClick ? { y: -2, scale: 1.01 } : { y: -2 }}
      onClick={onClick}
      className={cn(onClick && 'cursor-pointer')}
    >
      <Card className={cn(
        'border-none shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden group',
        className
      )}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {title}
              </p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                {value}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {subtitle && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
                    {subtitle}
                  </p>
                )}
                {trendValue !== undefined && (
                  <Badge
                    variant={trend === 'up' ? 'success' : trend === 'down' ? 'destructive' : 'secondary'}
                    className="text-[10px] font-bold px-1.5 py-0 h-5 gap-0.5"
                  >
                    {trend === 'up' && <TrendingUp size={10} />}
                    {trend === 'down' && <TrendingDown size={10} />}
                    {!trend && <Minus size={10} />}
                    <span>{trendValue}</span>
                  </Badge>
                )}
              </div>
            </div>
            {Icon && (
              <div
                className={cn(
                  'w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-sm',
                  'group-hover:scale-110 group-hover:shadow-md transition-all duration-300',
                  gradient
                )}
              >
                <Icon size={21} className="text-white" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const KpiGrid = ({ children, columns = 4, className }) => (
  <div className={cn(
    'grid gap-4',
    {
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4': columns === 4,
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5': columns === 5,
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': columns === 3,
      'grid-cols-1 sm:grid-cols-2': columns === 2,
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-6': columns === 6,
    },
    className
  )}>
    {children}
  </div>
);

export { KpiCard, KpiGrid };
export default KpiCard;
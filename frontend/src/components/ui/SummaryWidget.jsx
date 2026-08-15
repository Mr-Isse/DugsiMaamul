import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './Card';
import { Skeleton } from './skeleton';
import { cn } from '../../lib/utils';

const SummaryWidget = ({
  title,
  description,
  icon,
  children,
  action,
  isLoading,
  delay = 0,
  className,
  contentClassName,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn('h-full', className)}
    >
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden h-full">
        {(title || description) && (
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {icon && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20 flex items-center justify-center shrink-0">
                    {React.isValidElement(icon) ? icon : React.createElement(icon, {
                      size: 15,
                      className: 'text-indigo-500 dark:text-indigo-400',
                    })}
                  </div>
                )}
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {title}
                  </CardTitle>
                  {description && (
                    <CardDescription className="text-[11px] mt-0.5">{description}</CardDescription>
                  )}
                </div>
              </div>
              {action && <div className="shrink-0">{action}</div>}
            </div>
          </CardHeader>
        )}
        <CardContent className={cn('px-5 pb-5', !title && !description && 'pt-5', contentClassName)}>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StatItem = ({ label, value, icon: Icon, color = 'text-slate-700 dark:text-slate-200', className }) => (
  <div className={cn('flex items-center justify-between py-2', className)}>
    <div className="flex items-center gap-2">
      {Icon && <Icon size={13} className="text-slate-400 shrink-0" />}
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
    </div>
    <span className={cn('text-sm font-extrabold', color)}>{value}</span>
  </div>
);

const StatDivider = () => (
  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
);

export { SummaryWidget, StatItem, StatDivider };
export default SummaryWidget;
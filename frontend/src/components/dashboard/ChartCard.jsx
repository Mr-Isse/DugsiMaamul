import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

const ChartCard = ({ title, description, icon: Icon, badge, children, className, headerRight, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    className="h-full"
  >
    <Card className={cn('rounded-2xl overflow-hidden h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card hover:shadow-card-hover transition-shadow duration-200', className)}>
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
            <div className="min-w-0">
              <CardTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">{title}</CardTitle>
              {description && <CardDescription className="text-xs mt-0.5 truncate">{description}</CardDescription>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {headerRight}
            {badge && <Badge variant="secondary" className="px-2 py-0.5">{badge}</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">{children}</CardContent>
    </Card>
  </motion.div>
);

export default React.memo(ChartCard);

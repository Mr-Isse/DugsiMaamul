import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const EmptyState = ({ icon: Icon, title, description, action, className }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    className={cn(
      'flex flex-col items-center justify-center py-10 px-6 text-center',
      className
    )}
  >
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon size={32} className="text-slate-400 dark:text-slate-500" />
      </div>
    )}
    <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1.5">{title}</h4>
    {description && (
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </motion.div>
);

export default React.memo(EmptyState);

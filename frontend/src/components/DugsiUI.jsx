import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';

export const DugsiPage = ({ children, className = '' }) => (
  <div className={cn('max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12', className)}>
    {children}
  </div>
);

export const DugsiHeader = ({ icon: Icon, title, description, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
        {Icon && <Icon className="text-indigo-600" size={32} />}
        {title}
      </h1>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">{description}</p>
      )}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
  </div>
);

export const DugsiButton = ({ children, className = '', accent = 'primary', ...props }) => {
  const accentClass = accent === 'amber'
    ? 'border-amber-200 dark:border-amber-900/50 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10'
    : accent === 'outline'
      ? 'border-indigo-200 dark:border-indigo-900/50 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
      : 'shadow-lg shadow-indigo-600/20';

  return (
    <Button
      variant={accent === 'primary' ? 'default' : 'outline'}
      className={cn('h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2', accentClass, className)}
      {...props}
    >
      {children}
    </Button>
  );
};

export const DugsiCard = ({ children, className = '', contentClassName = '' }) => (
  <Card className={cn('rounded-[2.5rem] border-none shadow-sm overflow-hidden', className)}>
    <CardContent className={cn('p-4 sm:p-6', contentClassName)}>{children}</CardContent>
  </Card>
);

export const DugsiStatCard = ({ icon: Icon, label, value, tone = 'indigo' }) => {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
    slate: 'bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400',
  };

  return (
    <DugsiCard>
      <div className="flex items-center gap-4">
        <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center', tones[tone] || tones.indigo)}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">{label}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </DugsiCard>
  );
};

export const DugsiEmptyState = ({ icon: Icon, title, description, minHeight = 'min-h-[320px]' }) => (
  <DugsiCard contentClassName={cn('flex flex-col items-center justify-center text-center', minHeight)}>
    {Icon && <Icon className="mb-5 text-slate-400" size={58} strokeWidth={2.2} />}
    <h3 className="text-xl font-black text-slate-900 dark:text-white">{title}</h3>
    {description && <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">{description}</p>}
  </DugsiCard>
);

export const DugsiLoading = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="animate-spin text-indigo-600" size={40} />
  </div>
);

export const dugsiFieldClass = 'w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500/30 rounded-2xl text-sm font-bold transition-all outline-none';
export const dugsiLabelClass = 'text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';
import { Skeleton } from './ui/skeleton';

const PageLayout = ({ children, className, breadcrumbs }) => (
  <div className={cn('space-y-8 pb-16 max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8', className)}>
    {breadcrumbs && (
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    )}
    {children}
  </div>
);

const PageHeader = ({ title, description, actions, icon, isLoading, delay = 0 }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {icon && <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />}
          <div className="space-y-3">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-5 w-48 rounded-xl" />
          </div>
        </div>
        {actions && <Skeleton className="h-12 w-40 rounded-xl" />}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center shadow-primary-md shrink-0">
            {React.createElement(icon, { size: 28, className: 'text-white' })}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-h2 sm:text-h1 font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-body-base text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </motion.div>
  );
};

const SectionHeader = ({ title, description, icon, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="flex items-center justify-between gap-4"
  >
    <div className="flex items-center gap-4 min-w-0">
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
          {React.createElement(icon, { size: 24, className: 'text-primary dark:text-primary-400' })}
        </div>
      )}
      <div className="min-w-0">
        <h2 className="text-h3 font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h2>
        {description && <p className="text-body-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
      </div>
    </div>
    {action && <div className="shrink-0 flex items-center gap-3 flex-wrap">{action}</div>}
  </motion.div>
);

const ContentCard = ({ children, className, hover = true, padding = "md" }) => {
  const paddingClasses = {
    sm: 'p-6',
    md: 'p-8',
    lg: 'p-10',
    xl: 'p-12',
  };
  
  return (
    <div
      className={cn(
        'bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-2xl shadow-card overflow-hidden',
        hover && 'transition-all duration-300 hover:shadow-card-hover',
        paddingClasses[padding] || paddingClasses.md,
        className
      )}
    >
      {children}
    </div>
  );
};

const StatsGrid2 = ({ children, columns = 4 }) => (
  <div className={cn(
    'grid gap-6',
    {
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4': columns === 4,
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5': columns === 5,
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': columns === 3,
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-6': columns === 6,
      'grid-cols-1 sm:grid-cols-2': columns === 2,
    }
  )}>
    {children}
  </div>
);

export { PageLayout, PageHeader, SectionHeader, ContentCard, StatsGrid2 };
export default PageLayout;

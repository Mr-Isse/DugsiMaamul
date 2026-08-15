import React from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from './ui/Table';
import { Button } from './ui/button';
import { Input } from './ui/Input';
import { Skeleton } from './ui/skeleton';
import EmptyState from './dashboard/EmptyState';
import { cn } from '../lib/utils';

const DataTable = ({
  columns,
  data,
  isLoading,
  error,
  emptyTitle = 'No data found',
  emptyDescription = 'No records to display',
  emptyAction,
  onRowClick,
  highlightRow,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden', className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key || col.header}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.key || col.header}>
                    <Skeleton className="h-4 w-full rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
        <EmptyState
          title="Error loading data"
          description="Something went wrong. Please try again."
          action={emptyAction}
        />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden', className)}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key || col.header} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={row._id || row.id || rowIndex}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'cursor-pointer',
                highlightRow?.(row) && 'bg-indigo-50 dark:bg-indigo-900/20'
              )}
            >
              {columns.map((col) => (
                <TableCell key={col.key || col.header} className={col.cellClassName}>
                  {col.render ? col.render(row, rowIndex) : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
};

const SearchInput = ({ value, onChange, placeholder = 'Search...', className }) => (
  <div className={cn('relative', className)}>
    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-9 h-10 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      >
        <X size={14} />
      </button>
    )}
  </div>
);

const FilterBar = ({ children, className }) => (
  <div className={cn('flex flex-wrap items-center gap-3', className)}>
    {children}
  </div>
);

const TableSkeleton2 = ({ columns = 4, rows = 5 }) => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: columns }).map((_, i) => (
            <TableHead key={i}>
              <Skeleton className="h-3 w-20 rounded" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: columns }).map((_, j) => (
              <TableCell key={j}>
                <Skeleton className="h-4 w-full rounded" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export { DataTable, SearchInput, FilterBar, TableSkeleton2 };
export default DataTable;

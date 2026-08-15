import React, { useState, useCallback } from 'react';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { Badge } from './Badge';
import { Separator } from './Separator';
import { cn } from '../../lib/utils';

const FilterSelect = ({ label, value, options, onChange, placeholder, className }) => (
  <div className={cn('space-y-1.5 min-w-0', className)}>
    {label && (
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
        {label}
      </label>
    )}
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-11 w-full rounded-xl bg-slate-50 dark:bg-slate-900 border-none font-semibold text-xs">
        <SelectValue placeholder={placeholder || `All ${label || ''}`} />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="all">All{label ? ` ${label}` : ''}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const FilterPanel = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  onReset,
  activeFilterCount,
  className,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReset = useCallback(() => {
    if (onReset) onReset();
  }, [onReset]);

  const hasActiveFilters = activeFilterCount > 0 || filters.some((f) => f.value && f.value !== 'all');

  return (
    <Card className={cn('rounded-2xl border-none shadow-sm overflow-hidden', className)}>
      <CardContent className="p-4 sm:p-5">
        {/* Primary search row */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-11 pl-10 rounded-xl bg-slate-50 dark:bg-slate-900 border-none font-semibold text-sm"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                'h-11 rounded-xl gap-2 font-semibold text-xs relative',
                isExpanded && 'bg-slate-100 dark:bg-slate-800'
              )}
            >
              <SlidersHorizontal size={14} />
              Filters
              {hasActiveFilters && (
                <Badge variant="default" className="h-5 min-w-[20px] px-1 text-[9px] font-bold">
                  {activeFilterCount || filters.filter((f) => f.value && f.value !== 'all').length}
                </Badge>
              )}
              <ChevronDown size={12} className={cn('transition-transform', isExpanded && 'rotate-180')} />
            </Button>

            {children}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-11 w-11 rounded-xl shrink-0"
                title="Reset filters"
              >
                <RotateCcw size={14} />
              </Button>
            )}
          </div>
        </div>

        {/* Expanded filter row */}
        <AnimatePresence>
          {isExpanded && filters.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Separator className="my-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {filters.map((filter, idx) => (
                  <FilterSelect
                    key={filter.key || idx}
                    label={filter.label}
                    value={filter.value}
                    options={filter.options}
                    onChange={filter.onChange}
                    placeholder={filter.placeholder}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export { FilterPanel, FilterSelect };
export default FilterPanel;
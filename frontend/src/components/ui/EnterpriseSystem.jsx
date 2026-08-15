import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

// Core UI Components
import { Card, CardHeader, CardContent } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Input } from './input';
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem, SelectSeparator } from './select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { KpiCard, KpiGrid } from './KpiCard';
import { Avatar } from './avatar';
import { Separator } from './separator';
import { ScrollArea, ScrollBar } from './scroll-area';
import { Checkbox } from './checkbox';
import { Label } from './label';
import { Switch } from './switch';
import { Textarea } from './textarea';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Progress } from './Progress';
import { Skeleton } from './skeleton';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { ToastProvider } from '../ToastContainer';
import { ErrorBoundary } from '../ErrorBoundary';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb';
import { Toast } from './toast';

// ─── Toaster (inline, no separate file needed) ───────────────────────────────
const Toaster = ({ toasts = [], onDismiss }) => (
  <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
    {toasts.map((t, i) => (
      <Toast
        key={t.id || i}
        {...t}
        onClose={() => onDismiss?.(t.id)}
        className="pointer-events-auto"
      />
    ))}
  </div>
);

// ─── EnterpriseDataTable ──────────────────────────────────────────────────────
const EnterpriseDataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data available.',
  className,
}) => {
  if (loading) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className={cn('w-full', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key || col.label}>{col.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-white/40">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow key={row.id || i}>
                {columns.map((col) => (
                  <TableCell key={col.key || col.label}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

// ─── EnterpriseFormField ──────────────────────────────────────────────────────
const EnterpriseFormField = ({
  label,
  id,
  required,
  error,
  hint,
  children,
  className,
}) => (
  <div className={cn('space-y-1.5', className)}>
    {label && (
      <Label htmlFor={id} className="text-sm font-medium text-white/80">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </Label>
    )}
    {children}
    {hint && !error && <p className="text-xs text-white/40">{hint}</p>}
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

// ─── EnterpriseModal ──────────────────────────────────────────────────────────
const EnterpriseModal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
}) => {
  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]',
  }[size] || 'max-w-lg';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('w-full', sizeClass)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-2">{children}</div>
        {footer && <div className="flex justify-end gap-2 pt-2">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
};

// ─── EnterpriseSheet ─────────────────────────────────────────────────────────
const EnterpriseSheet = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = 'right',
}) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side={side}>
      <SheetHeader>
        <SheetTitle>{title}</SheetTitle>
        {description && <SheetDescription>{description}</SheetDescription>}
      </SheetHeader>
      <div className="mt-4 overflow-y-auto">{children}</div>
    </SheetContent>
  </Sheet>
);

// ─── EnterpriseSearchBar ──────────────────────────────────────────────────────
const EnterpriseSearchBar = ({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}) => (
  <div className={cn('relative', className)}>
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none"
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <Input
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="pl-9"
    />
  </div>
);

// ─── EnterpriseStatusBadge ────────────────────────────────────────────────────
const EnterpriseStatusBadge = ({ status, className }) => {
  const variants = {
    active:   { label: 'Active',   variant: 'success' },
    inactive: { label: 'Inactive', variant: 'secondary' },
    pending:  { label: 'Pending',  variant: 'warning' },
    error:    { label: 'Error',    variant: 'destructive' },
    draft:    { label: 'Draft',    variant: 'outline' },
  };
  const cfg = variants[status?.toLowerCase()] || { label: status, variant: 'outline' };
  return <Badge variant={cfg.variant} className={className}>{cfg.label}</Badge>;
};

// ─── EnterpriseKpiDashboard ───────────────────────────────────────────────────
const EnterpriseKpiDashboard = ({ kpis = [], loading = false, className }) => {
  if (loading) {
    return (
      <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }
  return (
    <KpiGrid className={className}>
      {kpis.map((kpi, i) => (
        <KpiCard key={kpi.label || i} {...kpi} />
      ))}
    </KpiGrid>
  );
};

// ─── EnterpriseFilterBar ──────────────────────────────────────────────────────
const EnterpriseFilterBar = ({
  search,
  onSearchChange,
  filters = [],
  actions,
  className,
}) => (
  <div className={cn('flex flex-wrap items-center gap-3', className)}>
    {onSearchChange !== undefined && (
      <EnterpriseSearchBar
        value={search}
        onChange={onSearchChange}
        className="flex-1 min-w-[180px]"
      />
    )}
    {filters.map((f, i) => (
      <div key={i} className="min-w-[140px]">
        <Select value={f.value} onValueChange={f.onChange}>
          <SelectTrigger>
            <SelectValue placeholder={f.placeholder || 'Filter'} />
          </SelectTrigger>
          <SelectContent>
            {f.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ))}
    {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
  </div>
);

// ─── EnterprisePageHeader ─────────────────────────────────────────────────────
const EnterprisePageHeader = ({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}) => (
  <div className={cn('flex flex-col gap-1 pb-4 border-b border-white/10', className)}>
    {breadcrumbs && breadcrumbs.length > 0 && (
      <Breadcrumb className="mb-0">
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
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="text-sm text-white/50 mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  </div>
);

// ─── EnterprisePageLayout ─────────────────────────────────────────────────────
const EnterprisePageLayout = ({ title, description, breadcrumbs, actions, children, className }) => (
  <div className={cn('flex flex-col gap-6 p-6', className)}>
    <EnterprisePageHeader
      title={title}
      description={description}
      breadcrumbs={breadcrumbs}
      actions={actions}
    />
    {children}
  </div>
);

// ─── EnterpriseStatsGrid ──────────────────────────────────────────────────────
const EnterpriseStatsGrid = ({ stats = [], loading = false, className }) => (
  <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
    {loading
      ? Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))
      : stats.map((stat, i) => (
          <div
            key={stat.label || i}
            className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex flex-col gap-1"
          >
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">{stat.label}</span>
            <span className="text-2xl font-bold text-white">{stat.value ?? '—'}</span>
            {stat.sub && <span className="text-xs text-white/40">{stat.sub}</span>}
          </div>
        ))}
  </div>
);

// ─── EnterpriseFilterPanel ────────────────────────────────────────────────────
const EnterpriseFilterPanel = ({
  title = 'Filters',
  filters = [],
  onFilterChange,
  onReset,
  className,
}) => {
  const [values, setValues] = React.useState(() =>
    Object.fromEntries(filters.map((f) => [f.key, f.defaultValue || 'all']))
  );

  const handleChange = (key, val) => {
    const next = { ...values, [key]: val };
    setValues(next);
    onFilterChange?.({ [key]: val });
  };

  const handleReset = () => {
    const reset = Object.fromEntries(filters.map((f) => [f.key, f.defaultValue || 'all']));
    setValues(reset);
    onReset?.();
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 space-y-4',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <button
          onClick={handleReset}
          className="text-xs text-white/40 hover:text-white transition-colors"
        >
          Reset
        </button>
      </div>
      {filters.map((f) => (
        <div key={f.key} className="space-y-1.5">
          <Label className="text-xs text-white/60">{f.label}</Label>
          {f.type === 'select' ? (
            <Select
              value={values[f.key]}
              onValueChange={(val) => handleChange(f.key, val)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={f.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {(f.options || []).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={values[f.key] || ''}
              onChange={(e) => handleChange(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="h-8 text-xs"
            />
          )}
        </div>
      ))}
    </div>
  );
};

// ─── EnterpriseTable ──────────────────────────────────────────────────────────
const EnterpriseTable = ({
  title,
  columns = [],
  data = [],
  loading = false,
  onEdit,
  onView,
  onDelete,
  onAdd,
  onExport,
  onSelect,
  selectedRows = [],
  emptyMessage = 'No data available.',
  customActions,
  className,
}) => {
  const [search, setSearch] = React.useState('');

  const filtered = search
    ? data.filter((row) =>
        columns.some((col) =>
          String(row[col.key] ?? '').toLowerCase().includes(search.toLowerCase())
        )
      )
    : data;

  return (
    <div className={cn('rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden', className)}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <EnterpriseSearchBar
            value={search}
            onChange={setSearch}
            className="w-48"
          />
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              Export
            </Button>
          )}
          {onAdd && (
            <Button size="sm" onClick={onAdd}>
              + Add
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <EnterpriseDataTable
        columns={[
          ...columns,
          ...(onEdit || onView || onDelete || customActions
            ? [{
                key: '__actions',
                label: 'Actions',
                render: (_, row) => (
                  <div className="flex items-center gap-1">
                    {onView && (
                      <button
                        onClick={() => onView(row)}
                        className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        title="View"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="p-1 rounded hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                    {customActions?.(row)}
                  </div>
                ),
              }]
            : []),
        ]}
        data={filtered}
        loading={loading}
        emptyMessage={emptyMessage}
      />
    </div>
  );
};

// ─── EnterpriseSystem (root wrapper) ─────────────────────────────────────────
const EnterpriseSystem = ({ children, className }) => (
  <ErrorBoundary>
    <ToastProvider>
      <TooltipProvider>
        <div className={cn('min-h-screen bg-gray-950 text-white', className)}>
          {children}
        </div>
      </TooltipProvider>
    </ToastProvider>
  </ErrorBoundary>
);

// ─── Exports ──────────────────────────────────────────────────────────────────
export {
  EnterpriseSystem,
  EnterprisePageLayout,
  EnterpriseStatsGrid,
  EnterpriseTable,
  EnterpriseFilterPanel,
  EnterpriseDataTable,
  EnterpriseFormField,
  EnterpriseModal,
  EnterpriseSheet,
  EnterpriseSearchBar,
  EnterpriseStatusBadge,
  EnterpriseKpiDashboard,
  EnterpriseFilterBar,
  EnterprisePageHeader,
  Toaster,
  // re-export all primitives for convenience
  Card, CardHeader, CardContent,
  Button,
  Badge,
  Input,
  Select, SelectTrigger, SelectContent, SelectValue, SelectItem, SelectSeparator,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
  Tabs, TabsList, TabsTrigger, TabsContent,
  KpiCard, KpiGrid,
  Avatar,
  Separator,
  ScrollArea, ScrollBar,
  Checkbox,
  Label,
  Switch,
  Textarea,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
  Progress,
  Skeleton,
  Alert, AlertDescription, AlertTitle,
  Toast,
};

export default EnterpriseSystem;
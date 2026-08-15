import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const superAdminInputClass =
  'w-full px-4 py-3 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600';

export const superAdminBtnPrimary =
  'inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50';

export const superAdminBtnGhost =
  'inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-95';

export const superAdminBtnDanger =
  'inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl transition-all shadow-lg shadow-red-600/10 hover:shadow-red-600/20 active:scale-95 disabled:opacity-50';

/** Light, minimal page wrapper for super admin screens */
export function PageHeader({ title, subtitle, backTo, backLabel = 'Back', action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
      <div>
        {backTo && (
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-400 mb-3 uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        )}
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Panel({ children, className = '' }) {
  return (
    <div
      className={`bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/40 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-white/10',
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Field({ label, error, children }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest ml-1">{label}</label>
      )}
      {children}
      {error && <p className="text-xs font-bold text-red-500 ml-1">{error}</p>}
    </div>
  );
}

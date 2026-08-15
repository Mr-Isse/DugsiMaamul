import React, { useState } from 'react';
import { useGetEnterpriseActivityFeedQuery } from '../store/adminApiSlice';
import { Activity, User, Monitor, Clock, Sparkles } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

const ActivityCenter = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ action: '', module: '' });

  const { data, isLoading } = useGetEnterpriseActivityFeedQuery({ page, limit: 20, ...filter });
  const activities = data?.data || [];
  const pagination = data?.pagination || {};

  if (isLoading && page === 1) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-gray-100 bg-white shadow-sm">
        <RecentActionsSkeleton count={10} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
            <Activity size={24} className="text-indigo-600" />
            Activity Center
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">Live feed of actions across your institution</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm outline-none"
            value={filter.action}
            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
          </select>

          <select
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm outline-none"
            value={filter.module}
            onChange={(e) => setFilter({ ...filter, module: e.target.value })}
          >
            <option value="">All Modules</option>
            <option value="student">Students</option>
            <option value="payment">Payments</option>
            <option value="attendance">Attendance</option>
          </select>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        {activities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50 px-6 py-12 text-center text-gray-500">
            <Sparkles className="mx-auto mb-3 text-indigo-500" size={28} />
            <p>No recent activity.</p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {activities.map((act) => (
              <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-[.is-active]:bg-indigo-600 group-[.is-active]:text-indigo-50">
                  {act.action === 'login' ? <User size={16} /> : <Monitor size={16} />}
                </div>

                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:bg-gray-700/50">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                      {act.user?.name || 'System'}
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-700">{act.action}</span>
                    </div>
                    <time className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={12} /> {new Date(act.timestamp).toLocaleString()}
                    </time>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {act.details?.description || `Action on ${act.module} module`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600">Page {page} of {pagination.pages}</span>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCenter;

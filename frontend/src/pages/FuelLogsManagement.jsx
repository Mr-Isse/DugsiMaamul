import { useState, useMemo } from 'react';
import {
  Fuel, Plus, Search, X, RefreshCw, Droplets,
  TrendingUp, Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetFuelLogsQuery,
  useCreateFuelLogMutation,
  useGetTransportVehiclesQuery,
} from '../store/adminApiSlice';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0);

const fmtDate = (d) => {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const FuelLogModal = ({ onClose, vehicles }) => {
  const [form, setForm] = useState({
    vehicle: '',
    date: new Date().toISOString().split('T')[0],
    liters: '',
    cost: '',
    odometer: '',
    notes: '',
  });

  const [createFuelLog, { isLoading }] = useCreateFuelLogMutation();
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vehicle) return toast.error('Vehicle is required');
    if (!form.liters || Number(form.liters) <= 0) return toast.error('Enter valid liters');
    if (!form.cost || Number(form.cost) <= 0) return toast.error('Enter valid cost');
    try {
      await createFuelLog({ ...form, liters: Number(form.liters), cost: Number(form.cost), odometer: Number(form.odometer) || undefined }).unwrap();
      toast.success('Fuel log created');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create fuel log');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">New Fuel Log</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Vehicle *</label>
            <select value={form.vehicle} onChange={e => set('vehicle', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              <option value="">Select vehicle</option>
              {(vehicles || []).map(v => (
                <option key={v._id} value={v._id}>{v.name || v.plateNumber || v.registrationNumber}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Date *</label>
            <input type="date" required value={form.date}
              onChange={e => set('date', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Liters *</label>
              <input type="number" min="0" step="0.01" required value={form.liters}
                onChange={e => set('liters', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Cost *</label>
              <input type="number" min="0" step="0.01" required value={form.cost}
                onChange={e => set('cost', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Odometer (km)</label>
            <input type="number" min="0" value={form.odometer}
              onChange={e => set('odometer', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {isLoading ? 'Saving\u2026' : 'Save Fuel Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FuelLogsManagement = () => {
  const [filters, setFilters] = useState({ search: '', vehicle: '', page: 1 });
  const [showCreate, setShowCreate] = useState(false);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v, page: k !== 'page' ? 1 : v }));

  const queryArgs = useMemo(() => {
    const q = { page: filters.page, limit: 20 };
    if (filters.search)  q.search  = filters.search;
    if (filters.vehicle) q.vehicle = filters.vehicle;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetFuelLogsQuery(queryArgs);
  const { data: vehiclesData } = useGetTransportVehiclesQuery();

  const logs = data?.data || data?.fuelLogs || [];
  const total = data?.total || 0;
  const page = data?.page || filters.page;
  const pages = data?.pages || Math.ceil(total / 20) || 1;
  const vehicles = vehiclesData?.data || vehiclesData || [];

  const totalCost = logs.reduce((sum, l) => sum + (l.cost || 0), 0);
  const totalLiters = logs.reduce((sum, l) => sum + (l.liters || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Fuel className="text-orange-600" size={28} />
            Fuel Logs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Track vehicle fuel consumption and costs.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> Add Fuel Log
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Logs" value={total} icon={Fuel} color="bg-orange-500" />
          <StatCard label="Total Cost" value={fmt(totalCost)} icon={TrendingUp} color="bg-red-500" />
          <StatCard label="Total Liters" value={totalLiters.toFixed(1)} icon={Droplets} color="bg-blue-500" />
          <StatCard label="Avg Cost/Liter" value={fmt(totalLiters > 0 ? totalCost / totalLiters : 0)} icon={Calendar} color="bg-green-500" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={e => setF('search', e.target.value)}
              placeholder="Search fuel logs..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
          </div>
          <select value={filters.vehicle} onChange={e => setF('vehicle', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v._id} value={v._id}>{v.name || v.plateNumber || v.registrationNumber}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-4">
              <Fuel size={28} className="text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No fuel logs found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filters.search || filters.vehicle ? 'Try adjusting your filters.' : 'Click "Add Fuel Log" to record your first entry.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Vehicle</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Liters</th>
                  <th className="px-5 py-3.5 text-right">Cost</th>
                  <th className="px-5 py-3.5 text-right">Odometer</th>
                  <th className="px-5 py-3.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {log.vehicle?.name || log.vehicle?.plateNumber || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">{fmtDate(log.date)}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900 dark:text-white">{log.liters}</td>
                    <td className="px-5 py-3.5 text-right font-black text-slate-900 dark:text-white">{fmt(log.cost)}</td>
                    <td className="px-5 py-3.5 text-right text-sm text-slate-600 dark:text-slate-300">
                      {log.odometer ? `${log.odometer.toLocaleString()} km` : '\u2014'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                      {log.notes || '\u2014'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Page {page} of {pages} ({total} logs)
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setF('page', page - 1)}
                className="px-3 py-1.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Prev
              </button>
              <button disabled={page >= pages} onClick={() => setF('page', page + 1)}
                className="px-3 py-1.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreate && <FuelLogModal onClose={() => setShowCreate(false)} vehicles={vehicles} />}
    </div>
  );
};

export default FuelLogsManagement;

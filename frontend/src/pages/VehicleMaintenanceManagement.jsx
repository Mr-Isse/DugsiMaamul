import { useState, useMemo } from 'react';
import {
  Wrench, Plus, Search, Edit3, X, RefreshCw,
  CheckCircle, Clock, AlertCircle, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetVehicleMaintenanceQuery,
  useCreateVehicleMaintenanceMutation,
  useUpdateVehicleMaintenanceMutation,
  useGetTransportVehiclesQuery,
} from '../store/adminApiSlice';

const MAINTENANCE_TYPES = ['Oil Change', 'Tire Rotation', 'Brake Service', 'Engine Repair', 'Transmission', 'Battery', 'Inspection', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

const STATUS_STYLES = {
  Scheduled:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'In Progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Completed:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Cancelled:   'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const PRIORITY_STYLES = {
  Low:      'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  Medium:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  High:     'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

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

const MaintenanceModal = ({ initial, onClose, vehicles }) => {
  const [form, setForm] = useState({
    vehicle:         initial?.vehicle?._id || initial?.vehicle || '',
    maintenanceType: initial?.maintenanceType || 'Oil Change',
    date:            initial?.date ? new Date(initial.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    cost:            initial?.cost || '',
    priority:        initial?.priority || 'Medium',
    status:          initial?.status || 'Scheduled',
    description:     initial?.description || '',
  });

  const [createMaintenance, { isLoading: creating }] = useCreateVehicleMaintenanceMutation();
  const [updateMaintenance, { isLoading: updating }] = useUpdateVehicleMaintenanceMutation();

  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vehicle) return toast.error('Vehicle is required');
    try {
      const payload = { ...form, cost: form.cost ? Number(form.cost) : undefined };
      if (isEdit) {
        await updateMaintenance({ id: initial._id, ...payload }).unwrap();
        toast.success('Maintenance updated');
      } else {
        await createMaintenance(payload).unwrap();
        toast.success('Maintenance created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save maintenance record');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Maintenance' : 'New Maintenance'}
          </h2>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Type *</label>
              <select value={form.maintenanceType} onChange={e => set('maintenanceType', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Date *</label>
              <input type="date" required value={form.date}
                onChange={e => set('date', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Cost</label>
              <input type="number" min="0" step="0.01" value={form.cost}
                onChange={e => set('cost', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {creating || updating ? 'Saving\u2026' : 'Save Maintenance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const VehicleMaintenanceManagement = () => {
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', page: 1 });
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v, page: k !== 'page' ? 1 : v }));

  const queryArgs = useMemo(() => {
    const q = { page: filters.page, limit: 20 };
    if (filters.search)   q.search   = filters.search;
    if (filters.status)   q.status   = filters.status;
    if (filters.priority) q.priority = filters.priority;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetVehicleMaintenanceQuery(queryArgs);
  const { data: vehiclesData } = useGetTransportVehiclesQuery();

  const records = data?.data || data?.maintenance || [];
  const total = data?.total || 0;
  const page = data?.page || filters.page;
  const pages = data?.pages || Math.ceil(total / 20) || 1;
  const vehicles = vehiclesData?.data || vehiclesData || [];

  const scheduled = records.filter(r => r.status === 'Scheduled').length;
  const inProgress = records.filter(r => r.status === 'In Progress').length;
  const completed = records.filter(r => r.status === 'Completed').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Wrench className="text-blue-600" size={28} />
            Vehicle Maintenance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Track vehicle maintenance schedules and costs.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> Add Maintenance
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Records" value={total} icon={Wrench} color="bg-blue-500" />
          <StatCard label="Scheduled" value={scheduled} icon={Clock} color="bg-indigo-500" />
          <StatCard label="In Progress" value={inProgress} icon={AlertTriangle} color="bg-yellow-500" />
          <StatCard label="Completed" value={completed} icon={CheckCircle} color="bg-green-500" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={e => setF('search', e.target.value)}
              placeholder="Search maintenance..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
          </div>
          <select value={filters.status} onChange={e => setF('status', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.priority} onChange={e => setF('priority', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : records.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
              <Wrench size={28} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No maintenance records found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filters.search || filters.status || filters.priority
                ? 'Try adjusting your filters.'
                : 'Click "Add Maintenance" to create your first record.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Vehicle</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Cost</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map(rec => (
                  <tr key={rec._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {rec.vehicle?.name || rec.vehicle?.plateNumber || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">{rec.maintenanceType}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">{fmtDate(rec.date)}</td>
                    <td className="px-5 py-3.5 text-right font-black text-slate-900 dark:text-white">{fmt(rec.cost)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${PRIORITY_STYLES[rec.priority] || ''}`}>
                        {rec.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[rec.status] || ''}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditRecord(rec)} title="Edit"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                          <Edit3 size={16} />
                        </button>
                      </div>
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
              Page {page} of {pages} ({total} records)
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

      {showCreate && <MaintenanceModal onClose={() => setShowCreate(false)} vehicles={vehicles} />}
      {editRecord && <MaintenanceModal initial={editRecord} onClose={() => setEditRecord(null)} vehicles={vehicles} />}
    </div>
  );
};

export default VehicleMaintenanceManagement;

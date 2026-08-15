import { useState, useMemo } from 'react';
import {
  Building2, Plus, Search, Edit3, Trash2, X, Filter,
  Users, CheckCircle, AlertCircle, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetTeachersQuery,
} from '../store/adminApiSlice';

const STATUS_STYLES = {
  Active:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const TableSkeleton = ({ rows = 6, columns = 5 }) => (
  <div className="p-4 space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className={`h-4 ${j === 0 ? 'w-8' : j === columns - 1 ? 'w-16' : 'flex-1'}`} />
        ))}
      </div>
    ))}
  </div>
);

const DepartmentModal = ({ initial, onClose }) => {
  const [form, setForm] = useState({
    name:        initial?.name || '',
    code:        initial?.code || '',
    description: initial?.description || '',
    head:        initial?.head?._id || initial?.head || '',
    status:      initial?.status || 'Active',
  });

  const { data: teachersData } = useGetTeachersQuery();
  const teachers = Array.isArray(teachersData) ? teachersData : teachersData?.data || teachersData?.teachers || [];
  const [createDepartment, { isLoading: creating }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: updating }] = useUpdateDepartmentMutation();

  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Department name is required');
    if (!form.code.trim()) return toast.error('Department code is required');
    try {
      if (isEdit) {
        await updateDepartment({ id: initial._id, ...form }).unwrap();
        toast.success('Department updated');
      } else {
        await createDepartment(form).unwrap();
        toast.success('Department created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save department');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Department' : 'New Department'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              placeholder="e.g. Science Department"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Code *</label>
            <input value={form.code} onChange={e => set('code', e.target.value)} required
              placeholder="e.g. SCI"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Head of Department</label>
            <select value={form.head} onChange={e => set('head', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              <option value="">Select a teacher</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>{t.name || t.firstName} {t.lastName || ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {creating || updating ? 'Saving...' : 'Save Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ department, onClose }) => {
  const [deleteDepartment, { isLoading }] = useDeleteDepartmentMutation();

  const handleDelete = async () => {
    try {
      await deleteDepartment(department._id).unwrap();
      toast.success('Department deleted');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete department');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Delete Department</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-200">"{department.name}"</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DepartmentsManagement = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const queryArgs = useMemo(() => {
    const q = {};
    if (search) q.search = search;
    if (statusFilter) q.status = statusFilter;
    return q;
  }, [search, statusFilter]);

  const { data, isLoading, refetch } = useGetDepartmentsQuery(queryArgs);
  const departments = data?.data || data?.departments || (Array.isArray(data) ? data : []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Building2 className="text-indigo-600" size={28} />
            Departments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage organizational departments.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> Add Department
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search departments..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : departments.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <Building2 size={28} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No departments found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {search || statusFilter
                ? 'Try adjusting your filters.'
                : 'Click "Add Department" to create your first department.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Head</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {departments.map(dept => (
                  <tr key={dept._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{dept.name}</div>
                      {dept.description && (
                        <div className="text-xs text-slate-400 truncate max-w-[250px]">{dept.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        {dept.code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {dept.head?.name || dept.head?.firstName || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[dept.status] || ''}`}>
                        {dept.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditRecord(dept)} title="Edit"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => setDeleteRecord(dept)} title="Delete"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate   && <DepartmentModal onClose={() => setShowCreate(false)} />}
      {editRecord   && <DepartmentModal initial={editRecord} onClose={() => setEditRecord(null)} />}
      {deleteRecord && <DeleteModal department={deleteRecord} onClose={() => setDeleteRecord(null)} />}
    </div>
  );
};

export default DepartmentsManagement;

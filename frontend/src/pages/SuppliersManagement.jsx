import { useState, useMemo } from 'react';
import {
  Truck, Plus, Search, Edit3, Trash2, X, RefreshCw,
  CheckCircle, AlertCircle, Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} from '../store/adminApiSlice';

const CATEGORIES = ['Electronics', 'Furniture', 'Stationery', 'Food & Beverages', 'Cleaning', 'Uniforms', 'Sports', 'Technology', 'Maintenance', 'Other'];

const CATEGORY_COLORS = {
  'Electronics':        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Furniture':          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Stationery':         'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Food & Beverages':   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Cleaning':           'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Uniforms':           'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Sports':             'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Technology':         'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  'Maintenance':        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Other':              'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={14} className={i <= (rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'} />
    ))}
  </div>
);

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

const SupplierModal = ({ initial, onClose }) => {
  const [form, setForm] = useState({
    name:     initial?.name || '',
    contact:  initial?.contact || '',
    email:    initial?.email || '',
    phone:    initial?.phone || '',
    category: initial?.category || 'Other',
    rating:   initial?.rating || 3,
    address:  initial?.address || '',
  });

  const [createSupplier, { isLoading: creating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: updating }] = useUpdateSupplierMutation();

  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Supplier name is required');
    try {
      const payload = { ...form, rating: Number(form.rating) };
      if (isEdit) {
        await updateSupplier({ id: initial._id, ...payload }).unwrap();
        toast.success('Supplier updated');
      } else {
        await createSupplier(payload).unwrap();
        toast.success('Supplier created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save supplier');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Supplier' : 'New Supplier'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              placeholder="e.g. ABC Suppliers Ltd"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Contact Person</label>
              <input value={form.contact} onChange={e => set('contact', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Phone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Rating</label>
            <select value={form.rating} onChange={e => set('rating', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Address</label>
            <input value={form.address} onChange={e => set('address', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {creating || updating ? 'Saving\u2026' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ supplier, onClose }) => {
  const [deleteSupplier, { isLoading }] = useDeleteSupplierMutation();

  const handleDelete = async () => {
    try {
      await deleteSupplier(supplier._id).unwrap();
      toast.success('Supplier deleted');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete supplier');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Delete Supplier</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-200">"{supplier.name}"</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
            {isLoading ? 'Deleting\u2026' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SuppliersManagement = () => {
  const [filters, setFilters] = useState({ search: '', category: '', page: 1 });
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v, page: k !== 'page' ? 1 : v }));

  const queryArgs = useMemo(() => {
    const q = { page: filters.page, limit: 20 };
    if (filters.search)   q.search   = filters.search;
    if (filters.category) q.category = filters.category;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetSuppliersQuery(queryArgs);

  const suppliers = data?.data || data?.suppliers || [];
  const total = data?.total || 0;
  const page = data?.page || filters.page;
  const pages = data?.pages || Math.ceil(total / 20) || 1;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Truck className="text-orange-600" size={28} />
            Suppliers
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage your school suppliers and vendors.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> Add Supplier
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Suppliers" value={total} icon={Truck} color="bg-orange-500" />
          <StatCard label="Categories" value={CATEGORIES.length} icon={Truck} color="bg-blue-500" />
          <StatCard label="Top Rated" value={suppliers.filter(s => s.rating >= 4).length} icon={Star} color="bg-yellow-500" />
          <StatCard label="This Month" value={suppliers.length} icon={CheckCircle} color="bg-green-500" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={e => setF('search', e.target.value)}
              placeholder="Search suppliers..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
          </div>
          <select value={filters.category} onChange={e => setF('category', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : suppliers.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-4">
              <Truck size={28} className="text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No suppliers found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filters.search || filters.category
                ? 'Try adjusting your filters.'
                : 'Click "Add Supplier" to create your first supplier.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Rating</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {suppliers.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                      {s.email && <div className="text-xs text-slate-400">{s.email}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">{s.contact || '\u2014'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${CATEGORY_COLORS[s.category] || CATEGORY_COLORS.Other}`}>
                        {s.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5"><StarRating rating={s.rating} /></td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">{s.phone || '\u2014'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditRecord(s)} title="Edit"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => setDeleteRecord(s)} title="Delete"
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

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Page {page} of {pages} ({total} suppliers)
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

      {showCreate && <SupplierModal onClose={() => setShowCreate(false)} />}
      {editRecord && <SupplierModal initial={editRecord} onClose={() => setEditRecord(null)} />}
      {deleteRecord && <DeleteModal supplier={deleteRecord} onClose={() => setDeleteRecord(null)} />}
    </div>
  );
};

export default SuppliersManagement;

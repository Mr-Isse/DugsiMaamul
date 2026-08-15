import { useState, useMemo } from 'react';
import {
  Package, Plus, Search, Edit3, Trash2, X, RefreshCw, ArrowUpCircle, ArrowDownCircle,
  CheckCircle, AlertCircle, AlertTriangle, Boxes,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetInventoryItemsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
  useGetStockMovementsQuery,
  useCreateStockMovementMutation,
  useGetInventoryStatsQuery,
} from '../store/adminApiSlice';

const UNITS = ['pcs', 'kg', 'liters', 'boxes', 'packs', 'rolls', 'pairs', 'sets'];

const STATUS_STYLES = {
  InStock:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  LowStock:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  OutOfStock:'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0);

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

const ItemModal = ({ initial, onClose }) => {
  const [form, setForm] = useState({
    name:     initial?.name || '',
    code:     initial?.code || '',
    quantity: initial?.quantity ?? '',
    unit:     initial?.unit || 'pcs',
    unitPrice: initial?.unitPrice ?? '',
    lowStockThreshold: initial?.lowStockThreshold ?? '',
    description: initial?.description || '',
  });

  const [createItem, { isLoading: creating }] = useCreateInventoryItemMutation();
  const [updateItem, { isLoading: updating }] = useUpdateInventoryItemMutation();

  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Item name is required');
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity) || 0,
        unitPrice: Number(form.unitPrice) || 0,
        lowStockThreshold: Number(form.lowStockThreshold) || 0,
      };
      if (isEdit) {
        await updateItem({ id: initial._id, ...payload }).unwrap();
        toast.success('Item updated');
      } else {
        await createItem(payload).unwrap();
        toast.success('Item created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save item');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Item' : 'New Item'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Code</label>
              <input value={form.code} onChange={e => set('code', e.target.value)}
                placeholder="e.g. INV-001"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Quantity</label>
              <input type="number" min="0" value={form.quantity}
                onChange={e => set('quantity', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Unit</label>
              <select value={form.unit} onChange={e => set('unit', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Unit Price</label>
              <input type="number" min="0" step="0.01" value={form.unitPrice}
                onChange={e => set('unitPrice', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Low Stock Threshold</label>
            <input type="number" min="0" value={form.lowStockThreshold}
              onChange={e => set('lowStockThreshold', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
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
              {creating || updating ? 'Saving\u2026' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StockMovementModal = ({ onClose }) => {
  const [form, setForm] = useState({
    inventoryItem: '',
    type: 'in',
    quantity: '',
    reason: '',
  });

  const [createStockMovement, { isLoading }] = useCreateStockMovementMutation();
  const { data: itemsData } = useGetInventoryItemsQuery();
  const items = itemsData?.data || itemsData || [];

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.inventoryItem) return toast.error('Select an item');
    if (!form.quantity || Number(form.quantity) <= 0) return toast.error('Enter valid quantity');
    try {
      await createStockMovement({ ...form, quantity: Number(form.quantity) }).unwrap();
      toast.success('Stock movement recorded');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to record movement');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Stock Movement</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Item *</label>
            <select value={form.inventoryItem} onChange={e => set('inventoryItem', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              <option value="">Select item</option>
              {items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Type *</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Quantity *</label>
              <input type="number" min="1" required value={form.quantity}
                onChange={e => set('quantity', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Reason</label>
            <input value={form.reason} onChange={e => set('reason', e.target.value)}
              placeholder="e.g. New delivery, School use"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {isLoading ? 'Saving\u2026' : 'Record Movement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ item, onClose }) => {
  const [deleteItem, { isLoading }] = useDeleteInventoryItemMutation();

  const handleDelete = async () => {
    try {
      await deleteItem(item._id).unwrap();
      toast.success('Item deleted');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete item');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Delete Item</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-200">"{item.name}"</span>?
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

const InventoryManagement = () => {
  const [filters, setFilters] = useState({ search: '', page: 1 });
  const [showCreate, setShowCreate] = useState(false);
  const [showMovement, setShowMovement] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v, page: k !== 'page' ? 1 : v }));

  const queryArgs = useMemo(() => {
    const q = { page: filters.page, limit: 20 };
    if (filters.search) q.search = filters.search;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetInventoryItemsQuery(queryArgs);
  const { data: statsData } = useGetInventoryStatsQuery();

  const items = data?.data || data?.items || [];
  const total = data?.total || 0;
  const page = data?.page || filters.page;
  const pages = data?.pages || Math.ceil(total / 20) || 1;
  const stats = statsData?.data || statsData || {};

  const getStatus = (item) => {
    if (item.quantity <= 0) return 'OutOfStock';
    if (item.lowStockThreshold && item.quantity <= item.lowStockThreshold) return 'LowStock';
    return 'InStock';
  };

  const getStatusLabel = (s) => {
    if (s === 'OutOfStock') return 'Out of Stock';
    if (s === 'LowStock') return 'Low Stock';
    return 'In Stock';
  };

  const lowStockCount = items.filter(i => getStatus(i) === 'LowStock').length;
  const outOfStockCount = items.filter(i => getStatus(i) === 'OutOfStock').length;
  const totalValue = items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Package className="text-emerald-600" size={28} />
            Inventory Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Track inventory items, stock levels, and movements.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowMovement(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <ArrowUpCircle size={16} /> Stock Movement
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Items" value={total} icon={Package} color="bg-emerald-500" />
          <StatCard label="Low Stock" value={lowStockCount} icon={AlertTriangle} color="bg-yellow-500" />
          <StatCard label="Out of Stock" value={outOfStockCount} icon={AlertCircle} color="bg-red-500" />
          <StatCard label="Total Value" value={fmt(totalValue)} icon={Boxes} color="bg-blue-500" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={e => setF('search', e.target.value)}
              placeholder="Search inventory..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
              <Package size={28} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No inventory items found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filters.search ? 'Try adjusting your search.' : 'Click "Add Item" to create your first item.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5 text-right">Quantity</th>
                  <th className="px-5 py-3.5 text-right">Unit Price</th>
                  <th className="px-5 py-3.5 text-right">Value</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map(item => {
                  const status = getStatus(item);
                  return (
                    <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                        {item.description && <div className="text-xs text-slate-400 truncate max-w-[200px]">{item.description}</div>}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">{item.code || '\u2014'}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900 dark:text-white">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-5 py-3.5 text-right text-sm text-slate-600 dark:text-slate-300">{fmt(item.unitPrice)}</td>
                      <td className="px-5 py-3.5 text-right font-black text-slate-900 dark:text-white">
                        {fmt((item.quantity || 0) * (item.unitPrice || 0))}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[status] || ''}`}>
                          {getStatusLabel(status)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setEditRecord(item)} title="Edit"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => setDeleteRecord(item)} title="Delete"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Page {page} of {pages} ({total} items)
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

      {showCreate && <ItemModal onClose={() => setShowCreate(false)} />}
      {showMovement && <StockMovementModal onClose={() => setShowMovement(false)} />}
      {editRecord && <ItemModal initial={editRecord} onClose={() => setEditRecord(null)} />}
      {deleteRecord && <DeleteModal item={deleteRecord} onClose={() => setDeleteRecord(null)} />}
    </div>
  );
};

export default InventoryManagement;

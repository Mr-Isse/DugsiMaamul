import { useState, useMemo } from 'react';
import {
  Bed, Plus, Search, Edit3, Trash2, X, RefreshCw,
  CheckCircle, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetBedAllocationsQuery,
  useCreateBedAllocationMutation,
  useUpdateBedAllocationMutation,
  useDeleteBedAllocationMutation,
  useGetHostelsQuery,
  useGetHostelRoomsQuery,
  useGetStudentsQuery,
} from '../store/adminApiSlice';

const STATUSES = ['Active', 'Inactive', 'Reserved'];

const STATUS_STYLES = {
  Active:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  Reserved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
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

const AllocationModal = ({ initial, onClose, hostels, rooms, students }) => {
  const [selectedHostel, setSelectedHostel] = useState(initial?.hostel?._id || initial?.hostel || '');
  const [form, setForm] = useState({
    student: initial?.student?._id || initial?.student || '',
    room:    initial?.room?._id || initial?.room || '',
    bed:     initial?.bed || '',
    status:  initial?.status || 'Active',
  });

  const [createBedAllocation, { isLoading: creating }] = useCreateBedAllocationMutation();
  const [updateBedAllocation, { isLoading: updating }] = useUpdateBedAllocationMutation();

  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filteredRooms = useMemo(() => {
    if (!selectedHostel) return [];
    return (rooms || []).filter(r => {
      const hostelId = r.hostel?._id || r.hostel;
      return hostelId === selectedHostel;
    });
  }, [selectedHostel, rooms]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student) return toast.error('Student is required');
    if (!selectedHostel) return toast.error('Hostel is required');
    if (!form.room) return toast.error('Room is required');
    try {
      const payload = { ...form, hostelId: selectedHostel };
      if (isEdit) {
        await updateBedAllocation({ id: initial._id, ...payload }).unwrap();
        toast.success('Bed allocation updated');
      } else {
        await createBedAllocation(payload).unwrap();
        toast.success('Bed allocation created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save bed allocation');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Bed Allocation' : 'New Bed Allocation'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Student *</label>
            <select value={form.student} onChange={e => set('student', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              <option value="">Select student</option>
              {(students || []).map(s => (
                <option key={s._id} value={s._id}>{s.name || `${s.firstName} ${s.lastName}`}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Hostel *</label>
            <select value={selectedHostel} onChange={e => { setSelectedHostel(e.target.value); set('room', ''); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              <option value="">Select hostel</option>
              {(hostels || []).map(h => (
                <option key={h._id} value={h._id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Room *</label>
              <select value={form.room} onChange={e => set('room', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                <option value="">Select room</option>
                {filteredRooms.map(r => (
                  <option key={r._id} value={r._id}>{r.roomNumber || r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Bed Number</label>
              <input value={form.bed} onChange={e => set('bed', e.target.value)}
                placeholder="e.g. B1"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {creating || updating ? 'Saving\u2026' : 'Save Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ record, onClose }) => {
  const [deleteBedAllocation, { isLoading }] = useDeleteBedAllocationMutation();

  const handleDelete = async () => {
    try {
      await deleteBedAllocation(record._id).unwrap();
      toast.success('Bed allocation deleted');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete bed allocation');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Delete Bed Allocation</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          Are you sure you want to delete this bed allocation? This action cannot be undone.
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

const BedAllocationsManagement = () => {
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 });
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v, page: k !== 'page' ? 1 : v }));

  const queryArgs = useMemo(() => {
    const q = { page: filters.page, limit: 20 };
    if (filters.search) q.search = filters.search;
    if (filters.status) q.status = filters.status;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetBedAllocationsQuery(queryArgs);
  const { data: hostelsData } = useGetHostelsQuery();
  const { data: studentsData } = useGetStudentsQuery();

  const allocations = data?.data || data?.allocations || [];
  const total = data?.total || 0;
  const page = data?.page || filters.page;
  const pages = data?.pages || Math.ceil(total / 20) || 1;
  const hostels = hostelsData?.data || hostelsData || [];
  const students = studentsData?.data || studentsData || [];

  const { data: roomsData } = useGetHostelRoomsQuery(hostels[0]?._id, { skip: !hostels[0]?._id });
  const rooms = roomsData?.data || roomsData || [];

  const activeCount = allocations.filter(a => a.status === 'Active').length;
  const reservedCount = allocations.filter(a => a.status === 'Reserved').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Bed className="text-teal-600" size={28} />
            Bed Allocations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage hostel bed allocations for students.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> Add Allocation
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Allocations" value={total} icon={Bed} color="bg-teal-500" />
          <StatCard label="Active" value={activeCount} icon={CheckCircle} color="bg-green-500" />
          <StatCard label="Reserved" value={reservedCount} icon={Bed} color="bg-blue-500" />
          <StatCard label="Hostels" value={hostels.length} icon={Bed} color="bg-purple-500" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={e => setF('search', e.target.value)}
              placeholder="Search allocations..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
          </div>
          <select value={filters.status} onChange={e => setF('status', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : allocations.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mb-4">
              <Bed size={28} className="text-teal-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No bed allocations found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filters.search || filters.status
                ? 'Try adjusting your filters.'
                : 'Click "Add Allocation" to create your first allocation.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Hostel</th>
                  <th className="px-5 py-3.5">Room</th>
                  <th className="px-5 py-3.5">Bed</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allocations.map(a => (
                  <tr key={a._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {a.student?.name || a.student?.firstName || 'Unknown'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {a.hostel?.name || '\u2014'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {a.room?.roomNumber || a.room?.name || '\u2014'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {a.bed || '\u2014'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[a.status] || ''}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditRecord(a)} title="Edit"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => setDeleteRecord(a)} title="Delete"
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
              Page {page} of {pages} ({total} allocations)
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

      {showCreate && <AllocationModal onClose={() => setShowCreate(false)} hostels={hostels} rooms={rooms} students={students} />}
      {editRecord && <AllocationModal initial={editRecord} onClose={() => setEditRecord(null)} hostels={hostels} rooms={rooms} students={students} />}
      {deleteRecord && <DeleteModal record={deleteRecord} onClose={() => setDeleteRecord(null)} />}
    </div>
  );
};

export default BedAllocationsManagement;

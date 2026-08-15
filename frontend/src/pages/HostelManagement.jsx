import { useState } from 'react';
import { 
  Building2, Plus, Edit3, Trash2, Bed, Search, X, 
  AlertTriangle, ChevronDown, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useGetHostelsQuery, 
  useCreateHostelMutation, 
  useUpdateHostelMutation, 
  useDeleteHostelMutation,
  useGetHostelRoomsQuery,
  useCreateHostelRoomMutation,
  useUpdateHostelRoomMutation,
  useDeleteHostelRoomMutation
} from '../store/adminApiSlice';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../components/ToastContainer';
import { PageLayout, PageHeader } from '../components/PageLayout';

const typeColors = {
  Boys: 'bg-blue-100 text-blue-700',
  Girls: 'bg-pink-100 text-pink-700',
  Mixed: 'bg-purple-100 text-purple-700',
};

const statusColors = {
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-600',
  Maintenance: 'bg-yellow-100 text-yellow-700',
  Full: 'bg-red-100 text-red-700',
};

const HostelManagement = () => {
  const { showToast } = useToast();
  const { data: hostelsResponse, isLoading } = useGetHostelsQuery();
  const hostels = hostelsResponse?.data || [];
  const [createHostel, { isLoading: isCreating }] = useCreateHostelMutation();
  const [updateHostel, { isLoading: isUpdating }] = useUpdateHostelMutation();
  const [deleteHostel] = useDeleteHostelMutation();

  const [selectedHostel, setSelectedHostel] = useState(null);
  const { data: roomsResponse, isLoading: isLoadingRooms } = useGetHostelRoomsQuery(selectedHostel?._id, {
    skip: !selectedHostel,
  });
  const rooms = roomsResponse?.data || [];
  const [createRoom, { isLoading: isCreatingRoom }] = useCreateHostelRoomMutation();
  const [updateRoom, { isLoading: isUpdatingRoom }] = useUpdateHostelRoomMutation();
  const [deleteRoom] = useDeleteHostelRoomMutation();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editRoomItem, setEditRoomItem] = useState(null);
  const [showRoomDeleteConfirm, setShowRoomDeleteConfirm] = useState(null);

  const [hostelForm, setHostelForm] = useState({
    name: '', type: 'Boys', address: '', description: '', status: 'Active'
  });

  const [roomForm, setRoomForm] = useState({
    roomNumber: '', roomType: 'Double', capacity: 2, availableBeds: 2, costPerBed: 0, status: 'Active'
  });

  const resetHostelForm = () => {
    setHostelForm({ name: '', type: 'Boys', address: '', description: '', status: 'Active' });
    setEditItem(null);
    setShowForm(false);
  };

  const openHostelEdit = (item) => {
    setHostelForm({
      name: item.name,
      type: item.type,
      address: item.address || '',
      description: item.description || '',
      status: item.status,
    });
    setEditItem(item);
    setShowForm(true);
  };

  const handleHostelSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updateHostel({ id: editItem._id, ...hostelForm }).unwrap();
        showToast('Hostel updated successfully', 'success');
      } else {
        await createHostel(hostelForm).unwrap();
        showToast('Hostel created successfully', 'success');
      }
      resetHostelForm();
    } catch (err) {
      showToast(err?.data?.userMessage || 'Something went wrong', 'error');
    }
  };

  const handleHostelDelete = async (id) => {
    try {
      await deleteHostel(id).unwrap();
      showToast('Hostel deleted', 'success');
      setShowDeleteConfirm(null);
      if (selectedHostel?._id === id) setSelectedHostel(null);
    } catch (err) {
      showToast(err?.data?.userMessage || 'Failed to delete', 'error');
    }
  };

  const resetRoomForm = () => {
    setRoomForm({ roomNumber: '', roomType: 'Double', capacity: 2, availableBeds: 2, costPerBed: 0, status: 'Active' });
    setEditRoomItem(null);
    setShowRoomForm(false);
  };

  const openRoomEdit = (item) => {
    setRoomForm({
      roomNumber: item.roomNumber,
      roomType: item.roomType,
      capacity: item.capacity,
      availableBeds: item.availableBeds,
      costPerBed: item.costPerBed || 0,
      status: item.status,
    });
    setEditRoomItem(item);
    setShowRoomForm(true);
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editRoomItem) {
        await updateRoom({ id: editRoomItem._id, ...roomForm }).unwrap();
        showToast('Room updated successfully', 'success');
      } else {
        await createRoom({ hostelId: selectedHostel._id, ...roomForm }).unwrap();
        showToast('Room created successfully', 'success');
      }
      resetRoomForm();
    } catch (err) {
      showToast(err?.data?.userMessage || 'Something went wrong', 'error');
    }
  };

  const handleRoomDelete = async (id) => {
    try {
      await deleteRoom(id).unwrap();
      showToast('Room deleted', 'success');
      setShowRoomDeleteConfirm(null);
    } catch (err) {
      showToast(err?.data?.userMessage || 'Failed to delete', 'error');
    }
  };

  const filtered = hostels.filter((h) => {
    return !searchQuery || 
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.address && h.address.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Hostel Management"
        description="Manage hostels, rooms, and bed allocations"
        icon={Building2}
        actions={
          <button
            onClick={() => { resetHostelForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-medium shadow-sm"
          >
            <Plus size={18} /> Add Hostel
          </button>
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search hostels by name or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
        />
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {editItem ? 'Edit Hostel' : 'New Hostel'}
              </h2>
              <button onClick={resetHostelForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleHostelSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={hostelForm.name}
                    onChange={(e) => setHostelForm({ ...hostelForm, name: e.target.value })}
                    placeholder="e.g. Sunshine Hostel"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                  <select
                    value={hostelForm.type}
                    onChange={(e) => setHostelForm({ ...hostelForm, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <input
                  type="text"
                  value={hostelForm.address}
                  onChange={(e) => setHostelForm({ ...hostelForm, address: e.target.value })}
                  placeholder="Hostel address"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={hostelForm.description}
                  onChange={(e) => setHostelForm({ ...hostelForm, description: e.target.value })}
                  placeholder="Brief description of the hostel"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={hostelForm.status}
                  onChange={(e) => setHostelForm({ ...hostelForm, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={resetHostelForm}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isCreating || isUpdating}
                  className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition"
                >
                  {isCreating || isUpdating ? 'Saving...' : editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Building2 className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">No Hostels</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first hostel to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((h) => (
            <motion.div
              key={h._id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                selectedHostel?._id === h._id 
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                  : 'border-gray-100 dark:border-gray-700 hover:border-indigo-200'
              }`}
              onClick={() => setSelectedHostel(selectedHostel?._id === h._id ? null : h)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {selectedHostel?._id === h._id ? <ChevronDown size={16} className="text-indigo-500" /> : <ChevronRight size={16} className="text-gray-400" />}
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{h.name}</h3>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openHostelEdit(h)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => setShowDeleteConfirm(h._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeColors[h.type] || 'bg-gray-100 text-gray-600'}`}>
                  {h.type}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[h.status] || 'bg-gray-100 text-gray-600'}`}>
                  {h.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{h.totalRooms || 0}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Rooms</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{h.totalCapacity || 0}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Capacity</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2">
                  <p className="text-lg font-bold text-green-600">{h.availableBeds || 0}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Available</p>
                </div>
              </div>

              {showDeleteConfirm === h._id && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                    <AlertTriangle size={16} />
                    Delete this hostel?
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button onClick={() => handleHostelDelete(h._id)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showRoomForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {editRoomItem ? 'Edit Room' : `Add Room — ${selectedHostel?.name}`}
              </h2>
              <button onClick={resetRoomForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRoomSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    placeholder="e.g. 101"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room Type</label>
                  <select
                    value={roomForm.roomType}
                    onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Triple">Triple</option>
                    <option value="Dormitory">Dormitory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={roomForm.status}
                    onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Full">Full</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Available Beds *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={roomForm.availableBeds}
                    onChange={(e) => setRoomForm({ ...roomForm, availableBeds: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost Per Bed</label>
                  <input
                    type="number"
                    min="0"
                    value={roomForm.costPerBed}
                    onChange={(e) => setRoomForm({ ...roomForm, costPerBed: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={resetRoomForm}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isCreatingRoom || isUpdatingRoom}
                  className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition"
                >
                  {isCreatingRoom || isUpdatingRoom ? 'Saving...' : editRoomItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedHostel && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Bed size={20} className="text-indigo-500" />
                {selectedHostel.name} — Rooms
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {rooms.length} room{rooms.length !== 1 ? 's' : ''} configured
              </p>
            </div>
            <button
              onClick={() => { resetRoomForm(); setShowRoomForm(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors text-sm font-medium"
            >
              <Plus size={16} /> Add Room
            </button>
          </div>

          {isLoadingRooms ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-10">
              <Bed className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={36} />
              <p className="text-sm text-gray-500 dark:text-gray-400">No rooms yet. Add the first room to this hostel.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Room #</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Type</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Capacity</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Available Beds</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Cost/Bed</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <motion.tr
                      key={room._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{room.roomNumber}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{room.roomType}</td>
                      <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-300">{room.capacity}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-semibold ${room.availableBeds > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {room.availableBeds}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-300">
                        {room.costPerBed ? `$${room.costPerBed.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[room.status] || 'bg-gray-100 text-gray-600'}`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openRoomEdit(room)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => setShowRoomDeleteConfirm(room._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {showRoomDeleteConfirm === room._id && (
                          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-400">
                              <AlertTriangle size={14} />
                              Delete room {room.roomNumber}?
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setShowRoomDeleteConfirm(null)}
                                className="px-2.5 py-1 text-[11px] rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                              <button onClick={() => handleRoomDelete(room._id)}
                                className="px-2.5 py-1 text-[11px] rounded-lg bg-red-600 text-white hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default HostelManagement;

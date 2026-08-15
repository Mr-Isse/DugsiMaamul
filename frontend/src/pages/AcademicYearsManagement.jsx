import React, { useState } from 'react';
import { 
  useGetAcademicYearsQuery, 
  useCreateAcademicYearMutation, 
  useUpdateAcademicYearMutation 
} from '../store/adminApiSlice';
import { Calendar, Plus, Edit, Check, X, Loader2 } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';

const AcademicYearsManagement = () => {
  const { data, isLoading } = useGetAcademicYearsQuery();
  const [createYear, { isLoading: isCreating }] = useCreateAcademicYearMutation();
  const [updateYear, { isLoading: isUpdating }] = useUpdateAcademicYearMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '', status: 'inactive' });

  const years = data?.data || [];

  const handleOpenModal = (year = null) => {
    if (year) {
      setEditingYear(year);
      setFormData({
        name: year.name,
        startDate: year.startDate.split('T')[0],
        endDate: year.endDate.split('T')[0],
        status: year.status
      });
    } else {
      setEditingYear(null);
      setFormData({ name: '', startDate: '', endDate: '', status: 'inactive' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingYear) {
        await updateYear({ id: editingYear._id, ...formData }).unwrap();
        toast.success('Academic year updated');
      } else {
        await createYear(formData).unwrap();
        toast.success('Academic year created');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  const handleQuickAction = async (year, newStatus) => {
    try {
      await updateYear({ id: year._id, status: newStatus }).unwrap();
      toast.success(`Academic year marked as ${newStatus}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  if (isLoading) return <div className="p-6 space-y-6"><PageHeaderSkeleton /><TableSkeleton rows={6} columns={4} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Years</h1>
          <p className="text-sm text-gray-500">Manage school academic sessions and current active year.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} /> Add Session
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Session Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">End Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {years.map((year) => (
              <tr key={year._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{year.name}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{new Date(year.startDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{new Date(year.endDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    year.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {year.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  {year.status !== 'active' && (
                    <button onClick={() => handleQuickAction(year, 'active')} className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-bold transition-colors">
                      Activate
                    </button>
                  )}
                  {year.status !== 'archived' && (
                    <button onClick={() => handleQuickAction(year, 'archived')} className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-bold transition-colors">
                      Archive
                    </button>
                  )}
                  <button onClick={() => handleOpenModal(year)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-6">{editingYear ? 'Edit Session' : 'New Session'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Session Name (e.g. 2024-2025)</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Start Date</label>
                  <input 
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">End Date</label>
                  <input 
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.status === 'active'}
                    onChange={e => setFormData({...formData, status: e.target.checked ? 'active' : 'inactive'})}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="text-sm font-bold">Set as Current Active Session</span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={isCreating || isUpdating} className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                  {isCreating || isUpdating ? <Loader2 className="animate-spin mx-auto" /> : 'Save Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicYearsManagement;

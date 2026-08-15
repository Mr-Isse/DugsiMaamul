import React, { useState } from 'react';
import {
  useGetAssetsQuery,
  useCreateAssetMutation,
  useGetTeachersQuery,
  useGetStudentsQuery
} from '../store/adminApiSlice';
import { Package, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ResponsiveContainer, PieChart, Pie, Tooltip } from 'recharts';
import { Skeleton } from '../components/ui/skeleton';
import { DugsiButton, DugsiEmptyState, DugsiHeader, DugsiLoading, DugsiPage, dugsiFieldClass, dugsiLabelClass } from '../components/DugsiUI';

const AssetsManagement = () => {
  const { data: assetsData, isLoading } = useGetAssetsQuery();
  const [createAsset, { isLoading: creating }] = useCreateAssetMutation();
  const { data: teachersData } = useGetTeachersQuery();
  const { data: studentsData } = useGetStudentsQuery();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    purchaseDate: '',
    purchasePrice: '',
    condition: 'good',
    assignedTo: null
  });

  const assets = assetsData || [];
  const teachers = teachersData?.data || [];
  const students = studentsData?.data || [];
  const allUsers = [...teachers, ...students];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAsset(formData).unwrap();
      toast.success('Asset created');
      setShowModal(false);
      resetForm();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create asset');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      purchaseDate: '',
      purchasePrice: '',
      condition: 'good',
      assignedTo: null
    });
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-700';
      case 'good': return 'bg-blue-100 text-blue-700';
      case 'fair': return 'bg-yellow-100 text-yellow-700';
      case 'poor': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DugsiPage>
      <DugsiHeader
        icon={Package}
        title="Asset Management"
        description="Manage school assets and equipment."
        actions={(
          <DugsiButton
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} />
          Add Asset
        </DugsiButton>
        )}
      />

      {isLoading ? (
        <DugsiLoading />
      ) : assets.length === 0 ? (
        <DugsiEmptyState icon={Package} title="No Assets Yet" description="Add your first asset to get started." />
      ) : (
        <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border-none shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-sm font-semibold mb-3">Assets by Condition</h3>
            {isLoading ? <ChartSkeleton /> : (
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={assets.reduce((acc, a) => {
                      const name = a.condition || 'unknown';
                      const idx = acc.findIndex(x => x.name === name);
                      if (idx === -1) acc.push({ name, value: 1 }); else acc[idx].value += 1;
                      return acc;
                    }, [])} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Asset Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Condition</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Assigned To</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {assets.map((asset) => (
                <tr key={asset._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                        <Package className="text-indigo-600 dark:text-indigo-400" size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{asset.name}</p>
                        {asset.description && (
                          <p className="text-sm text-slate-500">{asset.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {asset.category}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getConditionColor(asset.condition)}`}>
                      {asset.condition.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {asset.assignedTo?.name || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-800 dark:text-white font-medium">
                    ${asset.purchasePrice?.toLocaleString() || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg p-8">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Add New Asset</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={dugsiLabelClass}>
                  Asset Name
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={dugsiFieldClass}
                />
              </div>
              <div>
                <label className={dugsiLabelClass}>
                  Category
                </label>
                <input
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={dugsiFieldClass}
                />
              </div>
              <div>
                <label className={dugsiLabelClass}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={dugsiFieldClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={dugsiLabelClass}>
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className={dugsiFieldClass}
                  />
                </div>
                <div>
                  <label className={dugsiLabelClass}>
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className={dugsiFieldClass}
                  />
                </div>
              </div>
              <div>
                <label className={dugsiLabelClass}>
                  Condition
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className={dugsiFieldClass}
                >
                  <option value="new">New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              <div>
                <label className={dugsiLabelClass}>
                  Assign To
                </label>
                <select
                  value={formData.assignedTo || ''}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value || null })}
                  className={dugsiFieldClass}
                >
                  <option value="">Not assigned</option>
                  {allUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-12 px-4 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 h-12 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-colors disabled:opacity-50"
                >
                  {creating ? <Loader2 className="animate-spin mx-auto" /> : 'Add Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DugsiPage>
  );
};

export default AssetsManagement;

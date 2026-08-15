import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppToast } from '../hooks/useAppToast';
import rbacApi from '../services/rbacApi';
import { hasPermission, getPermissionLabel } from '../utils/permissions';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  Search,
  Filter,
  Check,
  X,
  Layers
} from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

const PermissionManagement = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { showError, showSuccess } = useAppToast();

  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    module: '',
    action: '',
    resource: '',
    group: ''
  });

  const modules = ['students', 'teachers', 'classes', 'subjects', 'attendance', 'exams', 'finance', 'branches', 'rbac', 'settings'];
  const actions = ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export', 'import'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await rbacApi.getPermissions();
      setPermissions(res.data || []);
    } catch (error) {
      showError('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPermission(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      module: '',
      action: '',
      resource: '',
      group: ''
    });
    setShowModal(true);
  };

  const handleEdit = (permission) => {
    setEditingPermission(permission);
    setFormData({
      code: permission.code,
      name: permission.name,
      description: permission.description || '',
      module: permission.module,
      action: permission.action,
      resource: permission.resource,
      group: permission.group || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (permission) => {
    if (!confirm(`Are you sure you want to delete permission "${permission.name}"?`)) return;

    try {
      await rbacApi.deletePermission(permission._id);
      showSuccess('Permission deleted successfully');
      loadData();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete permission');
    }
  };

  const handleToggleStatus = async (permission) => {
    try {
      await rbacApi.updatePermission(permission._id, { isActive: !permission.isActive });
      showSuccess(`Permission ${permission.isActive ? 'deactivated' : 'activated'} successfully`);
      loadData();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update permission status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Auto-generate code if not provided
      const code = formData.code || `${formData.module}.${formData.action}.${formData.resource}`;
      
      if (editingPermission) {
        await rbacApi.updatePermission(editingPermission._id, { ...formData, code });
        showSuccess('Permission updated successfully');
      } else {
        await rbacApi.createPermission({ ...formData, code });
        showSuccess('Permission created successfully');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save permission');
    }
  };

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === 'all' || permission.module === filterModule;
    return matchesSearch && matchesModule;
  });

  // Group permissions by module
  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {});

  if (!hasPermission(userInfo, 'rbac.permissions.view')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">You don't have permission to view permissions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Permission Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage permissions for role-based access control</p>
        </div>
        {hasPermission(userInfo, 'rbac.permissions.manage') && (
          <button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
          >
            <Plus size={20} />
            Create Permission
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Modules</option>
              {modules.map(module => (
                <option key={module} value={module} className="capitalize">{module}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Permissions List */}
      {loading ? (
        <div className="max-w-7xl mx-auto space-y-6 p-6">
          <PageHeaderSkeleton />
          <TableSkeleton rows={6} columns={5} />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
            <div key={module} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">{module}</h3>
                    <span className="text-sm text-slate-500 dark:text-slate-400">({modulePermissions.length} permissions)</span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Permission</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Code</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {modulePermissions.map((permission) => (
                      <tr key={permission._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-5">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{permission.name}</div>
                            {permission.description && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">{permission.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded text-indigo-600 dark:text-indigo-400 text-xs font-mono">
                            {permission.code}
                          </code>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm text-slate-600 dark:text-slate-300 font-medium capitalize">{permission.action}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                            permission.isActive 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' 
                              : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:border-slate-600'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${permission.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {permission.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            {hasPermission(userInfo, 'rbac.permissions.manage') && (
                              <>
                                <button
                                  onClick={() => handleToggleStatus(permission)}
                                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                  title={permission.isActive ? 'Deactivate' : 'Activate'}
                                >
                                  {permission.isActive ? (
                                    <PowerOff className="w-4 h-4 text-slate-400" />
                                  ) : (
                                    <Power className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleEdit(permission)}
                                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4 text-slate-400" />
                                </button>
                                {!permission.isSystemPermission && (
                                  <button
                                    onClick={() => handleDelete(permission)}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {filteredPermissions.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No permissions found</p>
            </div>
          )}
        </div>
      )}

      {/* Permission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingPermission ? 'Edit Permission' : 'Create Permission'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Permission Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="e.g., View Students"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Module *
                  </label>
                  <select
                    required
                    value={formData.module}
                    onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select module</option>
                    {modules.map(module => (
                      <option key={module} value={module} className="capitalize">{module}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Action *
                  </label>
                  <select
                    required
                    value={formData.action}
                    onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select action</option>
                    {actions.map(action => (
                      <option key={action} value={action} className="capitalize">{action}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Resource *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.resource}
                    onChange={(e) => setFormData({ ...formData, resource: e.target.value.toLowerCase() })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g., students"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Permission Code
                </label>
                <input
                  type="text"
                  value={formData.code || `${formData.module}.${formData.action}.${formData.resource}`}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Auto-generated if empty"
                  readOnly={!editingPermission}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Format: module.action.resource (e.g., students.view)
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  rows="2"
                  placeholder="Describe what this permission allows"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Permission Group
                </label>
                <input
                  type="text"
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="e.g., Students Module"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-6 py-2.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
                >
                  {editingPermission ? 'Update Permission' : 'Create Permission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;

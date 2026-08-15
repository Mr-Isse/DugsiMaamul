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
  Layers,
  CheckSquare,
  Square
} from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

const RoleManagement = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { showError, showSuccess } = useAppToast();

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selectAllPermissions, setSelectAllPermissions] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    permissions: [],
    branchScope: null,
    priority: 0
  });

  useEffect(() => {
    loadData();
  }, [showInactive]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permissionsRes] = await Promise.all([
        rbacApi.getRoles(showInactive),
        rbacApi.getPermissions()
      ]);
      setRoles(rolesRes.data || []);
      setPermissions(permissionsRes.data || []);
    } catch (error) {
      showError('Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      permissions: [],
      branchScope: null,
      priority: 0
    });
    setSelectAllPermissions(false);
    setShowModal(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      code: role.code,
      description: role.description || '',
      permissions: role.permissions || [],
      branchScope: role.branchScope?._id || null,
      priority: role.priority || 0
    });
    setSelectAllPermissions(false);
    setShowModal(true);
  };

  const handleDelete = async (role) => {
    if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return;

    try {
      await rbacApi.deleteRole(role._id);
      showSuccess('Role deleted successfully');
      loadData();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete role');
    }
  };

  const handleToggleStatus = async (role) => {
    try {
      await rbacApi.updateRole(role._id, { isActive: !role.isActive });
      showSuccess(`Role ${role.isActive ? 'deactivated' : 'activated'} successfully`);
      loadData();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update role status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await rbacApi.updateRole(editingRole._id, formData);
        showSuccess('Role updated successfully');
      } else {
        await rbacApi.createRole(formData);
        showSuccess('Role created successfully');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save role');
    }
  };

  const handlePermissionToggle = (permissionCode) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionCode)
        ? prev.permissions.filter(p => p !== permissionCode)
        : [...prev.permissions, permissionCode]
    }));
  };

  const handleSelectAllPermissions = () => {
    const allPermissionCodes = permissions.map(p => p.code);
    if (selectAllPermissions) {
      setFormData(prev => ({ ...prev, permissions: [] }));
      setSelectAllPermissions(false);
    } else {
      setFormData(prev => ({ ...prev, permissions: allPermissionCodes }));
      setSelectAllPermissions(true);
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {});

  if (!hasPermission(userInfo, 'rbac.roles.view')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">You don't have permission to view roles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Role Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage roles and their permissions</p>
        </div>
        {hasPermission(userInfo, 'rbac.roles.manage') && (
          <button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
          >
            <Plus size={20} />
            Create Role
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
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
            />
            Show Inactive
          </label>
        </div>
      </div>

      {/* Roles Table */}
      {loading ? (
        <div className="max-w-7xl mx-auto space-y-6 p-6">
          <PageHeaderSkeleton />
          <TableSkeleton rows={6} columns={6} />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Code</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Permissions</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scope</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredRoles.map((role) => (
                  <tr key={role._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{role.name}</div>
                          {role.description && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">{role.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <code className="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded text-indigo-600 dark:text-indigo-400 text-xs font-mono">
                        {role.code}
                      </code>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{role.permissions?.length || 0} permissions</span>
                    </td>
                    <td className="px-6 py-5">
                      {role.branchScope ? (
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Branch Specific</span>
                      ) : (
                        <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Tenant Wide</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        role.isActive 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' 
                          : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:border-slate-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${role.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {role.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        {hasPermission(userInfo, 'rbac.roles.manage') && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(role)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title={role.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {role.isActive ? (
                                <PowerOff className="w-4 h-4 text-slate-400" />
                              ) : (
                                <Power className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(role)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-slate-400" />
                            </button>
                            {!role.isSystemRole && (
                              <button
                                onClick={() => handleDelete(role)}
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

            {filteredRoles.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No roles found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingRole ? 'Edit Role' : 'Create Role'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g., Branch Accountant"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Role Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g., BRANCH_ACCOUNTANT"
                  />
                </div>
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
                  placeholder="Describe this role's purpose"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Higher values = more specific"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Permissions
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllPermissions}
                    className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                  >
                    {selectAllPermissions ? (
                      <>
                        <CheckSquare className="w-4 h-4" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4" />
                        Select All
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                    <div key={module} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-3 capitalize flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-500" />
                        {module}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {modulePermissions.map((permission) => (
                          <label
                            key={permission._id}
                            className="flex items-center gap-2 p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission.code)}
                              onChange={() => handlePermissionToggle(permission.code)}
                              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {getPermissionLabel(permission.code)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
                  {editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;

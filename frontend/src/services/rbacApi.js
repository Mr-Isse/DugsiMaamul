import axios from 'axios';
import { getApiBaseUrl } from '../utils/apiConfig';

const API_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('userInfo');
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error adding token to request:', error);
  }
  // No dev-only headers in production
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * RBAC API Service
 * Handles all Role-Based Access Control operations
 */

// ==================== PERMISSIONS ====================

/**
 * Get all permissions for the current tenant
 */
export const getPermissions = async () => {
  const response = await api.get('/rbac/permissions');
  return response.data;
};

/**
 * Create a new permission
 */
export const createPermission = async (permissionData) => {
  const response = await api.post('/rbac/permissions', permissionData);
  return response.data;
};

/**
 * Update a permission
 */
export const updatePermission = async (id, permissionData) => {
  const response = await api.put(`/rbac/permissions/${id}`, permissionData);
  return response.data;
};

/**
 * Delete a permission
 */
export const deletePermission = async (id) => {
  const response = await api.delete(`/rbac/permissions/${id}`);
  return response.data;
};

// ==================== ROLES ====================

/**
 * Get all roles for the current tenant
 */
export const getRoles = async (includeInactive = false) => {
  const response = await api.get('/rbac/roles', {
    params: { includeInactive }
  });
  return response.data;
};

/**
 * Create a new role
 */
export const createRole = async (roleData) => {
  const response = await api.post('/rbac/roles', roleData);
  return response.data;
};

/**
 * Update a role
 */
export const updateRole = async (id, roleData) => {
  const response = await api.put(`/rbac/roles/${id}`, roleData);
  return response.data;
};

/**
 * Delete a role
 */
export const deleteRole = async (id) => {
  const response = await api.delete(`/rbac/roles/${id}`);
  return response.data;
};

// ==================== USER ROLE ASSIGNMENT ====================

/**
 * Assign role to user
 */
export const assignRoleToUser = async (userId, roleId) => {
  const response = await api.put(`/rbac/users/${userId}/role`, { roleId });
  return response.data;
};

/**
 * Remove role from user
 */
export const removeRoleFromUser = async (userId) => {
  const response = await api.delete(`/rbac/users/${userId}/role`);
  return response.data;
};

/**
 * Get user's effective permissions
 */
export const getUserEffectivePermissions = async (userId) => {
  const response = await api.get(`/rbac/users/${userId}/effective-permissions`);
  return response.data;
};

// ==================== USER PERMISSION OVERRIDES ====================

/**
 * Add permission override to user
 */
export const addPermissionOverride = async (userId, permission, granted = true) => {
  const response = await api.post(`/rbac/users/${userId}/permission-overrides`, {
    permission,
    granted
  });
  return response.data;
};

/**
 * Remove permission override from user
 */
export const removePermissionOverride = async (userId, permission) => {
  const response = await api.delete(`/rbac/users/${userId}/permission-overrides/${permission}`);
  return response.data;
};

// ==================== BRANCH ROLE ASSIGNMENT ====================

/**
 * Assign role to branch
 */
export const assignRoleToBranch = async (branchId, roleId) => {
  const response = await api.put(`/rbac/branches/${branchId}/role`, { roleId });
  return response.data;
};

/**
 * Remove role from branch
 */
export const removeRoleFromBranch = async (branchId) => {
  const response = await api.delete(`/rbac/branches/${branchId}/role`);
  return response.data;
};

export default {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  getUserEffectivePermissions,
  addPermissionOverride,
  removePermissionOverride,
  assignRoleToBranch,
  removeRoleFromBranch
};

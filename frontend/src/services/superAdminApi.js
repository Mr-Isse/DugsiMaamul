import axios from 'axios';
import { getApiBaseUrl } from '../utils/apiConfig';

const API_URL = getApiBaseUrl();

const superAdminApi = axios.create({
  baseURL: API_URL,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
});

superAdminApi.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('userInfo');
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    /* ignore */
  }
  // No dev-only headers required in production
  return config;
});

export const checkSuperAdminExists = () =>
  axios.get(`${API_URL}/super-admin/check-exists`);

export const superAdminLogin = (data) => superAdminApi.post('/super-admin/login', data);
export const superAdminRegister = (data) => superAdminApi.post('/super-admin/register', data);

export const getDashboardStats = () => superAdminApi.get('/super-admin/dashboard/stats');
export const getSchools = (params) => superAdminApi.get('/super-admin/schools', { params });
export const getSchool = (id) => superAdminApi.get(`/super-admin/schools/${id}`);
export const updateSchool = (id, data) => superAdminApi.put(`/super-admin/schools/${id}`, data);
export const deleteSchool = (id) => superAdminApi.delete(`/super-admin/schools/${id}`);
export const updateSubscription = (id, data) =>
  superAdminApi.put(`/super-admin/schools/${id}/subscription`, data);
export const extendSubscription = (id, data) =>
  superAdminApi.post(`/super-admin/schools/${id}/extend`, data);
export const toggleBlock = (id, data) =>
  superAdminApi.post(`/super-admin/schools/${id}/toggle-block`, data);

export const getPlans = () => superAdminApi.get('/super-admin/plans');
export const assignPlan = (schoolId, data) =>
  superAdminApi.post(`/super-admin/schools/${schoolId}/assign-plan`, data);

export const getSchoolAdmins = (params) => superAdminApi.get('/super-admin/admins', { params });
export const getSchoolAdmin = (id) => superAdminApi.get(`/super-admin/admins/${id}`);
export const createSchoolAdmin = (schoolId, data) => {
  if (!schoolId) return superAdminApi.post('/super-admin/register-school-admin', data);
  return superAdminApi.post(`/super-admin/schools/${schoolId}/admins`, data);
};
export const updateSchoolAdmin = (id, data) => superAdminApi.put(`/super-admin/admins/${id}`, data);
export const deleteSchoolAdmin = (id) => superAdminApi.delete(`/super-admin/admins/${id}`);
export const resetSchoolAdminPassword = (id, data) =>
  superAdminApi.post(`/super-admin/admins/${id}/reset-password`, data);
export const toggleSchoolAdminStatus = (id) =>
  superAdminApi.post(`/super-admin/admins/${id}/toggle-status`);

export default superAdminApi;

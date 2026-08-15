import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { TENANT_ID } from '../tenant/config';

// 1. Resolve API URL from Expo Constants (app.config.js) or fallback
const getBaseURL = () => {
  const configUrl = Constants.expoConfig?.extra?.apiUrl || Constants.expoConfig?.extra?.API_URL;
  
  if (configUrl) {
    return configUrl;
  }

  return 'https://schoolmangementbackend-deployment.up.railway.app/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// 2. Request Interceptor: Centralized Tenant & Auth Injection
api.interceptors.request.use(async (config) => {
  // A. Tenant Resolution
  let activeTenantId = TENANT_ID;

  // If not a whitelabel build, try to get tenant from selected school in storage
  if (!activeTenantId || activeTenantId === 'default') {
    try {
      const savedSchool = await SecureStore.getItemAsync('selectedSchool');
      if (savedSchool) {
        const school = JSON.parse(savedSchool);
        activeTenantId = school.tenantId || school.subdomain;
      }
    } catch (e) {
      // ignore
    }
  }

  // Inject the resolved tenant id
  if (activeTenantId && activeTenantId !== 'default') {
    config.headers['x-tenant-id'] = activeTenantId;
    
    // Dev header for legacy support in backend
    if (__DEV__) {
      config.headers['X-Dev-Tenant-Subdomain'] = activeTenantId;
    }
  }

  // B. Auth & Branch Resolution
  try {
    const userInfoStr = await SecureStore.getItemAsync('userInfo');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    
    if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }

    // Inject branch ID if user is assigned to one
    const branchId = userInfo?.branch?._id || userInfo?.branch;
    if (branchId) {
      config.headers['x-branch-id'] = branchId;
    }
  } catch (error) {
    console.warn('[API] Failed to retrieve user info from SecureStore', error);
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;

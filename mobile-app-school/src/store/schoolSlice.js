import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { IS_WHITELABEL_SCHOOL } from '../../config';
import { getBuildTenantId } from '../tenant/config';
import { fetchTenantConfig } from '../tenant/tenantService';

const STORAGE_KEY = 'selectedSchool';

const storage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

/**
 * Startup: resolve Mongo school _id + runtime branding from tenant config API.
 */
export const bootstrapTenantSchool = createAsyncThunk(
  'school/bootstrap',
  async (tenantIdParam, { rejectWithValue }) => {
    if (!IS_WHITELABEL_SCHOOL) {
      return rejectWithValue('not_whitelabel');
    }
    try {
      const tenantId = tenantIdParam || getBuildTenantId();
      console.log(`[SchoolSlice] Bootstrapping tenant: ${tenantId}`);
      
      // Use specialized mobile tenant config endpoint for branding + features
      // Retry logic: try 3 times before failing
      let config;
      let retries = 3;
      while (retries > 0) {
        try {
          config = await fetchTenantConfig(tenantId);
          break;
        } catch (err) {
          retries -= 1;
          if (retries === 0) throw err;
          console.warn(`[SchoolSlice] Bootstrap retry... (${3 - retries})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      console.log(`[SchoolSlice] Bootstrap Success: ${config?.name || 'Unknown'}`);
      
      const school = {
        _id: config._id,
        name: config.name,
        logo: typeof config.logo === 'object' ? config.logo.url : config.logo,
        subdomain: config.subdomain,
        tenantId: config.subdomain,
        isActive: config.isActive,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        backgroundColor: config.backgroundColor,
        textColor: config.textColor,
        branch: config.branch,
        branches: config.branches || [],
        settings: config.settings || {},
        features: config.features || config.enabledFeatures || [],
        home: config.home,
        events: config.events,
        notices: config.notices,
      };

      await storage.setItem(STORAGE_KEY, JSON.stringify(school));
      return school;
    } catch (e) {
      const status = e.response?.status;
      const message = e.response?.data?.userMessage || e.response?.data?.message || e.message;
      
      console.error(`[SchoolSlice] Bootstrap Error: Status ${status}, Message: ${message}`, {
        url: e.config?.url,
        method: e.config?.method,
        headers: e.config?.headers
      });
      
      // Attempt to load from cache if network fails
      const cached = await storage.getItem(STORAGE_KEY);
      if (cached) return JSON.parse(cached);
      
      return rejectWithValue(message || 'tenant_bootstrap_failed');
    }
  }
);

export const loadSelectedSchool = createAsyncThunk('school/loadSelectedSchool', async () => {
  const school = await storage.getItem(STORAGE_KEY);
  return school ? JSON.parse(school) : null;
});

export const saveSelectedSchool = createAsyncThunk('school/saveSelectedSchool', async (school) => {
  if (school) {
    await storage.setItem(STORAGE_KEY, JSON.stringify(school));
  } else {
    await storage.removeItem(STORAGE_KEY);
  }
  return school;
});

const schoolSlice = createSlice({
  name: 'school',
  initialState: {
    selectedSchool: null,
    loading: true,
    bootstrapStatus: 'idle',
    bootstrapError: null,
  },
  reducers: {
    setSelectedSchool: (state, action) => {
      state.selectedSchool = action.payload;
    },
    clearSelectedSchool: (state) => {
      state.selectedSchool = null;
    },
    clearBootstrapError: (state) => {
      state.bootstrapError = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadSelectedSchool.fulfilled, (state, action) => {
      state.selectedSchool = action.payload;
      state.loading = false;
    });
    builder.addCase(loadSelectedSchool.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loadSelectedSchool.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(saveSelectedSchool.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(saveSelectedSchool.fulfilled, (state, action) => {
      state.selectedSchool = action.payload;
      state.loading = false;
    });
    builder.addCase(saveSelectedSchool.rejected, (state) => {
      state.loading = false;
    });

    builder
      .addCase(bootstrapTenantSchool.pending, (state) => {
        state.bootstrapStatus = 'loading';
        state.bootstrapError = null;
        state.loading = true;
      })
      .addCase(bootstrapTenantSchool.fulfilled, (state, action) => {
        state.bootstrapStatus = 'success';
        state.selectedSchool = action.payload;
        state.loading = false;
      })
      .addCase(bootstrapTenantSchool.rejected, (state, action) => {
        state.bootstrapStatus = 'failed';
        state.bootstrapError = action.payload || 'failed';
        state.loading = false;
      });
  },
});

export const { setSelectedSchool, clearSelectedSchool, clearBootstrapError } =
  schoolSlice.actions;
export default schoolSlice.reducer;

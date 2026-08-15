import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { IS_WHITELABEL_SCHOOL, SCHOOL_CONFIG } from '../../config';

export const loadUserInfo = createAsyncThunk('auth/loadUserInfo', async () => {
  const userInfo = await SecureStore.getItemAsync('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userInfo: null,
    loading: true,
  },
  reducers: {
    setCredentials: (state, action) => {
      const payload = { ...action.payload };
      if (IS_WHITELABEL_SCHOOL && SCHOOL_CONFIG.tenantSubdomain !== 'default') {
        payload.boundTenantSubdomain = SCHOOL_CONFIG.tenantSubdomain;
      }
      state.userInfo = payload;
      SecureStore.setItemAsync('userInfo', JSON.stringify(payload));
    },
    logout: (state) => {
      state.userInfo = null;
      SecureStore.deleteItemAsync('userInfo');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserInfo.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        state.loading = false;
      })
      .addCase(loadUserInfo.rejected, (state) => {
        state.userInfo = null;
        state.loading = false;
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

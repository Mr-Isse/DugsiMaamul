import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tenantInfo: null,
  isSuperAdmin: false,
  loading: true,
  error: null,
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setTenantInfo: (state, action) => {
      state.tenantInfo = action.payload;
      // 'superadmin' = super admin portal; 'school' or 'dev' = school tenant (dev = local or preview builds)
      state.isSuperAdmin = action.payload?.type === 'superadmin';
      state.loading = false;
      state.error = null;
    },
    setTenantError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearTenant: (state) => {
      state.tenantInfo = null;
      state.isSuperAdmin = false;
      state.loading = false;
    },
    /** After school admin login — tenant comes from their school record */
    setSchoolTenantFromUser: (state, action) => {
      const school = action.payload;
      if (!school) return;
      state.tenantInfo = {
        type: 'school',
        _id: school._id,
        name: school.name,
        logo: school.logo,
        subdomain: school.subdomain,
        tenantId: school.subdomain,
        isActive: school.isActive,
      };
      state.isSuperAdmin = false;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setTenantInfo, setTenantError, clearTenant, setSchoolTenantFromUser } =
  tenantSlice.actions;
export default tenantSlice.reducer;

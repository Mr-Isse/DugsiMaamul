import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';
import { adminApiSlice } from './adminApiSlice';
import { superAdminApiSlice } from './superAdminApiSlice';
import { parentApiSlice } from './parentApiSlice';
import authReducer from './authSlice';
import tenantReducer from './tenantSlice';
import branchReducer from './branchSlice';
import academicReducer from './academicSlice';

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [adminApiSlice.reducerPath]: adminApiSlice.reducer,
    [superAdminApiSlice.reducerPath]: superAdminApiSlice.reducer,
    [parentApiSlice.reducerPath]: parentApiSlice.reducer,
    auth: authReducer,
    tenant: tenantReducer,
    branch: branchReducer,
    academic: academicReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware,
      adminApiSlice.middleware,
      superAdminApiSlice.middleware,
      parentApiSlice.middleware
    ),
  devTools: true,
});

export default store;

import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { baseApi } from '@/services/api/baseApi'
import authReducer from './slices/authSlice'
import tenantReducer from './slices/tenantSlice'
import branchReducer from './slices/branchSlice'
import uiReducer from './slices/uiSlice'
import subscriptionReducer from './slices/subscriptionSlice'
import academicReducer from './slices/academicSlice'
import dashboardReducer from '@/features/dashboard/dashboardSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tenant: tenantReducer,
    branch: branchReducer,
    ui: uiReducer,
    subscription: subscriptionReducer,
    academic: academicReducer,
    dashboard: dashboardReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // RTK Query internals
          'api/executeQuery/pending',
          'api/executeQuery/fulfilled',
          'api/executeQuery/rejected',
          'api/executeMutation/pending',
          'api/executeMutation/fulfilled',
          'api/executeMutation/rejected',
        ],
      },
    }).concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
})

setupListeners(store.dispatch)

export default store

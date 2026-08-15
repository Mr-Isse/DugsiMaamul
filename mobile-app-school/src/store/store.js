import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';
import authReducer from './authSlice';
import schoolReducer from './schoolSlice';

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    school: schoolReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export default store;

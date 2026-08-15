import { createApi } from '@reduxjs/toolkit/query/react';
import api from '../api';

const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: '' }) =>
  async (args) => {
    try {
      // Handle both string and object arguments
      const { url, method, body, params, headers } = typeof args === 'string' ? { url: args } : args;
      
      const result = await api({
        url: baseUrl + (url || ''),
        method: method || 'GET',
        data: body,
        params,
        headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

// Error message mapper for mobile app
const mapErrorMessage = (error) => {
  const message = error?.message || error?.data?.message || '';
  
  // Network errors
  if (error?.status === 'FETCH_ERROR' || message.includes('fetch') || message.includes('network') || message.includes('Network')) {
    return 'Unable to connect. Check your internet connection.';
  }
  
  // Timeout errors
  if (error?.status === 'TIMEOUT_ERROR' || message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  // Server errors
  if (error?.status === 500) {
    return 'Something went wrong. Please try again later.';
  }
  
  // Return the backend's user-friendly message if available
  return error?.data?.userMessage || error?.data?.message || 'Something went wrong. Please try again.';
};

const baseQuery = axiosBaseQuery();

// Enhanced base query with error handling
const baseQueryWithErrorHandling = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  
  if (result.error) {
    // Enhance error with user-friendly message
    result.error.userMessage = mapErrorMessage(result.error);
    
    // Handle session expiration
    if (result.error.status === 401) {
      // Dispatch logout action if token is invalid
      if (result.error.data?.message?.includes('session') || 
          result.error.data?.message?.includes('expired') ||
          result.error.data?.message?.includes('token')) {
        api.dispatch({ type: 'auth/logout' });
      }
    }
  }
  
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithErrorHandling,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: true,
  tagTypes: ['User', 'Class', 'Subject', 'Attendance', 'Mark', 'Payment', 'PaymentMonth', 'Exam', 'Schedule', 'ExamHall', 'Transaction'],
  endpoints: (builder) => ({}),
});

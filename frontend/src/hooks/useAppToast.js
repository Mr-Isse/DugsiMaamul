import { useCallback } from 'react';
import { toast } from 'sonner';
import { getErrorMessage, getToastDuration, getToastStyle } from '../utils/errorMessageMapper';

/**
* Custom hook for displaying toasts with translated messages using Sonner
* @returns {Object} Toast helper methods
*/
export const useAppToast = () => {
  /**
  * Show error toast with translated message
  * @param {Object|string} error - Error object or message
  */
  const showError = useCallback((error) => {
    let message;
    
    if (typeof error === 'string') {
      message = error;
    } else if (error?.userMessage) {
      // Use pre-processed user message from API slice
      message = error.userMessage;
    } else {
      // Extract messages from error object
      const technicalMsg = error?.data?.message || error?.message || 'Login failed';
      const userMsg = error?.data?.userMessage || '';
      message = getErrorMessage(technicalMsg, userMsg);
    }
    
    const duration = getToastDuration(message);
    
    return toast.error(message, { duration });
  }, []);
  
  /**
  * Show success toast
  * @param {string} message - Success message
  */
  const showSuccess = useCallback((message, duration = 4000) => {
    return toast.success(message, { duration });
  }, []);
  
  /**
  * Show loading toast
  * @param {string} message - Loading message
  * @returns {string} Toast ID (for dismissal)
  */
  const showLoading = useCallback((message = 'Loading...') => {
    return toast.loading(message);
  }, []);
  
  /**
  * Dismiss a toast by ID
  * @param {string} toastId - Toast ID to dismiss
  */
  const dismissToast = useCallback((toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    }
  }, []);
  
  /**
  * Show warning toast
  * @param {string} message - Warning message
  */
  const showWarning = useCallback((message, duration = 5000) => {
    return toast.warning(message, { duration });
  }, []);
  
  /**
  * Show info toast
  * @param {string} message - Info message
  */
  const showInfo = useCallback((message, duration = 4000) => {
    return toast.info(message, { duration });
  }, []);
  
  return {
    showError,
    showSuccess,
    showLoading,
    showWarning,
    showInfo,
    dismissToast,
  };
};

export default useAppToast;

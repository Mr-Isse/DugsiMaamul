import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from './Toast';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Convenience methods
  const success = useCallback((message, duration) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message, duration) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const warning = useCallback((message, duration) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const info = useCallback((message, duration) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  // Helper to show API error messages with user-friendly text
  const showApiError = useCallback((err) => {
    let message = 'Something went wrong. Please try again.';
    
    // Get the original error message
    const originalMsg = err?.data?.userMessage || err?.data?.message || err?.error || '';
    
    if (originalMsg) {
      // Translate technical errors to user-friendly messages
      const msg = originalMsg.toLowerCase();
      
      // Duplicate/Already exists errors
      if (msg.includes('duplicate') || msg.includes('already exists') || msg.includes('already registered')) {
        if (msg.includes('student') || msg.includes('id')) {
          message = 'This Student ID is already in use. Please choose a different ID.';
        } else if (msg.includes('teacher')) {
          message = 'This Teacher ID is already in use. Please choose a different ID.';
        } else if (msg.includes('email')) {
          message = 'This email is already registered. Please use a different email.';
        } else if (msg.includes('subject') || msg.includes('code')) {
          message = 'This subject code already exists. Please use a different code.';
        } else if (msg.includes('class')) {
          message = 'This class already exists. Please choose a different name or section.';
        } else {
          message = 'This record already exists. Please check your information and try again.';
        }
      }
      // Validation errors
      else if (msg.includes('validation') || msg.includes('invalid')) {
        message = 'Please check the information you entered and try again.';
      }
      // Not found errors
      else if (msg.includes('not found') || msg.includes('doesn\'t exist')) {
        message = 'The requested item could not be found. It may have been deleted.';
      }
      // Permission errors
      else if (msg.includes('permission') || msg.includes('not authorized') || msg.includes('forbidden')) {
        message = 'You do not have permission to perform this action. Please contact support if needed.';
      }
      // Delete errors
      else if (msg.includes('delete') || msg.includes('remove')) {
        message = 'Unable to delete. This item may be linked to other records.';
      }
      // Password errors
      else if (msg.includes('password')) {
        message = 'Please check the password requirements and try again.';
      }
      // Network/Server errors
      else if (msg.includes('network') || msg.includes('server') || msg.includes('timeout')) {
        message = 'Unable to connect to the server. Please check your internet connection and try again.';
      }
      // Use original message if we can't categorize it
      else {
        message = originalMsg;
      }
    } else if (typeof err === 'string') {
      message = err;
    }
    
    return addToast(message, 'error', 6000);
  }, [addToast]);

  // Helper to show API success messages
  const showApiSuccess = useCallback((message, duration = 4000) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const value = {
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    showApiError,
    showApiSuccess
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;

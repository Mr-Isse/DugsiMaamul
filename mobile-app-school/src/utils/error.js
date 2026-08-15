/**
 * Error Utilities for Mobile App
 * Provides user-friendly error messages and alert helpers
 */

import { Alert } from 'react-native';

// Error message mapper for mobile
export const mapErrorMessage = (error) => {
  // If error has userMessage from backend, use it
  if (error?.data?.userMessage) {
    return error.data.userMessage;
  }
  
  // If error has message from backend
  if (error?.data?.message) {
    return mapBackendMessage(error.data.message);
  }
  
  // Check error status
  if (error?.status === 'FETCH_ERROR' || error?.status === 0) {
    return 'Unable to connect. Check your internet connection.';
  }
  
  if (error?.status === 'TIMEOUT_ERROR') {
    return 'Request timed out. Please try again.';
  }
  
  if (error?.status === 500) {
    return 'Something went wrong. Please try again later.';
  }
  
  if (error?.status === 401) {
    return 'Your session expired, please login again.';
  }
  
  if (error?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error?.status === 404) {
    return 'Record not found.';
  }
  
  // Check error message string
  const message = error?.message || error?.error || '';
  return mapBackendMessage(message);
};

// Map backend messages to user-friendly versions
const mapBackendMessage = (message) => {
  if (!message) return 'Something went wrong. Please try again.';
  
  const lowerMessage = message.toLowerCase();
  
  // Duplicate errors
  if (lowerMessage.includes('duplicate') || lowerMessage.includes('already exists') || lowerMessage.includes('e11000')) {
    if (lowerMessage.includes('email')) return 'This email is already registered.';
    if (lowerMessage.includes('id') || lowerMessage.includes('customid')) return 'This ID already exists.';
    return 'This record already exists.';
  }
  
  // Not found errors
  if (lowerMessage.includes('not found')) {
    if (lowerMessage.includes('student')) return 'No student found with this ID.';
    if (lowerMessage.includes('teacher')) return 'No teacher found with this ID.';
    if (lowerMessage.includes('class')) return 'No class found with this ID.';
    if (lowerMessage.includes('subject')) return 'No subject found.';
    if (lowerMessage.includes('exam')) return 'No exam found.';
    if (lowerMessage.includes('schedule')) return 'No schedule found.';
    if (lowerMessage.includes('payment')) return 'No payment record found.';
    if (lowerMessage.includes('school')) return 'School information not found.';
    return 'Record not found.';
  }
  
  // Validation errors
  if (lowerMessage.includes('required')) {
    if (lowerMessage.includes('name')) return 'Name is required.';
    if (lowerMessage.includes('email')) return 'Email is required.';
    if (lowerMessage.includes('password')) return 'Password is required.';
    if (lowerMessage.includes('class')) return 'Class is required.';
    if (lowerMessage.includes('subject')) return 'Subject is required.';
    if (lowerMessage.includes('teacher')) return 'Teacher is required.';
    if (lowerMessage.includes('maxstudents')) return 'Maximum students is required.';
    return 'Please fill in all required fields.';
  }
  
  // Authentication errors
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('token') || lowerMessage.includes('session')) {
    return 'Your session expired, please login again.';
  }
  
  if (lowerMessage.includes('invalid') && (lowerMessage.includes('password') || lowerMessage.includes('login'))) {
    return 'Incorrect login credentials. Please try again.';
  }
  
  // Network errors
  if (lowerMessage.includes('network') || lowerMessage.includes('connection') || lowerMessage.includes('enotfound')) {
    return 'Unable to connect. Check your internet connection.';
  }
  
  // Schedule conflict
  if (lowerMessage.includes('schedule conflict')) {
    return 'This time slot is already scheduled. Please choose a different time.';
  }
  
  // Marks errors
  if (lowerMessage.includes('marks exceed') || lowerMessage.includes('greater than')) {
    return 'Marks cannot be greater than total marks.';
  }
  
  // Cast errors (invalid ID)
  if (lowerMessage.includes('cast') || lowerMessage.includes('objectid')) {
    return 'Invalid ID format. Please check and try again.';
  }
  
  return message;
};

// Success message mapper
export const mapSuccessMessage = (message) => {
  const successMessages = {
    'created successfully': 'Created successfully.',
    'updated successfully': 'Updated successfully.',
    'deleted successfully': 'Deleted successfully.',
    'saved successfully': 'Saved successfully.',
    'submitted successfully': 'Submitted successfully.',
    'marked successfully': 'Marked successfully.',
    'added successfully': 'Added successfully.',
    'removed successfully': 'Removed successfully.',
    'reset successfully': 'Reset successfully.',
    'password reset successfully': 'Password changed successfully.'
  };
  
  const lowerMessage = message?.toLowerCase() || '';
  
  for (const [key, value] of Object.entries(successMessages)) {
    if (lowerMessage.includes(key)) {
      return value;
    }
  }
  
  return message || 'Operation completed successfully.';
};

// Show error alert
export const showErrorAlert = (error, title = 'Error') => {
  const message = mapErrorMessage(error);
  Alert.alert(
    title,
    message,
    [{ text: 'OK', style: 'default' }],
    { cancelable: true }
  );
  return message;
};

// Show success alert
export const showSuccessAlert = (message, title = 'Success') => {
  const friendlyMessage = mapSuccessMessage(message);
  Alert.alert(
    title,
    friendlyMessage,
    [{ text: 'OK', style: 'default' }],
    { cancelable: true }
  );
  return friendlyMessage;
};

// Show confirmation dialog
export const showConfirmation = (title, message, onConfirm, onCancel) => {
  Alert.alert(
    title,
    message,
    [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'Confirm', style: 'destructive', onPress: onConfirm }
    ],
    { cancelable: true }
  );
};

// Handle API mutation result
export const handleMutationResult = async (mutationFn, options = {}) => {
  const { 
    successMessage, 
    errorTitle = 'Error',
    successTitle = 'Success',
    showSuccessAlert: showSuccess = false,
    showErrorAlert: showError = true,
    onSuccess,
    onError
  } = options;
  
  try {
    const result = await mutationFn();
    
    if (result.error) {
      const errorMsg = mapErrorMessage(result.error);
      if (showError) {
        Alert.alert(errorTitle, errorMsg, [{ text: 'OK' }]);
      }
      if (onError) onError(result.error, errorMsg);
      return { success: false, error: result.error, message: errorMsg };
    }
    
    const msg = successMessage || mapSuccessMessage(result.data?.message);
    if (showSuccess) {
      Alert.alert(successTitle, msg, [{ text: 'OK' }]);
    }
    if (onSuccess) onSuccess(result.data, msg);
    return { success: true, data: result.data, message: msg };
    
  } catch (error) {
    const errorMsg = mapErrorMessage(error);
    if (showError) {
      Alert.alert(errorTitle, errorMsg, [{ text: 'OK' }]);
    }
    if (onError) onError(error, errorMsg);
    return { success: false, error, message: errorMsg };
  }
};

export default {
  mapErrorMessage,
  mapSuccessMessage,
  showErrorAlert,
  showSuccessAlert,
  showConfirmation,
  handleMutationResult
};

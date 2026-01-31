/**
 * Error handling utilities for Spark.chat frontend
 * 
 * Provides centralized error handling and user-friendly error messages
 * for various types of errors that can occur in the application.
 */

import toast from 'react-hot-toast';

/**
 * Error types for categorizing different kinds of errors
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK',
  AUTHENTICATION: 'AUTHENTICATION',
  VALIDATION: 'VALIDATION',
  SERVER: 'SERVER',
  WEBSOCKET: 'WEBSOCKET',
  UNKNOWN: 'UNKNOWN'
};

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
  [ErrorTypes.NETWORK]: 'Network connection failed. Please check your internet connection.',
  [ErrorTypes.AUTHENTICATION]: 'Authentication failed. Please log in again.',
  [ErrorTypes.VALIDATION]: 'Please check your input and try again.',
  [ErrorTypes.SERVER]: 'Server error occurred. Please try again later.',
  [ErrorTypes.WEBSOCKET]: 'Real-time connection lost. Attempting to reconnect...',
  [ErrorTypes.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Categorize error based on error object or status code
 * 
 * @param {Error|Object} error - Error object or response
 * @returns {string} Error type
 */
export const categorizeError = (error) => {
  if (!error) return ErrorTypes.UNKNOWN;

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return ErrorTypes.NETWORK;
  }

  // HTTP status code based categorization
  if (error.response?.status) {
    const status = error.response.status;
    if (status === 401 || status === 403) {
      return ErrorTypes.AUTHENTICATION;
    }
    if (status >= 400 && status < 500) {
      return ErrorTypes.VALIDATION;
    }
    if (status >= 500) {
      return ErrorTypes.SERVER;
    }
  }

  // WebSocket errors
  if (error.type === 'websocket' || error.name === 'WebSocketError') {
    return ErrorTypes.WEBSOCKET;
  }

  return ErrorTypes.UNKNOWN;
};

/**
 * Get user-friendly error message
 * 
 * @param {Error|Object} error - Error object
 * @param {string} fallbackMessage - Custom fallback message
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, fallbackMessage = null) => {
  // Try to get specific error message from response
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Try to get error message from error object
  if (error.message && error.message !== 'Network Error') {
    return error.message;
  }

  // Use categorized error message
  const errorType = categorizeError(error);
  return fallbackMessage || ERROR_MESSAGES[errorType];
};

/**
 * Handle error with toast notification
 * 
 * @param {Error|Object} error - Error object
 * @param {string} customMessage - Custom error message
 * @param {Object} options - Toast options
 */
export const handleError = (error, customMessage = null, options = {}) => {
  const message = customMessage || getErrorMessage(error);
  
  console.error('Error occurred:', error);
  
  toast.error(message, {
    duration: 4000,
    position: 'top-center',
    ...options
  });
};

/**
 * Handle authentication errors specifically
 * 
 * @param {Error|Object} error - Error object
 * @param {Function} onAuthError - Callback for auth errors
 */
export const handleAuthError = (error, onAuthError = null) => {
  const errorType = categorizeError(error);
  
  if (errorType === ErrorTypes.AUTHENTICATION) {
    handleError(error, 'Your session has expired. Please log in again.');
    
    // Clear stored auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Call auth error callback if provided
    if (onAuthError && typeof onAuthError === 'function') {
      onAuthError();
    }
  } else {
    handleError(error);
  }
};

/**
 * Handle WebSocket connection errors
 * 
 * @param {Error|Object} error - WebSocket error
 * @param {Function} onReconnect - Reconnection callback
 */
export const handleWebSocketError = (error, onReconnect = null) => {
  console.error('WebSocket error:', error);
  
  toast.error('Connection lost. Attempting to reconnect...', {
    duration: 3000,
    position: 'top-center'
  });
  
  // Attempt reconnection after a delay
  if (onReconnect && typeof onReconnect === 'function') {
    setTimeout(() => {
      onReconnect();
    }, 3000);
  }
};

/**
 * Validate form data and show validation errors
 * 
 * @param {Object} errors - Validation errors object
 * @param {Object} fieldLabels - Field label mappings
 */
export const handleValidationErrors = (errors, fieldLabels = {}) => {
  Object.keys(errors).forEach(field => {
    const fieldLabel = fieldLabels[field] || field;
    const errorMessage = errors[field].message || `${fieldLabel} is invalid`;
    
    toast.error(errorMessage, {
      duration: 3000,
      position: 'top-right'
    });
  });
};

/**
 * Create a retry function for failed operations
 * 
 * @param {Function} operation - Operation to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Function} Retry function
 */
export const createRetryHandler = (operation, maxRetries = 3, delay = 1000) => {
  return async (...args) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation(...args);
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          handleError(error, `Operation failed after ${maxRetries} attempts`);
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  };
};

/**
 * Debounce error handling to prevent spam
 */
let errorDebounceTimer = null;

export const debouncedErrorHandler = (error, message = null, delay = 1000) => {
  if (errorDebounceTimer) {
    clearTimeout(errorDebounceTimer);
  }
  
  errorDebounceTimer = setTimeout(() => {
    handleError(error, message);
    errorDebounceTimer = null;
  }, delay);
};

export default {
  ErrorTypes,
  categorizeError,
  getErrorMessage,
  handleError,
  handleAuthError,
  handleWebSocketError,
  handleValidationErrors,
  createRetryHandler,
  debouncedErrorHandler
};
'use client';

import { createContext, useContext, useCallback } from 'react';
import { toast as hotToast } from 'react-hot-toast';

// Create context
const ToastContext = createContext({
  success: () => {},
  error: () => {},
  info: () => {},
  warn: () => {},
});

// Provider component
export const ToastProvider = ({ children }) => {
  // Success notification
  const success = useCallback((message) => {
    hotToast.success(message, {
      duration: 3000,
      style: {
        background: '#10B981',
        color: '#fff',
        fontWeight: 500,
      },
    });
  }, []);

  // Error notification
  const error = useCallback((message) => {
    hotToast.error(message, {
      duration: 4000,
      style: {
        background: '#EF4444',
        color: '#fff',
        fontWeight: 500,
      },
    });
  }, []);

  // Info notification
  const info = useCallback((message) => {
    hotToast(message, {
      duration: 3000,
      style: {
        background: '#3B82F6',
        color: '#fff',
        fontWeight: 500,
      },
    });
  }, []);

  // Warning notification
  const warn = useCallback((message) => {
    hotToast(message, {
      duration: 3500,
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
        fontWeight: 500,
      },
    });
  }, []);

  return (
    <ToastContext.Provider value={{ success, error, info, warn }}>
      {children}
    </ToastContext.Provider>
  );
};

// Custom hook for using the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

export default ToastContext; 
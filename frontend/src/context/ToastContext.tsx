import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Alert/Toast';
import type { ToastProps } from '../components/Alert/Toast';
import type { ReactNode } from 'react';

interface ToastContextType {
  showToast: (message: string, type?: ToastProps['type'], duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<null | (Omit<ToastProps, 'onClose'>)>(null);

  const showToast = useCallback((message: string, type: ToastProps['type'] = 'info', duration = 4000) => {
    setToast({ message, type, duration });
  }, []);

  const handleClose = () => setToast(null);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast {...toast} onClose={handleClose} />}
    </ToastContext.Provider>
  );
}; 
import React, { useEffect } from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

const toastColors = {
  success: '#43a047',
  error: '#e53935',
  warning: '#fbc02d',
  info: '#1976d2',
};

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 4000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        background: toastColors[type],
        color: '#fff',
        padding: '16px 32px',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 9999,
        minWidth: 200,
        fontSize: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
      role="alert"
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 18,
          marginLeft: 12,
          cursor: 'pointer',
        }}
        aria-label="Fechar"
      >
        ×
      </button>
    </div>
  );
};

export default Toast; 
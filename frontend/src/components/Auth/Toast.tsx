import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div<{ variant: 'success' | 'error' | 'warning' | 'info'; isVisible: boolean }>`
  position: fixed;
  top: ${theme.spacing.lg};
  right: ${theme.spacing.lg};
  z-index: 1000;
  min-width: 300px;
  max-width: 400px;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  animation: ${props => props.isVisible ? slideIn : slideOut} 0.3s ease-in-out;
  
  ${props => {
    switch (props.variant) {
      case 'success':
        return `
          background: #d4edda;
          color: #155724;
          border-left: 4px solid #28a745;
        `;
      case 'error':
        return `
          background: #f8d7da;
          color: #721c24;
          border-left: 4px solid #dc3545;
        `;
      case 'warning':
        return `
          background: #fff3cd;
          color: #856404;
          border-left: 4px solid #ffc107;
        `;
      case 'info':
        return `
          background: #d1ecf1;
          color: #0c5460;
          border-left: 4px solid #17a2b8;
        `;
      default:
        return `
          background: ${theme.colors.white};
          color: ${theme.colors.text};
          border-left: 4px solid ${theme.colors.primary};
        `;
    }
  }}
`;

const ToastIcon = styled.span`
  font-size: ${theme.typography.fontSize.lg};
  flex-shrink: 0;
`;

const ToastContent = styled.div`
  flex: 1;
`;

const ToastTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
`;

const ToastMessage = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  line-height: 1.4;
`;

const ToastCloseButton = styled.button`
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  opacity: 0.7;
  transition: opacity ${theme.transitions.normal};
  font-size: ${theme.typography.fontSize.sm};
  
  &:hover {
    opacity: 1;
  }
`;

const ProgressBar = styled.div<{ duration: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: currentColor;
  opacity: 0.3;
  animation: progress ${props => props.duration}ms linear;
  
  @keyframes progress {
    from { width: 100%; }
    to { width: 0%; }
  }
`;

interface ToastProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose: () => void;
  autoClose?: boolean;
}

const getIcon = (variant: string) => {
  switch (variant) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    default:
      return '';
  }
};

export const Toast: React.FC<ToastProps> = ({
  variant,
  title,
  message,
  duration = 5000,
  onClose,
  autoClose = true
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, autoClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  return (
    <ToastContainer variant={variant} isVisible={isVisible}>
      <ToastIcon>{getIcon(variant)}</ToastIcon>
      <ToastContent>
        {title && <ToastTitle>{title}</ToastTitle>}
        <ToastMessage>{message}</ToastMessage>
      </ToastContent>
      <ToastCloseButton onClick={handleClose} title="Fechar">
        ✕
      </ToastCloseButton>
      {autoClose && <ProgressBar duration={duration} />}
    </ToastContainer>
  );
};

// Toast Manager Hook
interface ToastData {
  id: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  autoClose?: boolean;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message: string, title?: string, options?: { duration?: number; autoClose?: boolean }) => {
    addToast({ variant: 'success', message, title, ...options });
  };

  const showError = (message: string, title?: string, options?: { duration?: number; autoClose?: boolean }) => {
    addToast({ variant: 'error', message, title, ...options });
  };

  const showWarning = (message: string, title?: string, options?: { duration?: number; autoClose?: boolean }) => {
    addToast({ variant: 'warning', message, title, ...options });
  };

  const showInfo = (message: string, title?: string, options?: { duration?: number; autoClose?: boolean }) => {
    addToast({ variant: 'info', message, title, ...options });
  };

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          autoClose={toast.autoClose}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastContainer
  };
};

export default Toast;
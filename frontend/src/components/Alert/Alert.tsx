import React, { useState, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

export type AlertVariant = 'success' | 'danger' | 'warning' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  dismissible?: boolean;
  autoClose?: boolean;
  autoCloseTime?: number;
  onClose?: () => void;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const AlertContainer = styled.div<{ variant: AlertVariant }>`
  display: flex;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
  animation: ${fadeIn} 0.3s ease;
  
  ${({ variant }) => {
    switch (variant) {
      case 'success':
        return css`
          background-color: rgba(46, 204, 113, 0.1);
          border-left: 4px solid ${theme.colors.success};
        `;
      case 'danger':
        return css`
          background-color: rgba(231, 76, 60, 0.1);
          border-left: 4px solid ${theme.colors.danger};
        `;
      case 'warning':
        return css`
          background-color: rgba(243, 156, 18, 0.1);
          border-left: 4px solid ${theme.colors.warning};
        `;
      case 'info':
      default:
        return css`
          background-color: rgba(52, 152, 219, 0.1);
          border-left: 4px solid ${theme.colors.info};
        `;
    }
  }}
`;

const IconContainer = styled.div<{ variant: AlertVariant }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing.md};
  font-size: 1.5rem;
  
  ${({ variant }) => {
    switch (variant) {
      case 'success':
        return css`color: ${theme.colors.success};`;
      case 'danger':
        return css`color: ${theme.colors.danger};`;
      case 'warning':
        return css`color: ${theme.colors.warning};`;
      case 'info':
      default:
        return css`color: ${theme.colors.info};`;
    }
  }}
`;

const ContentContainer = styled.div`
  flex: 1;
`;

const AlertTitle = styled.h4`
  margin: 0 0 ${theme.spacing.xs} 0;
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.lg};
`;

const AlertMessage = styled.p`
  margin: 0;
  color: ${theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.grayDark};
  font-size: 1.25rem;
  padding: 0;
  margin-left: ${theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  
  &:hover {
    color: ${theme.colors.text};
  }
`;

const getDefaultIcon = (variant: AlertVariant): string => {
  switch (variant) {
    case 'success':
      return '✓';
    case 'danger':
      return '✕';
    case 'warning':
      return '⚠';
    case 'info':
    default:
      return 'ℹ';
  }
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  dismissible = true,
  autoClose = false,
  autoCloseTime = 5000,
  onClose,
  icon,
  className,
  style,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, isVisible, onClose]);
  
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };
  
  if (!isVisible) return null;
  
  return (
    <AlertContainer variant={variant} className={className} style={style}>
      <IconContainer variant={variant}>
        {icon || getDefaultIcon(variant)}
      </IconContainer>
      
      <ContentContainer>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertMessage>{message}</AlertMessage>
      </ContentContainer>
      
      {dismissible && (
        <CloseButton onClick={handleClose} aria-label="Fechar">
          &times;
        </CloseButton>
      )}
    </AlertContainer>
  );
};

export default Alert;
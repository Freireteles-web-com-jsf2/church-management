import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const AlertContainer = styled.div<{ variant: 'success' | 'error' | 'warning' | 'info' }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  
  ${props => {
    switch (props.variant) {
      case 'success':
        return `
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        `;
      case 'error':
        return `
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        `;
      case 'warning':
        return `
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        `;
      case 'info':
        return `
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        `;
      default:
        return `
          background: ${theme.colors.grayLight};
          color: ${theme.colors.text};
          border: 1px solid ${theme.colors.gray};
        `;
    }
  }}
`;

const AlertIcon = styled.span`
  font-size: ${theme.typography.fontSize.base};
  flex-shrink: 0;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing.xs};
`;

const AlertMessage = styled.div`
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  opacity: 0.7;
  transition: opacity ${theme.transitions.normal};
  
  &:hover {
    opacity: 1;
  }
`;

interface MessageAlertProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
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

export const MessageAlert: React.FC<MessageAlertProps> = ({
  variant,
  title,
  message,
  onClose,
  className
}) => {
  return (
    <AlertContainer variant={variant} className={className}>
      <AlertIcon>{getIcon(variant)}</AlertIcon>
      <AlertContent>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertMessage>{message}</AlertMessage>
      </AlertContent>
      {onClose && (
        <CloseButton onClick={onClose} title="Fechar">
          ✕
        </CloseButton>
      )}
    </AlertContainer>
  );
};

export default MessageAlert;
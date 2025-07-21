import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

export type MessageType = 'info' | 'warning' | 'success' | 'error' | 'empty' | 'loading' | 'network';

interface InformativeMessageProps {
  type: MessageType;
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionLink?: string;
  className?: string;
  showIcon?: boolean;
}

const MessageContainer = styled.div<{ type: MessageType }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  text-align: center;
  min-height: 200px;
  border-radius: ${theme.borderRadius.lg};
  background: ${({ type }) => {
    switch (type) {
      case 'warning': return '#FFF8E1';
      case 'success': return '#E8F5E8';
      case 'error': return '#FFEBEE';
      case 'empty': return theme.colors.grayLight;
      case 'loading': return '#F3E5F5';
      case 'network': return '#FFEBEE';
      default: return '#E3F2FD';
    }
  }};
  border: 1px solid ${({ type }) => {
    switch (type) {
      case 'warning': return theme.colors.warning;
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.danger;
      case 'empty': return theme.colors.gray;
      case 'loading': return '#9C27B0';
      case 'network': return theme.colors.danger;
      default: return theme.colors.info;
    }
  }};
`;

const MessageIcon = styled.div<{ type: MessageType }>`
  font-size: 3rem;
  margin-bottom: ${theme.spacing.lg};
  color: ${({ type }) => {
    switch (type) {
      case 'warning': return theme.colors.warning;
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.danger;
      case 'empty': return theme.colors.textLight;
      case 'loading': return '#9C27B0';
      case 'network': return theme.colors.danger;
      default: return theme.colors.info;
    }
  }};
`;

const MessageTitle = styled.h3<{ type: MessageType }>`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: ${theme.spacing.sm};
  color: ${({ type }) => {
    switch (type) {
      case 'warning': return '#E65100';
      case 'success': return '#2E7D32';
      case 'error': return theme.colors.danger;
      case 'empty': return theme.colors.text;
      case 'loading': return '#6A1B9A';
      case 'network': return theme.colors.danger;
      default: return '#1565C0';
    }
  }};
`;

const MessageDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textLight};
  margin-bottom: ${theme.spacing.lg};
  max-width: 400px;
  line-height: 1.5;
`;

const MessageAction = styled.button<{ type: MessageType }>`
  background: ${({ type }) => {
    switch (type) {
      case 'warning': return theme.colors.warning;
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.danger;
      case 'loading': return '#9C27B0';
      case 'network': return theme.colors.danger;
      default: return theme.colors.primary;
    }
  }};
  color: ${theme.colors.white};
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  text-decoration: none;
  display: inline-block;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid ${({ type }) => {
      switch (type) {
        case 'warning': return theme.colors.warning;
        case 'success': return theme.colors.success;
        case 'error': return theme.colors.danger;
        case 'loading': return '#9C27B0';
        case 'network': return theme.colors.danger;
        default: return theme.colors.primary;
      }
    }};
    outline-offset: 2px;
  }
`;

const MessageLink = styled.a<{ type: MessageType }>`
  background: ${({ type }) => {
    switch (type) {
      case 'warning': return theme.colors.warning;
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.danger;
      case 'loading': return '#9C27B0';
      case 'network': return theme.colors.danger;
      default: return theme.colors.primary;
    }
  }};
  color: ${theme.colors.white};
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  text-decoration: none;
  display: inline-block;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid ${({ type }) => {
      switch (type) {
        case 'warning': return theme.colors.warning;
        case 'success': return theme.colors.success;
        case 'error': return theme.colors.danger;
        case 'loading': return '#9C27B0';
        case 'network': return theme.colors.danger;
        default: return theme.colors.primary;
      }
    }};
    outline-offset: 2px;
  }
`;

const getDefaultIcon = (type: MessageType): string => {
  switch (type) {
    case 'warning': return '⚠️';
    case 'success': return '✅';
    case 'error': return '❌';
    case 'empty': return '📊';
    case 'loading': return '⏳';
    case 'network': return '🌐';
    default: return 'ℹ️';
  }
};

export const InformativeMessage: React.FC<InformativeMessageProps> = ({
  type,
  icon,
  title,
  description,
  actionText,
  onAction,
  actionLink,
  className,
  showIcon = true
}) => {
  const displayIcon = icon || getDefaultIcon(type);

  return (
    <MessageContainer type={type} className={className}>
      {showIcon && <MessageIcon type={type}>{displayIcon}</MessageIcon>}
      <MessageTitle type={type}>{title}</MessageTitle>
      <MessageDescription>{description}</MessageDescription>
      {actionText && (
        actionLink ? (
          <MessageLink type={type} href={actionLink}>
            {actionText}
          </MessageLink>
        ) : onAction ? (
          <MessageAction type={type} onClick={onAction}>
            {actionText}
          </MessageAction>
        ) : null
      )}
    </MessageContainer>
  );
};
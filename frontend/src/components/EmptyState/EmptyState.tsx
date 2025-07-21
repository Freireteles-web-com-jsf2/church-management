import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionLink?: string;
  className?: string;
}

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  text-align: center;
  min-height: 200px;
  color: ${theme.colors.textLight};
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${theme.spacing.lg};
  opacity: 0.6;
`;

const EmptyStateTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.sm};
`;

const EmptyStateDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textLight};
  margin-bottom: ${theme.spacing.lg};
  max-width: 300px;
  line-height: 1.5;
`;

const EmptyStateAction = styled.button`
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color ${theme.transitions.normal};
  text-decoration: none;
  display: inline-block;

  &:hover {
    background: ${theme.colors.primaryDark};
  }

  &:focus {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }
`;

const EmptyStateLink = styled.a`
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color ${theme.transitions.normal};
  text-decoration: none;
  display: inline-block;

  &:hover {
    background: ${theme.colors.primaryDark};
  }

  &:focus {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📊',
  title,
  description,
  actionText,
  onAction,
  actionLink,
  className
}) => {
  return (
    <EmptyStateContainer className={className}>
      <EmptyStateIcon>{icon}</EmptyStateIcon>
      <EmptyStateTitle>{title}</EmptyStateTitle>
      <EmptyStateDescription>{description}</EmptyStateDescription>
      {actionText && (
        actionLink ? (
          <EmptyStateLink href={actionLink}>
            {actionText}
          </EmptyStateLink>
        ) : onAction ? (
          <EmptyStateAction onClick={onAction}>
            {actionText}
          </EmptyStateAction>
        ) : null
      )}
    </EmptyStateContainer>
  );
};
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div<{ size?: 'small' | 'medium' | 'large' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  ${props => {
    switch (props.size) {
      case 'small':
        return `width: 16px; height: 16px;`;
      case 'large':
        return `width: 32px; height: 32px;`;
      default:
        return `width: 20px; height: 20px;`;
    }
  }}
`;

const Spinner = styled.div<{ size?: 'small' | 'medium' | 'large' }>`
  width: 100%;
  height: 100%;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  
  ${props => props.size === 'small' && `border-width: 1.5px;`}
  ${props => props.size === 'large' && `border-width: 3px;`}
`;

const LoadingText = styled.span`
  margin-left: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textLight};
`;

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  text,
  className 
}) => {
  return (
    <SpinnerContainer size={size} className={className}>
      <Spinner size={size} />
      {text && <LoadingText>{text}</LoadingText>}
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
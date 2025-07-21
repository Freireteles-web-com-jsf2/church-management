import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

export interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    style?: React.CSSProperties;
}

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${theme.borderRadius.md};
  transition: ${theme.transitions.normal};
  cursor: pointer;
  border: 2px solid transparent;
  text-decoration: none;
  
  /* Tamanhos */
  ${({ size }) => {
        switch (size) {
            case 'sm':
                return css`
          padding: ${theme.spacing.xs} ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.sm};
          min-height: 32px;
        `;
            case 'lg':
                return css`
          padding: ${theme.spacing.md} ${theme.spacing.xl};
          font-size: ${theme.typography.fontSize.lg};
          min-height: 48px;
        `;
            default:
                return css`
          padding: ${theme.spacing.sm} ${theme.spacing.lg};
          font-size: ${theme.typography.fontSize.base};
          min-height: 40px;
        `;
        }
    }}
  
  /* Variantes */
  ${({ variant }) => {
        switch (variant) {
            case 'secondary':
                return css`
          background-color: ${theme.colors.gray};
          color: ${theme.colors.text};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.grayDark};
            color: ${theme.colors.white};
          }
        `;
            case 'outline':
                return css`
          background-color: transparent;
          color: ${theme.colors.primary};
          border-color: ${theme.colors.primary};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primaryVeryLight};
            border-color: ${theme.colors.primaryDark};
          }
        `;
            case 'danger':
                return css`
          background-color: ${theme.colors.danger};
          color: ${theme.colors.white};
          
          &:hover:not(:disabled) {
            background-color: #c0392b;
          }
        `;
            case 'success':
                return css`
          background-color: ${theme.colors.success};
          color: ${theme.colors.white};
          
          &:hover:not(:disabled) {
            background-color: #27ae60;
          }
        `;
            case 'warning':
                return css`
          background-color: ${theme.colors.warning};
          color: ${theme.colors.white};
          
          &:hover:not(:disabled) {
            background-color: #e67e22;
          }
        `;
            default:
                return css`
          background-color: ${theme.colors.primary};
          color: ${theme.colors.white};
          
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primaryDark};
          }
        `;
        }
    }}
  
  /* Estados */
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  ${({ disabled }) => disabled && css`
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
    }
  `}
  
  ${({ loading }) => loading && css`
    cursor: wait;
    
    &:hover {
      transform: none;
    }
  `}
  
  &:active:not(:disabled) {
    transform: translateY(1px);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3);
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    className,
    style,
    ...props
}) => {
    return (
        <StyledButton
            variant={variant}
            size={size}
            fullWidth={fullWidth}
            disabled={disabled || loading}
            loading={loading}
            onClick={onClick}
            type={type}
            className={className}
            style={style}
            {...props}
        >
            {loading && <LoadingSpinner />}
            {children}
        </StyledButton>
    );
};

export default Button;
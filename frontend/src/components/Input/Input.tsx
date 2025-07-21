import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
}

const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: ${theme.spacing.md};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const InputLabel = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const IconWrapper = styled.div<{ position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ position }) => position === 'left' && css`left: ${theme.spacing.md};`}
  ${({ position }) => position === 'right' && css`right: ${theme.spacing.md};`}
  color: ${theme.colors.grayDark};
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const StyledInput = styled.input<{
  hasError?: boolean;
  hasLeftIcon?: boolean;
  hasRightIcon?: boolean;
  variant?: 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
}>`
  width: 100%;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${({ hasError }) => (hasError ? theme.colors.danger : theme.colors.gray)};
  transition: ${theme.transitions.normal};
  font-family: ${theme.typography.fontFamily.primary};
  
  &:focus {
    outline: none;
    border-color: ${({ hasError }) => (hasError ? theme.colors.danger : theme.colors.primary)};
    box-shadow: 0 0 0 3px ${({ hasError }) => 
      hasError ? 'rgba(231, 76, 60, 0.2)' : 'rgba(74, 144, 226, 0.2)'};
  }
  
  &:disabled {
    background-color: ${theme.colors.grayLight};
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  /* Variantes */
  ${({ variant }) => {
    switch (variant) {
      case 'filled':
        return css`
          background-color: ${theme.colors.grayLight};
          &:focus {
            background-color: ${theme.colors.white};
          }
        `;
      default:
        return css`
          background-color: ${theme.colors.white};
        `;
    }
  }}
  
  /* Tamanhos */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return css`
          padding: ${theme.spacing.xs} ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.sm};
          height: 32px;
        `;
      case 'lg':
        return css`
          padding: ${theme.spacing.md} ${theme.spacing.lg};
          font-size: ${theme.typography.fontSize.lg};
          height: 48px;
        `;
      default:
        return css`
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.base};
          height: 40px;
        `;
    }
  }}
  
  /* Ícones */
  ${({ hasLeftIcon }) => hasLeftIcon && css`
    padding-left: ${theme.spacing.xl};
  `}
  
  ${({ hasRightIcon }) => hasRightIcon && css`
    padding-right: ${theme.spacing.xl};
  `}
`;

const ErrorText = styled.span`
  color: ${theme.colors.danger};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.xs};
`;

const HelperText = styled.span`
  color: ${theme.colors.textLight};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.xs};
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      leftIcon,
      rightIcon,
      variant = 'outlined',
      size = 'md',
      ...props
    },
    ref
  ) => {
    return (
      <InputContainer fullWidth={fullWidth}>
        {label && <InputLabel>{label}</InputLabel>}
        <InputWrapper>
          {leftIcon && <IconWrapper position="left">{leftIcon}</IconWrapper>}
          <StyledInput
            ref={ref}
            hasError={!!error}
            hasLeftIcon={!!leftIcon}
            hasRightIcon={!!rightIcon}
            variant={variant}
            size={size}
            {...props}
          />
          {rightIcon && <IconWrapper position="right">{rightIcon}</IconWrapper>}
        </InputWrapper>
        {error && <ErrorText>{error}</ErrorText>}
        {helperText && !error && <HelperText>{helperText}</HelperText>}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';

export default Input;
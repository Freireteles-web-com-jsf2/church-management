import React, { useState, forwardRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';
import { useLocalAuth } from '../../contexts/LocalAuthContext';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  showStrengthIndicator?: boolean;
  showRequirements?: boolean;
  variant?: 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
}

const PasswordContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: ${theme.spacing.md};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const PasswordLabel = styled.label`
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

const StyledPasswordInput = styled.input<{
  hasError?: boolean;
  variant?: 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
}>`
  width: 100%;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${({ hasError }) => (hasError ? theme.colors.danger : theme.colors.gray)};
  transition: ${theme.transitions.normal};
  font-family: ${theme.typography.fontFamily.primary};
  padding-right: 40px; /* Space for toggle button */
  
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
`;

const ToggleButton = styled.button`
  position: absolute;
  right: ${theme.spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.grayDark};
  padding: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${theme.colors.primary};
  }
  
  &:focus {
    outline: none;
    color: ${theme.colors.primary};
  }
`;

const StrengthIndicator = styled.div`
  margin-top: ${theme.spacing.sm};
`;

const StrengthBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: ${theme.colors.grayLight};
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: ${theme.spacing.xs};
`;

const StrengthFill = styled.div<{ strength: number; level: 'weak' | 'fair' | 'good' | 'strong' }>`
  height: 100%;
  width: ${({ strength }) => strength}%;
  transition: all 0.3s ease;
  background-color: ${({ level }) => {
    switch (level) {
      case 'weak':
        return theme.colors.danger;
      case 'fair':
        return '#ff9800';
      case 'good':
        return '#2196f3';
      case 'strong':
        return theme.colors.success;
      default:
        return theme.colors.grayLight;
    }
  }};
`;

const StrengthText = styled.div<{ level: 'weak' | 'fair' | 'good' | 'strong' }>`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${({ level }) => {
    switch (level) {
      case 'weak':
        return theme.colors.danger;
      case 'fair':
        return '#ff9800';
      case 'good':
        return '#2196f3';
      case 'strong':
        return theme.colors.success;
      default:
        return theme.colors.textLight;
    }
  }};
`;

const RequirementsList = styled.ul`
  margin: ${theme.spacing.sm} 0 0 0;
  padding: 0;
  list-style: none;
`;

const RequirementItem = styled.li<{ met: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  color: ${({ met }) => (met ? theme.colors.success : theme.colors.textLight)};
  margin-bottom: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  
  &::before {
    content: ${({ met }) => (met ? '"✓"' : '"○"')};
    margin-right: ${theme.spacing.xs};
    font-weight: bold;
  }
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

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      showStrengthIndicator = false,
      showRequirements = false,
      variant = 'outlined',
      size = 'md',
      onValidationChange,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [passwordValue, setPasswordValue] = useState(value || '');
    const { validatePassword, getPasswordStrength } = useLocalAuth();

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    // Validate password and get strength when value changes
    const validation = validatePassword(passwordValue as string);
    const strength = getPasswordStrength(passwordValue as string);

    // Call validation change callback
    useEffect(() => {
      if (onValidationChange) {
        onValidationChange(validation.valid, validation.errors || []);
      }
    }, [validation.valid, validation.errors, onValidationChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setPasswordValue(newValue);
      
      if (onChange) {
        onChange(e);
      }
    };

    // Password requirements for display
    const requirements = [
      { text: 'Pelo menos 8 caracteres', met: (passwordValue as string).length >= 8 },
      { text: 'Pelo menos uma letra', met: /[a-zA-Z]/.test(passwordValue as string) },
      { text: 'Pelo menos um número', met: /\d/.test(passwordValue as string) },
      { text: 'Pelo menos um caractere especial', met: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue as string) },
    ];

    // Add advanced requirements for longer passwords
    if ((passwordValue as string).length >= 12) {
      requirements.push(
        { text: 'Pelo menos uma letra minúscula', met: /[a-z]/.test(passwordValue as string) },
        { text: 'Pelo menos uma letra maiúscula', met: /[A-Z]/.test(passwordValue as string) }
      );
    }

    return (
      <PasswordContainer fullWidth={fullWidth}>
        {label && <PasswordLabel>{label}</PasswordLabel>}
        <InputWrapper>
          <StyledPasswordInput
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            hasError={!!error}
            variant={variant}
            size={size}
            value={passwordValue}
            onChange={handleChange}
            {...props}
          />
          <ToggleButton
            type="button"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </ToggleButton>
        </InputWrapper>
        
        {showStrengthIndicator && passwordValue && (
          <StrengthIndicator>
            <StrengthBar>
              <StrengthFill strength={strength.score} level={strength.level} />
            </StrengthBar>
            <StrengthText level={strength.level}>
              Força da senha: {strength.level === 'weak' && 'Fraca'}
              {strength.level === 'fair' && 'Razoável'}
              {strength.level === 'good' && 'Boa'}
              {strength.level === 'strong' && 'Forte'}
              {strength.feedback.length > 0 && ` - ${strength.feedback[0]}`}
            </StrengthText>
          </StrengthIndicator>
        )}
        
        {showRequirements && passwordValue && (
          <RequirementsList>
            {requirements.map((req, index) => (
              <RequirementItem key={index} met={req.met}>
                {req.text}
              </RequirementItem>
            ))}
          </RequirementsList>
        )}
        
        {error && <ErrorText>{error}</ErrorText>}
        {helperText && !error && <HelperText>{helperText}</HelperText>}
      </PasswordContainer>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { FormValidation } from './FormValidation';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const Label = styled.label<{ required?: boolean }>`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text};
  font-size: ${theme.typography.fontSize.sm};
  
  ${props => props.required && `
    &::after {
      content: ' *';
      color: ${theme.colors.danger};
    }
  `}
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input<{ hasError?: boolean; hasSuccess?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  transition: all ${theme.transitions.normal};
  
  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    outline: none;
  }
  
  &:disabled {
    background: ${theme.colors.grayLight};
    color: ${theme.colors.textLight};
    cursor: not-allowed;
  }
  
  ${props => props.hasError && `
    border-color: ${theme.colors.danger};
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    
    &:focus {
      border-color: ${theme.colors.danger};
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    }
  `}
  
  ${props => props.hasSuccess && `
    border-color: ${theme.colors.success};
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
  `}
`;

const InputIcon = styled.div<{ position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.position}: ${theme.spacing.md};
  color: ${theme.colors.textLight};
  pointer-events: none;
  font-size: ${theme.typography.fontSize.sm};
`;

const ActionButton = styled.button`
  position: absolute;
  right: ${theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${theme.colors.textLight};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
  transition: color ${theme.transitions.normal};
  
  &:hover {
    color: ${theme.colors.primary};
  }
`;

const HelpText = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textLight};
  margin-top: ${theme.spacing.xs};
`;

const CharacterCount = styled.div<{ isOverLimit?: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  color: ${props => props.isOverLimit ? theme.colors.danger : theme.colors.textLight};
  text-align: right;
  margin-top: ${theme.spacing.xs};
`;

interface ValidationRule {
  message: string;
  isValid: boolean;
}

interface FormInputProps {
  label?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  success?: boolean;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  actionButton?: {
    icon: React.ReactNode;
    onClick: () => void;
    title: string;
  };
  validationRules?: ValidationRule[];
  maxLength?: number;
  showCharacterCount?: boolean;
  className?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  success = false,
  helpText,
  leftIcon,
  rightIcon,
  actionButton,
  validationRules = [],
  maxLength,
  showCharacterCount = false,
  className,
  id,
  name,
  autoComplete
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const hasError = !!error || validationRules.some(rule => !rule.isValid);
  const hasSuccess = success && !hasError && value.length > 0;
  const isOverLimit = maxLength ? value.length > maxLength : false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!maxLength || newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <InputContainer className={className}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      
      <InputWrapper>
        {leftIcon && <InputIcon position="left">{leftIcon}</InputIcon>}
        
        <Input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          hasError={hasError}
          hasSuccess={hasSuccess}
          autoComplete={autoComplete}
          style={{
            paddingLeft: leftIcon ? '40px' : undefined,
            paddingRight: (rightIcon || actionButton) ? '40px' : undefined
          }}
        />
        
        {rightIcon && <InputIcon position="right">{rightIcon}</InputIcon>}
        {actionButton && (
          <ActionButton
            type="button"
            onClick={actionButton.onClick}
            title={actionButton.title}
          >
            {actionButton.icon}
          </ActionButton>
        )}
      </InputWrapper>
      
      {error && (
        <div style={{ color: theme.colors.danger, fontSize: theme.typography.fontSize.xs }}>
          {error}
        </div>
      )}
      
      {validationRules.length > 0 && (isFocused || hasError) && (
        <FormValidation rules={validationRules} />
      )}
      
      {helpText && !error && (
        <HelpText>{helpText}</HelpText>
      )}
      
      {showCharacterCount && maxLength && (
        <CharacterCount isOverLimit={isOverLimit}>
          {value.length}/{maxLength}
        </CharacterCount>
      )}
    </InputContainer>
  );
};

export default FormInput;
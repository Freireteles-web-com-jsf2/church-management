import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const ValidationContainer = styled.div`
  margin-top: ${theme.spacing.xs};
`;

const ValidationMessage = styled.div<{ isValid: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  color: ${props => props.isValid ? theme.colors.success : theme.colors.danger};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.xs};
`;

const ValidationIcon = styled.span`
  font-size: ${theme.typography.fontSize.xs};
`;

const PasswordStrengthBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${theme.colors.grayLight};
  border-radius: 2px;
  margin-top: ${theme.spacing.xs};
  overflow: hidden;
`;

const PasswordStrengthFill = styled.div<{ strength: number; level: string }>`
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  width: ${props => props.strength}%;
  background: ${props => {
    switch (props.level) {
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

const PasswordStrengthText = styled.div<{ level: string }>`
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.xs};
  color: ${props => {
    switch (props.level) {
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
  font-weight: ${theme.typography.fontWeight.medium};
`;

interface ValidationRule {
  message: string;
  isValid: boolean;
}

interface FormValidationProps {
  rules?: ValidationRule[];
  className?: string;
}

export const FormValidation: React.FC<FormValidationProps> = ({
  rules = [],
  className
}) => {
  if (rules.length === 0) return null;

  return (
    <ValidationContainer className={className}>
      {rules.map((rule, index) => (
        <ValidationMessage key={index} isValid={rule.isValid}>
          <ValidationIcon>
            {rule.isValid ? '✓' : '✗'}
          </ValidationIcon>
          {rule.message}
        </ValidationMessage>
      ))}
    </ValidationContainer>
  );
};

interface PasswordStrengthProps {
  password: string;
  getPasswordStrength: (password: string) => {
    score: number;
    level: 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
  };
  className?: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  getPasswordStrength,
  className
}) => {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const strengthPercentage = (strength.score / 4) * 100;

  const levelText = {
    weak: 'Fraca',
    fair: 'Regular',
    good: 'Boa',
    strong: 'Forte'
  };

  return (
    <ValidationContainer className={className}>
      <PasswordStrengthBar>
        <PasswordStrengthFill 
          strength={strengthPercentage} 
          level={strength.level}
        />
      </PasswordStrengthBar>
      <PasswordStrengthText level={strength.level}>
        Força da senha: {levelText[strength.level]}
      </PasswordStrengthText>
      {strength.feedback.length > 0 && (
        <FormValidation 
          rules={strength.feedback.map(feedback => ({
            message: feedback,
            isValid: false
          }))}
        />
      )}
    </ValidationContainer>
  );
};

export default FormValidation;
import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

export interface FormColumnProps {
  children: React.ReactNode;
  width?: 1 | 2 | 3 | 4 | 6 | 12;
  className?: string;
}

export interface FormGroupProps {
  children: React.ReactNode;
  label?: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

const StyledForm = styled.form`
  width: 100%;
`;

const StyledFormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 -${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StyledFormColumn = styled.div<{ width?: 1 | 2 | 3 | 4 | 6 | 12 }>`
  padding: 0 ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  
  ${({ width }) => {
    switch (width) {
      case 1:
        return 'width: 8.333333%;';
      case 2:
        return 'width: 16.666667%;';
      case 3:
        return 'width: 25%;';
      case 4:
        return 'width: 33.333333%;';
      case 6:
        return 'width: 50%;';
      case 12:
      default:
        return 'width: 100%;';
    }
  }}
  
  @media (max-width: ${theme.breakpoints.md}) {
    width: 100%;
  }
`;

const StyledFormGroup = styled.div`
  margin-bottom: ${theme.spacing.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FormLabel = styled.label<{ required?: boolean }>`
  display: block;
  margin-bottom: ${theme.spacing.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text};
  
  ${({ required }) => required && `
    &::after {
      content: '*';
      color: ${theme.colors.danger};
      margin-left: ${theme.spacing.xs};
    }
  `}
`;

const ErrorText = styled.div`
  color: ${theme.colors.danger};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.xs};
`;

const HelperText = styled.div`
  color: ${theme.colors.textLight};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.xs};
`;

export const Form: React.FC<FormProps> = ({ children, onSubmit, ...props }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit} {...props}>
      {children}
    </StyledForm>
  );
};

export const FormRow: React.FC<FormRowProps> = ({ children, className }) => {
  return <StyledFormRow className={className}>{children}</StyledFormRow>;
};

export const FormColumn: React.FC<FormColumnProps> = ({ children, width = 12, className }) => {
  return (
    <StyledFormColumn width={width} className={className}>
      {children}
    </StyledFormColumn>
  );
};

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  label,
  htmlFor,
  error,
  helperText,
  required,
  className,
}) => {
  return (
    <StyledFormGroup className={className}>
      {label && <FormLabel htmlFor={htmlFor} required={required}>{label}</FormLabel>}
      {children}
      {error && <ErrorText>{error}</ErrorText>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </StyledFormGroup>
  );
};

export default Form;
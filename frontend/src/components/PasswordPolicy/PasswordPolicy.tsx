import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

export interface PasswordPolicyProps {
  className?: string;
  title?: string;
  showTitle?: boolean;
}

const PolicyContainer = styled.div`
  background-color: ${theme.colors.grayLight};
  border: 1px solid ${theme.colors.gray};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin: ${theme.spacing.md} 0;
`;

const PolicyTitle = styled.h4`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text};
`;

const PolicyList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const PolicyItem = styled.li`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textLight};
  margin-bottom: ${theme.spacing.xs};
  display: flex;
  align-items: flex-start;
  
  &::before {
    content: "•";
    color: ${theme.colors.primary};
    margin-right: ${theme.spacing.xs};
    font-weight: bold;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PolicySection = styled.div`
  margin-bottom: ${theme.spacing.sm};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h5`
  margin: 0 0 ${theme.spacing.xs} 0;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const PasswordPolicy: React.FC<PasswordPolicyProps> = ({
  className,
  title = 'Política de Senhas',
  showTitle = true,
}) => {
  return (
    <PolicyContainer className={className}>
      {showTitle && <PolicyTitle>{title}</PolicyTitle>}
      
      <PolicySection>
        <SectionTitle>Requisitos Básicos</SectionTitle>
        <PolicyList>
          <PolicyItem>Mínimo de 8 caracteres</PolicyItem>
          <PolicyItem>Pelo menos uma letra (a-z ou A-Z)</PolicyItem>
          <PolicyItem>Pelo menos um número (0-9)</PolicyItem>
          <PolicyItem>Pelo menos um caractere especial (!@#$%^&*)</PolicyItem>
        </PolicyList>
      </PolicySection>
      
      <PolicySection>
        <SectionTitle>Requisitos Avançados (12+ caracteres)</SectionTitle>
        <PolicyList>
          <PolicyItem>Pelo menos uma letra minúscula (a-z)</PolicyItem>
          <PolicyItem>Pelo menos uma letra maiúscula (A-Z)</PolicyItem>
        </PolicyList>
      </PolicySection>
      
      <PolicySection>
        <SectionTitle>Restrições</SectionTitle>
        <PolicyList>
          <PolicyItem>Não pode conter sequências comuns (123456, qwerty)</PolicyItem>
          <PolicyItem>Não pode conter palavras comuns (password, admin)</PolicyItem>
          <PolicyItem>Não pode ter mais de 2 caracteres idênticos consecutivos</PolicyItem>
          <PolicyItem>Não pode começar ou terminar com espaços</PolicyItem>
          <PolicyItem>Máximo de 128 caracteres</PolicyItem>
        </PolicyList>
      </PolicySection>
    </PolicyContainer>
  );
};

export default PasswordPolicy;
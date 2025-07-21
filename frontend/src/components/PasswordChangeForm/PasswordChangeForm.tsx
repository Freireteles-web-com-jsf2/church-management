import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button, Input, PasswordInput, Alert } from '../';
import { useLocalAuth } from '../../contexts/LocalAuthContext';
import { usePasswordValidation } from '../../hooks/usePasswordValidation';

export interface PasswordChangeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  className?: string;
}

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const FormActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const PasswordStrengthInfo = styled.div`
  background: ${theme.colors.grayLight};
  border: 1px solid ${theme.colors.gray};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-top: ${theme.spacing.sm};
`;

const PasswordTips = styled.div`
  margin-top: ${theme.spacing.md};
`;

const TipsList = styled.ul`
  margin: ${theme.spacing.sm} 0;
  padding-left: ${theme.spacing.lg};
  color: ${theme.colors.textLight};
  font-size: ${theme.typography.fontSize.sm};
`;

const TipItem = styled.li`
  margin-bottom: ${theme.spacing.xs};
`;

const SecurityNote = styled.div`
  background: ${theme.colors.info}20;
  border: 1px solid ${theme.colors.info};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.text};
  font-size: ${theme.typography.fontSize.sm};
`;

export const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  onSuccess,
  onCancel,
  showCancelButton = true,
  className
}) => {
  const { changePassword, isLoading } = useLocalAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswordTips, setShowPasswordTips] = useState(false);

  // Use password validation hook for new password
  const { isValid: isNewPasswordValid, errors: passwordErrors } = usePasswordValidation(formData.newPassword);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear messages when user starts typing
    if (message) {
      setMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate current password
    if (!formData.currentPassword.trim()) {
      setMessage({ type: 'error', text: 'Senha atual é obrigatória' });
      return;
    }

    // Validate new password
    if (!isNewPasswordValid) {
      setMessage({ type: 'error', text: passwordErrors[0] || 'Nova senha não atende aos requisitos' });
      return;
    }

    // Validate password confirmation
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    // Check if new password is different from current
    if (formData.currentPassword === formData.newPassword) {
      setMessage({ type: 'error', text: 'A nova senha deve ser diferente da senha atual' });
      return;
    }

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Call success callback after a short delay
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erro ao alterar senha. Verifique se a senha atual está correta.' 
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setMessage(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <FormContainer className={className}>
      <SecurityNote>
        🔒 <strong>Dica de Segurança:</strong> Use uma senha forte e única. Evite reutilizar senhas de outras contas.
      </SecurityNote>

      {message && (
        <Alert
          variant={message.type}
          message={message.text}
          dismissible
          onClose={() => setMessage(null)}
        />
      )}

      <Form onSubmit={handleSubmit}>
        <Input
          label="Senha Atual"
          name="currentPassword"
          type="password"
          value={formData.currentPassword}
          onChange={handleInputChange}
          required
          fullWidth
          placeholder="Digite sua senha atual"
          autoComplete="current-password"
        />

        <PasswordInput
          label="Nova Senha"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleInputChange}
          required
          fullWidth
          placeholder="Digite sua nova senha"
          showStrengthIndicator={true}
          showRequirements={true}
          autoComplete="new-password"
          onFocus={() => setShowPasswordTips(true)}
        />

        <Input
          label="Confirmar Nova Senha"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
          fullWidth
          placeholder="Confirme sua nova senha"
          autoComplete="new-password"
          error={
            formData.confirmPassword && formData.newPassword !== formData.confirmPassword
              ? 'As senhas não coincidem'
              : undefined
          }
        />

        {showPasswordTips && (
          <PasswordTips>
            <PasswordStrengthInfo>
              <h4 style={{ margin: '0 0 8px 0', fontSize: theme.typography.fontSize.sm }}>
                💡 Dicas para uma senha forte:
              </h4>
              <TipsList>
                <TipItem>Use pelo menos 8 caracteres (recomendado: 12 ou mais)</TipItem>
                <TipItem>Combine letras maiúsculas e minúsculas</TipItem>
                <TipItem>Inclua números e símbolos especiais</TipItem>
                <TipItem>Evite informações pessoais (nome, data de nascimento)</TipItem>
                <TipItem>Não use sequências óbvias (123456, qwerty)</TipItem>
                <TipItem>Considere usar uma frase secreta memorável</TipItem>
              </TipsList>
            </PasswordStrengthInfo>
          </PasswordTips>
        )}

        <FormActions>
          {showCancelButton && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading || !isNewPasswordValid || formData.newPassword !== formData.confirmPassword}
          >
            {isLoading ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </FormActions>
      </Form>
    </FormContainer>
  );
};

export default PasswordChangeForm;
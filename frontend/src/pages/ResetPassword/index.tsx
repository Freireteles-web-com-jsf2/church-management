import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button, Input, Alert } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { translateError, translateSuccess } from '../../utils/errorTranslations';

const ResetPasswordContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${theme.colors.primaryVeryLight};
  background-image: linear-gradient(135deg, ${theme.colors.primaryVeryLight} 0%, ${theme.colors.white} 100%);
`;

const ResetPasswordContent = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.lg};
`;

const ResetPasswordCard = styled.div`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  width: 100%;
  max-width: 400px;
  padding: ${theme.spacing.xl};
`;

const ResetPasswordHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
`;

const Logo = styled.div`
  margin-bottom: ${theme.spacing.lg};
  
  img {
    max-width: 80px;
    height: auto;
  }
`;

const ResetPasswordTitle = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  color: ${theme.colors.primaryDark};
  margin-bottom: ${theme.spacing.xs};
`;

const ResetPasswordSubtitle = styled.p`
  color: ${theme.colors.textLight};
  margin-bottom: 0;
`;

const ResetPasswordForm = styled.form`
  margin-bottom: ${theme.spacing.lg};
`;

const ResetPasswordFooter = styled.div`
  text-align: center;
  margin-top: ${theme.spacing.lg};
  
  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // O token já está na URL e o Supabase o gerencia automaticamente
  const { resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validar senha
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    // Validar confirmação de senha
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      // O Supabase gerencia o token automaticamente através da URL
      await resetPassword(password);
      setSuccess('Senha redefinida com sucesso!');

      // Redirecionar para a página de login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(translateError(err as Error));
    }
  };

  return (
    <ResetPasswordContainer>
      <ResetPasswordContent>
        <ResetPasswordCard>
          <ResetPasswordHeader>
            <Logo>
              <img src="/logo-igreja.png" alt="Logo" />
            </Logo>
            <ResetPasswordTitle>Redefinir Senha</ResetPasswordTitle>
            <ResetPasswordSubtitle>
              Digite sua nova senha abaixo.
            </ResetPasswordSubtitle>
          </ResetPasswordHeader>

          {error && (
            <Alert
              variant="danger"
              message={error}
              dismissible
              onClose={() => setError(null)}
              style={{ marginBottom: theme.spacing.lg }}
            />
          )}

          {success && (
            <Alert
              variant="success"
              message={success}
              dismissible
              onClose={() => setSuccess(null)}
              style={{ marginBottom: theme.spacing.lg }}
            />
          )}

          <ResetPasswordForm onSubmit={handleSubmit}>
            <Input
              label="Nova senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              fullWidth
              leftIcon="🔒"
              helperText="A senha deve ter pelo menos 8 caracteres."
            />

            <Input
              label="Confirmar senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              fullWidth
              leftIcon="🔒"
            />

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
              style={{ marginTop: theme.spacing.lg }}
            >
              Redefinir senha
            </Button>
          </ResetPasswordForm>

          <ResetPasswordFooter>
            <Link to="/login">Voltar para o login</Link>
          </ResetPasswordFooter>
        </ResetPasswordCard>
      </ResetPasswordContent>
    </ResetPasswordContainer>
  );
};

export default ResetPassword;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalAuth } from '../contexts/LocalAuthContext';
import { theme } from '../styles/theme';
import { Alert, Button, Input } from '../components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.primaryVeryLight} 0%, ${theme.colors.primaryLight} 100%);
  padding: ${theme.spacing.md};
`;

const ForgotPasswordCard = styled.div`
  background: ${theme.colors.white};
  padding: ${theme.spacing.xxl};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.xl};
  width: 100%;
  max-width: 500px;
`;

const Title = styled.h1`
  text-align: center;
  color: ${theme.colors.primaryDark};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize['2xl']};
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${theme.colors.textLight};
  margin-bottom: ${theme.spacing.xl};
  font-size: ${theme.typography.fontSize.base};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const Footer = styled.div`
  margin-top: ${theme.spacing.xl};
  text-align: center;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textLight};
`;

const StyledLink = styled(Link)`
  color: ${theme.colors.primary};
  text-decoration: none;
  font-weight: ${theme.typography.fontWeight.medium};
  
  &:hover {
    text-decoration: underline;
  }
`;

const LocalForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { forgotPassword, isLoading } = useLocalAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError('Por favor, informe seu email');
      return;
    }

    try {
      await forgotPassword(email);
      setSuccess('Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar sua solicitação. Tente novamente.');
    }
  };

  return (
    <Container>
      <ForgotPasswordCard>
        <Title>Recuperar Senha</Title>
        <Subtitle>
          Digite seu email abaixo para receber instruções de recuperação de senha
        </Subtitle>

        {error && (
          <Alert
            variant="danger"
            message={error}
            dismissible
            onClose={() => setError(null)}
            style={{ marginBottom: theme.spacing.md }}
          />
        )}

        {success && (
          <Alert
            variant="success"
            message={success}
            dismissible
            onClose={() => setSuccess(null)}
            style={{ marginBottom: theme.spacing.md }}
          />
        )}

        <Form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu email"
            required
            fullWidth
            leftIcon="✉️"
          />

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar instruções'}
          </Button>
        </Form>

        <Footer>
          <div>Lembrou sua senha? <StyledLink to="/local-login">Voltar para o login</StyledLink></div>
        </Footer>
      </ForgotPasswordCard>
    </Container>
  );
};

export default LocalForgotPassword;
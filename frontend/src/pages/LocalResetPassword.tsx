import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalAuth } from '../contexts/LocalAuthContext';
import { theme } from '../styles/theme';
import { Alert, Button, Input, PasswordInput, PasswordPolicy } from '../components';
import { usePasswordValidation } from '../hooks/usePasswordValidation';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.primaryVeryLight} 0%, ${theme.colors.primaryLight} 100%);
  padding: ${theme.spacing.md};
`;

const ResetPasswordCard = styled.div`
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



const LocalResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [passwordValidationErrors, setPasswordValidationErrors] = useState<string[]>([]);
  const { validateResetToken, resetPassword, isLoading } = useLocalAuth();
  const navigate = useNavigate();

  // Use the password validation hook
  const { isValid: isPasswordValid, errors: validationErrors } = usePasswordValidation(password);

  // Validar token ao carregar
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        setError('Token de recuperação não fornecido');
        return;
      }

      try {
        const result = await validateResetToken(token);
        setIsTokenValid(result.valid);
        
        if (result.valid && result.email) {
          setEmail(result.email);
        } else {
          setError('Token inválido ou expirado. Solicite uma nova recuperação de senha.');
        }
      } catch (err: any) {
        setIsTokenValid(false);
        setError(err.message || 'Erro ao validar o token');
      }
    };

    checkToken();
  }, [token, validateResetToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validar senha usando o hook de validação
    if (!isPasswordValid) {
      setError(validationErrors[0] || 'Senha inválida');
      return;
    }

    // Validar confirmação de senha
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!token) {
      setError('Token de recuperação não fornecido');
      return;
    }

    try {
      await resetPassword(token, password);
      setSuccess('Senha redefinida com sucesso!');
      
      // Redirecionar para a página de login após 3 segundos
      setTimeout(() => {
        navigate('/local-login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir a senha');
    }
  };

  if (isTokenValid === null) {
    return (
      <Container>
        <ResetPasswordCard>
          <Title>Verificando...</Title>
          <Subtitle>Estamos validando seu token de recuperação</Subtitle>
        </ResetPasswordCard>
      </Container>
    );
  }

  if (isTokenValid === false) {
    return (
      <Container>
        <ResetPasswordCard>
          <Title>Link Inválido</Title>
          <Subtitle>
            O link de recuperação de senha é inválido ou expirou.
          </Subtitle>
          <Alert
            variant="danger"
            message={error || 'Token inválido ou expirado'}
            style={{ marginBottom: theme.spacing.lg }}
          />
          <Button
            fullWidth
            onClick={() => navigate('/local-esqueci-senha')}
          >
            Solicitar nova recuperação
          </Button>
          <Footer>
            <div>Lembrou sua senha? <StyledLink to="/local-login">Voltar para o login</StyledLink></div>
          </Footer>
        </ResetPasswordCard>
      </Container>
    );
  }

  return (
    <Container>
      <ResetPasswordCard>
        <Title>Redefinir Senha</Title>
        <Subtitle>
          {email ? `Crie uma nova senha para ${email}` : 'Crie uma nova senha para sua conta'}
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
          <PasswordInput
            label="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua nova senha"
            required
            fullWidth
            showStrengthIndicator={true}
            showRequirements={true}
            onValidationChange={(isValid, errors) => {
              setPasswordValidationErrors(errors);
            }}
          />

          <Input
            label="Confirmar senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme sua nova senha"
            required
            fullWidth
            error={password && confirmPassword && password !== confirmPassword ? 'As senhas não coincidem' : undefined}
          />

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={isLoading || !isPasswordValid || password !== confirmPassword}
          >
            {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
          </Button>
        </Form>

        <Footer>
          <div>Lembrou sua senha? <StyledLink to="/local-login">Voltar para o login</StyledLink></div>
        </Footer>
      </ResetPasswordCard>
    </Container>
  );
};

export default LocalResetPassword;
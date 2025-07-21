import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocalAuth } from '../contexts/LocalAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { theme } from '../styles/theme';
import { LoadingSpinner, MessageAlert } from '../components/Auth';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.primaryVeryLight} 0%, ${theme.colors.primaryLight} 100%);
  padding: ${theme.spacing.md};
`;

const LoginCard = styled.div`
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
  margin-bottom: ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize['3xl']};
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${theme.colors.textLight};
  margin-bottom: ${theme.spacing.xl};
  font-size: ${theme.typography.fontSize.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text};
`;

const Input = styled.input`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  
  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    outline: none;
  }
  
  &.error {
    border-color: ${theme.colors.danger};
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
  }
`;

const PasswordInputContainer = styled.div`
  position: relative;
`;

const PasswordToggleButton = styled.button`
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
  
  &:hover {
    color: ${theme.colors.primary};
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin: ${theme.spacing.md} 0;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${theme.colors.primary};
`;

const CheckboxLabel = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text};
  cursor: pointer;
  user-select: none;
`;



const Button = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color ${theme.transitions.normal};
  
  &:hover {
    background: ${theme.colors.primaryDark};
  }
  
  &:disabled {
    background: ${theme.colors.gray};
    cursor: not-allowed;
  }
`;



const TestUsersSection = styled.div`
  margin-top: ${theme.spacing.xl};
  padding-top: ${theme.spacing.xl};
  border-top: 1px solid ${theme.colors.gray};
`;

const TestUsersTitle = styled.h3`
  color: ${theme.colors.primaryDark};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
`;

const TestUsersList = styled.div`
  display: grid;
  gap: ${theme.spacing.sm};
`;

const TestUserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm};
  background: ${theme.colors.grayLight};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.sm};
`;

const RoleBadge = styled.span<{ role: string }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  color: white;
  background: ${props => {
    switch (props.role) {
      case 'admin': return theme.colors.danger;
      case 'pastor': return theme.colors.primary;
      case 'lider': return theme.colors.info;
      case 'tesoureiro': return theme.colors.warning;
      case 'voluntario': return theme.colors.success;
      default: return theme.colors.grayDark;
    }
  }};
`;

const LocalLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, testUsers } = useLocalAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic client-side validation
    if (!email.trim()) {
      setError('Por favor, digite seu email');
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Por favor, digite sua senha');
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password, rememberMe);
      navigate('/dashboard');
    } catch (err: any) {
      // Enhanced error handling with specific messages
      let errorMessage = 'Erro ao fazer login';
      
      if (err.message) {
        if (err.message.includes('credenciais inválidas') || err.message.includes('invalid credentials')) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
        } else if (err.message.includes('conta bloqueada') || err.message.includes('account locked')) {
          errorMessage = 'Sua conta foi temporariamente bloqueada devido a múltiplas tentativas de login. Tente novamente em alguns minutos.';
        } else if (err.message.includes('conta inativa') || err.message.includes('account inactive')) {
          errorMessage = 'Sua conta está inativa. Entre em contato com o administrador.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (userEmail: string) => {
    setEmail(userEmail);
  };

  return (
    <Container>
      <LoginCard>
        <Title>🏛️ Sistema Igreja</Title>
        <Subtitle>Ambiente de Desenvolvimento</Subtitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email:</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite o email"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Senha:</Label>
            <PasswordInputContainer>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                required
                className={error ? 'error' : ''}
              />
              <PasswordToggleButton
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </PasswordToggleButton>
            </PasswordInputContainer>
          </FormGroup>

          <CheckboxContainer>
            <Checkbox
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <CheckboxLabel htmlFor="rememberMe">
              Lembrar-me neste dispositivo
            </CheckboxLabel>
          </CheckboxContainer>

          {error && (
            <MessageAlert 
              variant="error" 
              message={error}
              onClose={() => setError('')}
            />
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading && <LoadingSpinner size="small" />}
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
          
          <div style={{ textAlign: 'center', marginTop: theme.spacing.md }}>
            <Link to="/local-esqueci-senha" style={{ 
              color: theme.colors.primary, 
              textDecoration: 'none',
              fontSize: theme.typography.fontSize.sm
            }}>
              Esqueceu sua senha?
            </Link>
          </div>
        </Form>

        <TestUsersSection>
          <TestUsersTitle>👥 Usuários de Teste</TestUsersTitle>
          <TestUsersList>
            {testUsers.map((user) => (
              <TestUserItem key={user.id}>
                <div>
                  <strong>{user.name}</strong>
                  <br />
                  <small>{user.email}</small>
                </div>
                <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
                  <RoleBadge role={user.role}>
                    {user.role.toUpperCase()}
                  </RoleBadge>
                  <Button
                    type="button"
                    onClick={() => handleUserSelect(user.email)}
                    style={{ 
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      fontSize: theme.typography.fontSize.xs
                    }}
                  >
                    Selecionar
                  </Button>
                </div>
              </TestUserItem>
            ))}
          </TestUsersList>
        </TestUsersSection>

        <div style={{ marginTop: theme.spacing.lg, textAlign: 'center', fontSize: theme.typography.fontSize.sm, color: theme.colors.textLight }}>
          💡 <strong>Dica:</strong> Qualquer senha funciona para os usuários de teste
        </div>
      </LoginCard>
    </Container>
  );
};

export default LocalLogin;
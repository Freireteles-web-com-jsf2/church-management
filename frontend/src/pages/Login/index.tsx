import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button, Input, Alert } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { translateError } from '../../utils/errorTranslations';

const LoginContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${theme.colors.primaryVeryLight};
  background-image: linear-gradient(135deg, ${theme.colors.primaryVeryLight} 0%, ${theme.colors.white} 100%);
`;

const LoginContent = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.lg};
`;

const LoginCard = styled.div`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  width: 100%;
  max-width: 400px;
  padding: ${theme.spacing.xl};
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
`;

const Logo = styled.div`
  margin-bottom: ${theme.spacing.lg};
  
  img {
    max-width: 120px;
    height: auto;
  }
`;

const LoginTitle = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  color: ${theme.colors.primaryDark};
  margin-bottom: ${theme.spacing.xs};
`;

const LoginSubtitle = styled.p`
  color: ${theme.colors.textLight};
  margin-bottom: 0;
`;

const LoginForm = styled.form`
  margin-bottom: ${theme.spacing.lg};
`;

const LoginFooter = styled.div`
  text-align: center;
  margin-top: ${theme.spacing.xl};
  
  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${theme.spacing.lg} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${theme.colors.gray};
  }
  
  span {
    padding: 0 ${theme.spacing.md};
    color: ${theme.colors.textLight};
    font-size: ${theme.typography.fontSize.sm};
  }
`;

const DemoCredentials = styled.div`
  margin-top: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.primaryVeryLight};
  border-radius: ${theme.borderRadius.md};
  text-align: left;
`;

const CredentialTitle = styled.h4`
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.primaryDark};
  font-size: ${theme.typography.fontSize.sm};
`;

const CredentialItem = styled.div`
  margin-bottom: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
  
  strong {
    color: ${theme.colors.primary};
  }
`;

const QuickLoginButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  font-size: ${theme.typography.fontSize.sm};
  padding: 0;
  margin: 0;
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: ${theme.colors.primaryDark};
  }
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromRaw = location.state?.from?.pathname || '/dashboard';
  const from = fromRaw === '/daschboard' ? '/dashboard' : fromRaw;

  // Obter a URL de redirecionamento após o login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      console.log('Tentando fazer login...');
      await login(email, password);
      console.log('Login bem-sucedido, redirecionando para o dashboard...');
      
      // Usar setTimeout para garantir que o estado de autenticação seja atualizado antes do redirecionamento
      setTimeout(() => {
        console.log('Redirecionando para a página original após timeout...');
        navigate(from);
      }, 500);
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError((err as Error)?.message || translateError(err as Error));
    }
  };

  const handleDemoLogin = async () => {
    // Usando as credenciais de demonstração do Supabase
    const demoEmail = 'pastor@exemplo.com';
    const demoPassword = 'senha123';
    
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      console.log('Tentando fazer login com credenciais de demonstração...');
      await login(demoEmail, demoPassword);
      console.log('Login de demonstração bem-sucedido, redirecionando para o dashboard...');
      
      // Usar setTimeout para garantir que o estado de autenticação seja atualizado antes do redirecionamento
      setTimeout(() => {
        console.log('Redirecionando para a página original após timeout...');
        navigate(from);
      }, 500);
    } catch (err) {
      console.error('Erro ao fazer login com credenciais de demonstração:', err);
      setError((err as Error)?.message || translateError(err as Error));
    }
  };

  return (
    <LoginContainer>
      <LoginContent>
        <LoginCard>
          <LoginHeader>
            <Logo>
              <img src="/logo-igreja.svg" alt="Logo" />
            </Logo>
            <LoginTitle>Siltec Manager</LoginTitle>
            <LoginSubtitle>Entre com suas credenciais para acessar</LoginSubtitle>
          </LoginHeader>

          {error && (
            <div style={{ marginBottom: theme.spacing.lg }}>
              <Alert
                variant="danger"
                message={error}
                dismissible
                onClose={() => setError(null)}
              />
            </div>
          )}

          <LoginForm onSubmit={handleSubmit}>
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              fullWidth
              leftIcon="✉️"
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              fullWidth
              leftIcon="🔒"
            />

            <div style={{ marginTop: theme.spacing.lg }}>
              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                Entrar
              </Button>
            </div>
          </LoginForm>

          <DemoCredentials>
            <CredentialTitle>Acesso de demonstração:</CredentialTitle>
            <CredentialItem><strong>E-mail:</strong> pastor@exemplo.com</CredentialItem>
            <CredentialItem><strong>Senha:</strong> senha123</CredentialItem>
            <CredentialItem><strong>Perfil:</strong> Administrador</CredentialItem>
            <div style={{ textAlign: 'center', marginTop: theme.spacing.sm }}>
              <QuickLoginButton onClick={handleDemoLogin}>
                Entrar com conta de demonstração
              </QuickLoginButton>
            </div>
          </DemoCredentials>

          <LoginFooter>
            <Link to="/esqueci-senha">Esqueci minha senha</Link>

            <Divider>
              <span>ou</span>
            </Divider>

            <p>
              Não tem uma conta? <Link to="/cadastro">Solicitar acesso</Link>
            </p>
          </LoginFooter>
        </LoginCard>
      </LoginContent>
    </LoginContainer>
  );
};

export default Login;
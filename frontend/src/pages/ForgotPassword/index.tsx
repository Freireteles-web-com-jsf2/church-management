import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button, Input, Alert } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { translateError, translateSuccess } from '../../utils/errorTranslations';

const ForgotPasswordContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${theme.colors.primaryVeryLight};
  background-image: linear-gradient(135deg, ${theme.colors.primaryVeryLight} 0%, ${theme.colors.white} 100%);
`;

const ForgotPasswordContent = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.lg};
`;

const ForgotPasswordCard = styled.div`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  width: 100%;
  max-width: 400px;
  padding: ${theme.spacing.xl};
`;

const ForgotPasswordHeader = styled.div`
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

const ForgotPasswordTitle = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  color: ${theme.colors.primaryDark};
  margin-bottom: ${theme.spacing.xs};
`;

const ForgotPasswordSubtitle = styled.p`
  color: ${theme.colors.textLight};
  margin-bottom: 0;
`;

const ForgotPasswordForm = styled.form`
  margin-bottom: ${theme.spacing.lg};
`;

const ForgotPasswordFooter = styled.div`
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

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { forgotPassword, isLoading } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      await forgotPassword(email);
      setSuccess('Enviamos um e-mail com instruções para redefinir sua senha.');
      setEmail('');
    } catch (err) {
      setError(translateError(err as Error));
    }
  };
  
  return (
    <ForgotPasswordContainer>
      <ForgotPasswordContent>
        <ForgotPasswordCard>
          <ForgotPasswordHeader>
            <Logo>
              <img src="/logo-igreja.png" alt="Logo" />
            </Logo>
            <ForgotPasswordTitle>Esqueceu sua senha?</ForgotPasswordTitle>
            <ForgotPasswordSubtitle>
              Digite seu e-mail e enviaremos instruções para redefinir sua senha.
            </ForgotPasswordSubtitle>
          </ForgotPasswordHeader>
          
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
          
          {success && (
            <div style={{ marginBottom: theme.spacing.lg }}>
              <Alert 
                variant="success" 
                message={success} 
                dismissible 
                onClose={() => setSuccess(null)}
              />
            </div>
          )}
          
          <ForgotPasswordForm onSubmit={handleSubmit}>
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
            
            <Button 
              type="submit" 
              fullWidth 
              loading={isLoading}
              disabled={isLoading}
              style={{ marginTop: theme.spacing.lg }}
            >
              Enviar instruções
            </Button>
          </ForgotPasswordForm>
          
          <ForgotPasswordFooter>
            <Link to="/login">Voltar para o login</Link>
          </ForgotPasswordFooter>
        </ForgotPasswordCard>
      </ForgotPasswordContent>
    </ForgotPasswordContainer>
  );
};

export default ForgotPassword;
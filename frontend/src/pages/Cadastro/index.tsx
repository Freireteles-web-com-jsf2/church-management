import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button, Input, Alert } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { translateError, translateSuccess } from '../../utils/errorTranslations';

const CadastroContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${theme.colors.primaryVeryLight};
  background-image: linear-gradient(135deg, ${theme.colors.primaryVeryLight} 0%, ${theme.colors.white} 100%);
`;

const CadastroContent = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.lg};
`;

const CadastroCard = styled.div`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  width: 100%;
  max-width: 600px;
  padding: ${theme.spacing.xl};
`;

const CadastroHeader = styled.div`
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

const CadastroTitle = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  color: ${theme.colors.primaryDark};
  margin-bottom: ${theme.spacing.xs};
`;

const CadastroSubtitle = styled.p`
  color: ${theme.colors.textLight};
  margin-bottom: 0;
`;

const CadastroForm = styled.form`
  margin-bottom: ${theme.spacing.lg};
`;

const FormRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const FormColumn = styled.div<{ width?: number }>`
  flex: ${({ width }) => width || 1};
`;

const CadastroFooter = styled.div`
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

const Cadastro: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    igreja: '',
    cargo: '',
    senha: '',
    confirmarSenha: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validação básica
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    
    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(formData.email, formData.senha, {
        name: formData.nome,
        role: formData.cargo.toLowerCase() as any,
        // Outros dados adicionais podem ser incluídos aqui
      });
      
      setSuccess('Cadastro realizado com sucesso! Aguarde a aprovação do administrador para acessar o sistema.');
      
      // Limpar formulário
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        igreja: '',
        cargo: '',
        senha: '',
        confirmarSenha: ''
      });
      
      // Redirecionar para a página de login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(translateError(err as Error));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <CadastroContainer>
      <CadastroContent>
        <CadastroCard>
          <CadastroHeader>
            <Logo>
              <img src="/logo-igreja.svg" alt="Logo" />
            </Logo>
            <CadastroTitle>Solicitar Acesso</CadastroTitle>
            <CadastroSubtitle>Preencha o formulário abaixo para solicitar acesso ao sistema</CadastroSubtitle>
          </CadastroHeader>
          
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
          
          <CadastroForm onSubmit={handleSubmit}>
            <FormRow>
              <FormColumn>
                <Input
                  label="Nome completo"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  required
                  fullWidth
                />
              </FormColumn>
            </FormRow>
            
            <FormRow>
              <FormColumn>
                <Input
                  label="E-mail"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                  fullWidth
                />
              </FormColumn>
              <FormColumn>
                <Input
                  label="Telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  required
                  fullWidth
                />
              </FormColumn>
            </FormRow>
            
            <FormRow>
              <FormColumn>
                <Input
                  label="Nome da Igreja"
                  name="igreja"
                  value={formData.igreja}
                  onChange={handleChange}
                  placeholder="Nome da sua igreja"
                  required
                  fullWidth
                />
              </FormColumn>
              <FormColumn>
                <Input
                  label="Cargo/Função"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  placeholder="Ex: Pastor, Líder, Tesoureiro"
                  required
                  fullWidth
                />
              </FormColumn>
            </FormRow>
            
            <FormRow>
              <FormColumn>
                <Input
                  label="Senha"
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  fullWidth
                  helperText="A senha deve ter pelo menos 6 caracteres"
                />
              </FormColumn>
              <FormColumn>
                <Input
                  label="Confirmar Senha"
                  type="password"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  fullWidth
                />
              </FormColumn>
            </FormRow>
            
            <div style={{ marginTop: theme.spacing.lg }}>
              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                Solicitar Acesso
              </Button>
            </div>
          </CadastroForm>
          
          <CadastroFooter>
            <p>
              Já tem uma conta? <Link to="/login">Entrar</Link>
            </p>
          </CadastroFooter>
        </CadastroCard>
      </CadastroContent>
    </CadastroContainer>
  );
};

export default Cadastro;
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalAuth } from '../../contexts/LocalAuthContext';

const AccessDeniedContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${theme.colors.primaryVeryLight};
  background-image: linear-gradient(135deg, ${theme.colors.primaryVeryLight} 0%, ${theme.colors.white} 100%);
`;

const AccessDeniedContent = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.lg};
`;

const AccessDeniedCard = styled.div`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  width: 100%;
  max-width: 500px;
  padding: ${theme.spacing.xl};
  text-align: center;
`;

const AccessDeniedIcon = styled.div`
  font-size: 5rem;
  color: ${theme.colors.danger};
  margin-bottom: ${theme.spacing.lg};
`;

const AccessDeniedTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  color: ${theme.colors.primaryDark};
  margin-bottom: ${theme.spacing.md};
`;

const AccessDeniedMessage = styled.p`
  color: ${theme.colors.textLight};
  margin-bottom: ${theme.spacing.xl};
  font-size: ${theme.typography.fontSize.lg};
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const AccessDenied: React.FC = () => {
  const { user: supabaseUser } = useAuth();
  const { user: localUser } = useLocalAuth();
  const location = useLocation();
  
  // Determinar qual sistema de autenticação está sendo usado
  const user = localUser || supabaseUser;
  const isLocalAuth = !!localUser;
  
  // Extrair informações do estado da navegação
  const state = location.state as any;
  const requiredRoles = state?.requiredRoles || [];
  const userRole = state?.userRole || user?.role;
  const fromPath = state?.from;
  
  // Traduzir roles para português
  const roleTranslations: Record<string, string> = {
    admin: 'Administrador',
    pastor: 'Pastor',
    lider: 'Líder',
    tesoureiro: 'Tesoureiro',
    voluntario: 'Voluntário',
    membro: 'Membro'
  };
  
  const translateRole = (role: string) => roleTranslations[role] || role;
  
  return (
    <AccessDeniedContainer>
      <AccessDeniedContent>
        <AccessDeniedCard>
          <AccessDeniedIcon>🔒</AccessDeniedIcon>
          <AccessDeniedTitle>Acesso Negado</AccessDeniedTitle>
          <AccessDeniedMessage>
            Você não tem permissão para acessar esta página.
            {userRole && (
              <>
                <br /><br />
                Seu perfil atual é <strong>{translateRole(userRole)}</strong>.
              </>
            )}
            {requiredRoles.length > 0 && (
              <>
                <br />
                Esta página requer um dos seguintes perfis: <strong>
                  {requiredRoles.map(translateRole).join(', ')}
                </strong>.
              </>
            )}
            {fromPath && (
              <>
                <br /><br />
                <small>Tentativa de acesso: {fromPath}</small>
              </>
            )}
          </AccessDeniedMessage>
          <ButtonGroup>
            <Link to="/dashboard">
              <Button>Ir para o Dashboard</Button>
            </Link>
            <Link to={isLocalAuth ? "/local-login" : "/"}>
              <Button variant="outline">
                {isLocalAuth ? "Fazer Login" : "Voltar para a Página Inicial"}
              </Button>
            </Link>
          </ButtonGroup>
        </AccessDeniedCard>
      </AccessDeniedContent>
    </AccessDeniedContainer>
  );
};

export default AccessDenied;
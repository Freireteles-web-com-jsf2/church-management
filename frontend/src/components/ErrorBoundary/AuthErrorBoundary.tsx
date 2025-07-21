// Specialized Error Boundary for authentication-related errors

import React, { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { DetailedError, AuthErrorType } from '../../types/errors';
import { useLocalAuth } from '../../contexts/LocalAuthContext';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Button } from '../Button';
import { Alert } from '../Alert';

interface AuthErrorBoundaryProps {
  children: ReactNode;
  onAuthError?: (error: DetailedError) => void;
}

const AuthErrorContainer = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  margin: ${theme.spacing.lg};
`;

const AuthErrorTitle = styled.h2`
  color: ${theme.colors.danger};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.xl};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  margin-top: ${theme.spacing.lg};
`;

export const AuthErrorBoundary: React.FC<AuthErrorBoundaryProps> = ({
  children,
  onAuthError,
}) => {
  const { logout, clearAuthState } = useLocalAuth();

  const handleAuthError = async (error: DetailedError) => {
    // Handle authentication-specific errors
    const isAuthError = [
      AuthErrorType.SESSION_EXPIRED,
      AuthErrorType.INVALID_CREDENTIALS,
      AuthErrorType.INSUFFICIENT_PERMISSIONS,
      AuthErrorType.ACCOUNT_LOCKED,
      AuthErrorType.ACCOUNT_INACTIVE,
    ].includes(error.type);

    if (isAuthError) {
      // Clear authentication state for auth errors
      try {
        await logout();
      } catch (logoutError) {
        // If logout fails, force clear the state
        clearAuthState();
      }
    }

    // Call custom handler if provided
    if (onAuthError) {
      onAuthError(error);
    }
  };

  const renderAuthErrorFallback = (error: DetailedError) => {
    const isSessionError = error.type === AuthErrorType.SESSION_EXPIRED;
    const isPermissionError = error.type === AuthErrorType.INSUFFICIENT_PERMISSIONS;
    const isAccountError = [
      AuthErrorType.ACCOUNT_LOCKED,
      AuthErrorType.ACCOUNT_INACTIVE,
    ].includes(error.type);

    return (
      <AuthErrorContainer>
        <AuthErrorTitle>
          {isSessionError && 'Sessão Expirada'}
          {isPermissionError && 'Acesso Negado'}
          {isAccountError && 'Conta Indisponível'}
          {!isSessionError && !isPermissionError && !isAccountError && 'Erro de Autenticação'}
        </AuthErrorTitle>

        <Alert
          variant="warning"
          message={error.userMessage || 'Ocorreu um problema com sua autenticação.'}
          dismissible={false}
        />

        <ButtonGroup>
          {isSessionError && (
            <>
              <Button
                variant="primary"
                onClick={() => window.location.href = '/login'}
              >
                Fazer Login Novamente
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
              >
                Recarregar Página
              </Button>
            </>
          )}

          {isPermissionError && (
            <>
              <Button
                variant="primary"
                onClick={() => window.history.back()}
              >
                Voltar
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/dashboard'}
              >
                Ir para Dashboard
              </Button>
            </>
          )}

          {isAccountError && (
            <Button
              variant="primary"
              onClick={() => window.location.href = '/login'}
            >
              Ir para Login
            </Button>
          )}

          {!isSessionError && !isPermissionError && !isAccountError && (
            <>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                Tentar Novamente
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/login'}
              >
                Fazer Login
              </Button>
            </>
          )}
        </ButtonGroup>
      </AuthErrorContainer>
    );
  };

  return (
    <ErrorBoundary
      onError={handleAuthError}
      fallback={undefined} // We'll handle the fallback in the error handler
      context={{
        component: 'AuthErrorBoundary',
        action: 'authentication',
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default AuthErrorBoundary;
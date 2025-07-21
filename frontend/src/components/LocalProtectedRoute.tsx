import React, { useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useLocalAuth } from '../contexts/LocalAuthContext';

type UserRole = 'admin' | 'pastor' | 'lider' | 'tesoureiro' | 'voluntario' | 'membro';

interface LocalProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAllRoles?: boolean; // Se true, usuário deve ter TODAS as roles especificadas
  fallbackPath?: string; // Caminho personalizado para redirecionamento em caso de acesso negado
  onAccessDenied?: (user: any, requiredRoles: UserRole[]) => void; // Callback para acesso negado
}

// Hierarquia de permissões (roles superiores incluem permissões das inferiores)
const roleHierarchy: Record<UserRole, UserRole[]> = {
  admin: ['admin', 'pastor', 'lider', 'tesoureiro', 'voluntario', 'membro'],
  pastor: ['pastor', 'lider', 'tesoureiro', 'voluntario', 'membro'],
  lider: ['lider', 'voluntario', 'membro'],
  tesoureiro: ['tesoureiro', 'voluntario', 'membro'],
  voluntario: ['voluntario', 'membro'],
  membro: ['membro']
};

const LocalProtectedRoute: React.FC<LocalProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  requireAllRoles = false,
  fallbackPath = '/acesso-negado',
  onAccessDenied
}) => {
  const { user, isAuthenticated, isLoading, sessionStatus, resetIdleTimer } = useLocalAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Monitorar status da sessão e redirecionar se expirada
  useEffect(() => {
    if (isAuthenticated && (sessionStatus === 'expired' || sessionStatus === 'idle')) {
      navigate('/local-login', { 
        replace: true,
        state: { from: location.pathname }
      });
    }
    
    // Resetar o timer de inatividade quando a rota é acessada
    resetIdleTimer();
  }, [isAuthenticated, sessionStatus, navigate, resetIdleTimer, location.pathname]);

  // Função para verificar se o usuário tem permissão baseada na hierarquia
  const hasPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    
    const userPermissions = roleHierarchy[userRole] || [];
    
    if (requireAllRoles) {
      // Usuário deve ter TODAS as roles especificadas
      return requiredRoles.every(role => userPermissions.includes(role));
    } else {
      // Usuário deve ter PELO MENOS UMA das roles especificadas
      return requiredRoles.some(role => userPermissions.includes(role));
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/local-login" state={{ from: location.pathname }} replace />;
  }

  // Verificar permissões se especificadas
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !hasPermission(user.role, allowedRoles)) {
      // Chamar callback se fornecido
      if (onAccessDenied) {
        onAccessDenied(user, allowedRoles);
      }
      
      return <Navigate to={fallbackPath} state={{ 
        from: location.pathname,
        requiredRoles: allowedRoles,
        userRole: user?.role
      }} replace />;
    }
  }

  return <>{children}</>;
};

export default LocalProtectedRoute;
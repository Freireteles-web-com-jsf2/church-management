import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocalAuth } from '../../contexts/LocalAuthContext';

type UserRole = 'admin' | 'pastor' | 'lider' | 'tesoureiro' | 'voluntario' | 'membro';

interface NavigationGuardProps {
  children: React.ReactNode;
  // Configurações de redirecionamento
  roleBasedRedirects?: Record<UserRole, string>;
  defaultRedirect?: string;
  loginRedirect?: string;
  // Configurações de rotas
  protectedRoutes?: string[];
  publicRoutes?: string[];
  // Callbacks
  onRedirect?: (from: string, to: string, reason: string) => void;
  onUnauthorizedAccess?: (path: string, user: any) => void;
}

const NavigationGuard: React.FC<NavigationGuardProps> = ({
  children,
  roleBasedRedirects = {
    admin: '/dashboard',
    pastor: '/dashboard',
    lider: '/dashboard',
    tesoureiro: '/financeiro',
    voluntario: '/agenda',
    membro: '/mural'
  },
  defaultRedirect = '/dashboard',
  loginRedirect = '/local-login',
  protectedRoutes = [],
  publicRoutes = [
    '/local-login',
    '/local-esqueci-senha',
    '/local-redefinir-senha',
    '/acesso-negado'
  ],
  onRedirect,
  onUnauthorizedAccess
}) => {
  const { user, isAuthenticated, isLoading } = useLocalAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Função para verificar se uma rota é pública
  const isPublicRoute = (path: string): boolean => {
    return publicRoutes.some(route => 
      path === route || path.startsWith(route + '/')
    );
  };

  // Função para verificar se uma rota é protegida
  const isProtectedRoute = (path: string): boolean => {
    if (protectedRoutes.length === 0) {
      // Se não há rotas protegidas especificadas, considerar todas exceto as públicas
      return !isPublicRoute(path);
    }
    return protectedRoutes.some(route => 
      path === route || path.startsWith(route + '/')
    );
  };

  // Função para obter a rota de redirecionamento baseada na role
  const getRedirectRoute = (userRole: UserRole): string => {
    return roleBasedRedirects[userRole] || defaultRedirect;
  };

  useEffect(() => {
    if (isLoading) return; // Aguardar carregamento da autenticação

    const currentPath = location.pathname;
    const state = location.state as any;

    // Usuário autenticado
    if (isAuthenticated && user) {
      // Redirecionar de páginas de login/públicas para dashboard após login
      if (currentPath === loginRedirect || currentPath === '/') {
        const targetRoute = state?.from || getRedirectRoute(user.role);
        
        if (onRedirect) {
          onRedirect(currentPath, targetRoute, 'login_success');
        }
        
        navigate(targetRoute, { replace: true });
        return;
      }

      // Verificar redirecionamentos específicos por role
      if (currentPath === '/dashboard' && roleBasedRedirects[user.role] !== '/dashboard') {
        const targetRoute = getRedirectRoute(user.role);
        
        if (onRedirect) {
          onRedirect(currentPath, targetRoute, 'role_based_redirect');
        }
        
        navigate(targetRoute, { replace: true });
        return;
      }
    }
    // Usuário não autenticado
    else {
      // Redirecionar rotas protegidas para login
      if (isProtectedRoute(currentPath)) {
        if (onUnauthorizedAccess) {
          onUnauthorizedAccess(currentPath, user);
        }

        if (onRedirect) {
          onRedirect(currentPath, loginRedirect, 'unauthorized_access');
        }

        navigate(loginRedirect, {
          replace: true,
          state: { from: currentPath }
        });
        return;
      }
    }
  }, [
    isAuthenticated,
    user,
    isLoading,
    location.pathname,
    location.state,
    navigate,
    loginRedirect,
    roleBasedRedirects,
    defaultRedirect,
    onRedirect,
    onUnauthorizedAccess
  ]);

  return <>{children}</>;
};

export default NavigationGuard;
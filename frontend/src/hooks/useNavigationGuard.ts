import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocalAuth } from '../contexts/LocalAuthContext';

type UserRole = 'admin' | 'pastor' | 'lider' | 'tesoureiro' | 'voluntario' | 'membro';

interface NavigationGuardOptions {
  redirectOnLogin?: boolean; // Se deve redirecionar após login
  redirectOnLogout?: boolean; // Se deve redirecionar após logout
  defaultRoute?: string; // Rota padrão para redirecionamento
  roleBasedRedirects?: Record<UserRole, string>; // Redirecionamentos específicos por role
  protectedRoutes?: string[]; // Rotas que requerem autenticação
  publicRoutes?: string[]; // Rotas públicas (não requerem autenticação)
  onUnauthorizedAccess?: (path: string, user: any) => void; // Callback para acesso não autorizado
}

export const useNavigationGuard = (options: NavigationGuardOptions = {}) => {
  const {
    redirectOnLogin = true,
    redirectOnLogout = true,
    defaultRoute = '/dashboard',
    roleBasedRedirects = {},
    protectedRoutes = [],
    publicRoutes = ['/local-login', '/local-esqueci-senha', '/acesso-negado'],
    onUnauthorizedAccess
  } = options;

  const { user, isAuthenticated, isLoading } = useLocalAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Função para obter a rota de redirecionamento baseada na role do usuário
  const getRedirectRoute = (userRole: UserRole): string => {
    return roleBasedRedirects[userRole] || defaultRoute;
  };

  // Função para verificar se uma rota é protegida
  const isProtectedRoute = (path: string): boolean => {
    if (protectedRoutes.length === 0) {
      // Se não há rotas protegidas especificadas, considerar todas exceto as públicas como protegidas
      return !publicRoutes.includes(path);
    }
    return protectedRoutes.some(route => path.startsWith(route));
  };

  // Função para verificar se uma rota é pública
  const isPublicRoute = (path: string): boolean => {
    return publicRoutes.includes(path) || publicRoutes.some(route => path.startsWith(route));
  };

  // Efeito para lidar com mudanças de autenticação
  useEffect(() => {
    if (isLoading) return; // Aguardar carregamento

    const currentPath = location.pathname;
    const state = location.state as any;

    // Se o usuário está autenticado
    if (isAuthenticated && user) {
      // Redirecionar de páginas de login para o dashboard
      if (redirectOnLogin && (currentPath === '/local-login' || currentPath === '/')) {
        const targetRoute = state?.from || getRedirectRoute(user.role);
        navigate(targetRoute, { replace: true });
        return;
      }

      // Verificar se o usuário tem acesso à rota atual
      if (isProtectedRoute(currentPath)) {
        // Aqui você pode adicionar lógica adicional de verificação de permissões
        // Por enquanto, apenas permitir acesso se estiver autenticado
      }
    } 
    // Se o usuário não está autenticado
    else {
      // Redirecionar rotas protegidas para login
      if (isProtectedRoute(currentPath)) {
        if (onUnauthorizedAccess) {
          onUnauthorizedAccess(currentPath, user);
        }
        navigate('/local-login', { 
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
    redirectOnLogin,
    onUnauthorizedAccess
  ]);

  // Função para fazer logout com redirecionamento
  const logoutWithRedirect = async (redirectTo?: string) => {
    try {
      // O logout será feito pelo contexto
      if (redirectOnLogout) {
        navigate(redirectTo || '/local-login', { replace: true });
      }
    } catch (error) {
      console.error('Erro durante logout:', error);
    }
  };

  // Função para navegar com verificação de permissões
  const navigateWithGuard = (path: string, options?: { replace?: boolean; state?: any }) => {
    if (!isAuthenticated && isProtectedRoute(path)) {
      navigate('/local-login', { 
        replace: true, 
        state: { from: path } 
      });
      return false;
    }

    navigate(path, options);
    return true;
  };

  return {
    // Estado
    isAuthenticated,
    user,
    isLoading,
    currentPath: location.pathname,
    
    // Funções utilitárias
    isProtectedRoute,
    isPublicRoute,
    getRedirectRoute,
    
    // Funções de navegação
    logoutWithRedirect,
    navigateWithGuard,
    
    // Informações da rota
    fromPath: (location.state as any)?.from
  };
};
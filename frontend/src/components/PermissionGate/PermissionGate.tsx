import React from 'react';
import { useLocalAuth } from '../../contexts/LocalAuthContext';

type UserRole = 'admin' | 'pastor' | 'lider' | 'tesoureiro' | 'voluntario' | 'membro';

interface PermissionGateProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAllRoles?: boolean; // Se true, usuário deve ter TODAS as roles especificadas
  fallback?: React.ReactNode; // Componente a ser renderizado se não tiver permissão
  onAccessDenied?: (user: any, requiredRoles: UserRole[]) => void; // Callback para acesso negado
  showForUnauthenticated?: boolean; // Se true, mostra o conteúdo mesmo se não autenticado
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

const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  allowedRoles,
  requireAllRoles = false,
  fallback = null,
  onAccessDenied,
  showForUnauthenticated = false
}) => {
  const { user, isAuthenticated } = useLocalAuth();

  // Se não está autenticado
  if (!isAuthenticated) {
    if (showForUnauthenticated) {
      return <>{children}</>;
    }
    return <>{fallback}</>;
  }

  // Se não há roles especificadas, mostrar o conteúdo (usuário autenticado)
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Função para verificar se o usuário tem permissão baseada na hierarquia
  const hasPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
    const userPermissions = roleHierarchy[userRole] || [];
    
    if (requireAllRoles) {
      // Usuário deve ter TODAS as roles especificadas
      return requiredRoles.every(role => userPermissions.includes(role));
    } else {
      // Usuário deve ter PELO MENOS UMA das roles especificadas
      return requiredRoles.some(role => userPermissions.includes(role));
    }
  };

  // Verificar permissões
  if (!user || !hasPermission(user.role, allowedRoles)) {
    // Chamar callback se fornecido
    if (onAccessDenied) {
      onAccessDenied(user, allowedRoles);
    }
    
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;
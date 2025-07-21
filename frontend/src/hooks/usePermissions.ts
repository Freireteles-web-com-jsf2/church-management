import { useLocalAuth } from '../contexts/LocalAuthContext';

type UserRole = 'admin' | 'pastor' | 'lider' | 'tesoureiro' | 'voluntario' | 'membro';

// Hierarquia de permissões (roles superiores incluem permissões das inferiores)
const roleHierarchy: Record<UserRole, UserRole[]> = {
  admin: ['admin', 'pastor', 'lider', 'tesoureiro', 'voluntario', 'membro'],
  pastor: ['pastor', 'lider', 'tesoureiro', 'voluntario', 'membro'],
  lider: ['lider', 'voluntario', 'membro'],
  tesoureiro: ['tesoureiro', 'voluntario', 'membro'],
  voluntario: ['voluntario', 'membro'],
  membro: ['membro']
};

export const usePermissions = () => {
  const { user, isAuthenticated } = useLocalAuth();

  // Verificar se o usuário tem uma role específica
  const hasRole = (role: UserRole): boolean => {
    if (!isAuthenticated || !user) return false;
    const userPermissions = roleHierarchy[user.role] || [];
    return userPermissions.includes(role);
  };

  // Verificar se o usuário tem pelo menos uma das roles especificadas
  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!isAuthenticated || !user || !roles.length) return false;
    const userPermissions = roleHierarchy[user.role] || [];
    return roles.some(role => userPermissions.includes(role));
  };

  // Verificar se o usuário tem todas as roles especificadas
  const hasAllRoles = (roles: UserRole[]): boolean => {
    if (!isAuthenticated || !user || !roles.length) return false;
    const userPermissions = roleHierarchy[user.role] || [];
    return roles.every(role => userPermissions.includes(role));
  };

  // Verificar se é admin
  const isAdmin = (): boolean => hasRole('admin');

  // Verificar se é pastor ou admin
  const isPastorOrAdmin = (): boolean => hasAnyRole(['admin', 'pastor']);

  // Verificar se é líder, pastor ou admin
  const isLeaderOrAbove = (): boolean => hasAnyRole(['admin', 'pastor', 'lider']);

  // Verificar se pode gerenciar usuários
  const canManageUsers = (): boolean => hasAnyRole(['admin', 'pastor']);

  // Verificar se pode gerenciar finanças
  const canManageFinances = (): boolean => hasAnyRole(['admin', 'pastor', 'tesoureiro']);

  // Verificar se pode criar/editar pessoas
  const canEditPeople = (): boolean => hasAnyRole(['admin', 'pastor']);

  // Verificar se pode visualizar pessoas
  const canViewPeople = (): boolean => hasAnyRole(['admin', 'pastor', 'lider']);

  // Verificar se pode gerenciar grupos
  const canManageGroups = (): boolean => hasAnyRole(['admin', 'pastor']);

  // Verificar se pode visualizar grupos
  const canViewGroups = (): boolean => hasAnyRole(['admin', 'pastor', 'lider']);

  // Verificar se pode criar eventos
  const canCreateEvents = (): boolean => hasAnyRole(['admin', 'pastor', 'lider']);

  // Verificar se pode gerenciar configurações
  const canManageSettings = (): boolean => hasAnyRole(['admin', 'pastor']);

  // Obter todas as permissões do usuário atual
  const getUserPermissions = (): UserRole[] => {
    if (!isAuthenticated || !user) return [];
    return roleHierarchy[user.role] || [];
  };

  // Obter o nível hierárquico do usuário (0 = admin, 5 = membro)
  const getUserLevel = (): number => {
    if (!isAuthenticated || !user) return -1;
    const levels: Record<UserRole, number> = {
      admin: 0,
      pastor: 1,
      lider: 2,
      tesoureiro: 2,
      voluntario: 3,
      membro: 4
    };
    return levels[user.role] ?? -1;
  };

  return {
    // Verificações básicas
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Verificações específicas
    isAdmin,
    isPastorOrAdmin,
    isLeaderOrAbove,
    
    // Permissões funcionais
    canManageUsers,
    canManageFinances,
    canEditPeople,
    canViewPeople,
    canManageGroups,
    canViewGroups,
    canCreateEvents,
    canManageSettings,
    
    // Utilitários
    getUserPermissions,
    getUserLevel,
    
    // Dados do usuário
    user,
    isAuthenticated,
    userRole: user?.role
  };
};
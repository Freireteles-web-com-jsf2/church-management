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

export interface MenuItem {
  id?: string;
  icon: React.ReactNode | string;
  label: string;
  to?: string;
  onClick?: () => void;
  roles?: UserRole[];
  requireAllRoles?: boolean;
  children?: MenuItem[];
  badge?: string | number;
  isActive?: boolean;
  isVisible?: boolean;
  order?: number;
}

/**
 * Verifica se o usuário tem permissão para acessar um item
 */
export const hasPermissionForItem = (
  userRole: UserRole | undefined,
  itemRoles: UserRole[] | undefined,
  requireAllRoles: boolean = false
): boolean => {
  // Se não há roles especificadas, o item é público
  if (!itemRoles || itemRoles.length === 0) return true;
  
  // Se não há usuário, não tem permissão
  if (!userRole) return false;
  
  const userPermissions = roleHierarchy[userRole] || [];
  
  if (requireAllRoles) {
    // Usuário deve ter TODAS as roles especificadas
    return itemRoles.every(role => userPermissions.includes(role));
  } else {
    // Usuário deve ter PELO MENOS UMA das roles especificadas
    return itemRoles.some(role => userPermissions.includes(role));
  }
};

/**
 * Filtra uma lista de itens de menu baseado nas permissões do usuário
 */
export const filterMenuItems = (
  items: MenuItem[],
  userRole: UserRole | undefined
): MenuItem[] => {
  return items
    .filter(item => {
      // Verificar se o item principal tem permissão
      const hasPermission = hasPermissionForItem(userRole, item.roles, item.requireAllRoles);
      
      // Se o item não tem permissão, verificar se tem filhos com permissão
      if (!hasPermission && item.children && item.children.length > 0) {
        const filteredChildren = filterMenuItems(item.children, userRole);
        return filteredChildren.length > 0;
      }
      
      return hasPermission;
    })
    .map(item => {
      // Filtrar filhos recursivamente
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterMenuItems(item.children, userRole);
        return {
          ...item,
          children: filteredChildren
        };
      }
      return item;
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0)); // Ordenar por ordem se especificada
};

/**
 * Encontra um item de menu por ID ou path
 */
export const findMenuItem = (
  items: MenuItem[],
  searchBy: 'id' | 'to',
  value: string
): MenuItem | undefined => {
  for (const item of items) {
    if (searchBy === 'id' && item.id === value) {
      return item;
    }
    if (searchBy === 'to' && item.to === value) {
      return item;
    }
    
    if (item.children && item.children.length > 0) {
      const found = findMenuItem(item.children, searchBy, value);
      if (found) return found;
    }
  }
  return undefined;
};

/**
 * Marca um item como ativo baseado no path atual
 */
export const markActiveMenuItem = (
  items: MenuItem[],
  currentPath: string
): MenuItem[] => {
  return items.map(item => {
    const isActive = item.to === currentPath;
    const updatedItem = { ...item, isActive };
    
    if (item.children && item.children.length > 0) {
      updatedItem.children = markActiveMenuItem(item.children, currentPath);
      // Se algum filho está ativo, marcar o pai como ativo também
      const hasActiveChild = updatedItem.children.some(child => child.isActive);
      if (hasActiveChild) {
        updatedItem.isActive = true;
      }
    }
    
    return updatedItem;
  });
};

/**
 * Conta o número total de itens visíveis (incluindo filhos)
 */
export const countVisibleItems = (items: MenuItem[]): number => {
  return items.reduce((count, item) => {
    let itemCount = 1; // Contar o item atual
    
    if (item.children && item.children.length > 0) {
      itemCount += countVisibleItems(item.children);
    }
    
    return count + itemCount;
  }, 0);
};

/**
 * Converte uma estrutura de menu simples para MenuItem[]
 */
export const createMenuItems = (
  simpleItems: Array<{
    icon: string;
    label: string;
    to?: string;
    roles?: UserRole[];
    children?: any[];
  }>
): MenuItem[] => {
  return simpleItems.map((item, index) => ({
    id: `menu-item-${index}`,
    icon: item.icon,
    label: item.label,
    to: item.to,
    roles: item.roles,
    order: index,
    children: item.children ? createMenuItems(item.children) : undefined
  }));
};
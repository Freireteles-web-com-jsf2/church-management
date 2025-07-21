import { Request, Response, NextFunction } from 'express';

// Define permission levels for different roles
const rolePermissionLevels: Record<string, number> = {
  'admin': 100,
  'pastor': 80,
  'lider': 60,
  'tesoureiro': 50,
  'voluntario': 30,
  'membro': 10
};

// Define permission sets for different features
export const PERMISSIONS = {
  USER_MANAGEMENT: {
    VIEW: 'user:view',
    CREATE: 'user:create',
    EDIT: 'user:edit',
    DELETE: 'user:delete',
    ACTIVATE: 'user:activate',
    DEACTIVATE: 'user:deactivate',
    RESET_PASSWORD: 'user:reset-password',
    CHANGE_ROLE: 'user:change-role'
  },
  PROFILE: {
    VIEW: 'profile:view',
    EDIT: 'profile:edit',
    CHANGE_PASSWORD: 'profile:change-password'
  }
};

// Map permissions to minimum role levels
const permissionRoleLevels: Record<string, number> = {
  // User Management
  'user:view': rolePermissionLevels.membro,
  'user:create': rolePermissionLevels.pastor,
  'user:edit': rolePermissionLevels.pastor,
  'user:delete': rolePermissionLevels.admin,
  'user:activate': rolePermissionLevels.pastor,
  'user:deactivate': rolePermissionLevels.pastor,
  'user:reset-password': rolePermissionLevels.pastor,
  'user:change-role': rolePermissionLevels.admin,
  
  // Profile
  'profile:view': rolePermissionLevels.membro,
  'profile:edit': rolePermissionLevels.membro,
  'profile:change-password': rolePermissionLevels.membro
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (userRole: string, permission: string): boolean => {
  const userLevel = rolePermissionLevels[userRole] || 0;
  const requiredLevel = permissionRoleLevels[permission] || 100;
  
  return userLevel >= requiredLevel;
};

/**
 * Middleware to check if a user has a specific permission
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const userRole = req.user.funcao;
    
    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({ 
        error: 'Acesso negado. Permissão insuficiente.',
        code: 'INSUFFICIENT_PERMISSION',
        required: permission
      });
    }

    next();
  };
};

/**
 * Middleware to check if a user has any of the specified permissions
 */
export const requireAnyPermission = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const userRole = req.user.funcao;
    
    const hasAnyPermission = permissions.some(permission => 
      hasPermission(userRole, permission)
    );
    
    if (!hasAnyPermission) {
      return res.status(403).json({ 
        error: 'Acesso negado. Permissão insuficiente.',
        code: 'INSUFFICIENT_PERMISSION',
        required: permissions
      });
    }

    next();
  };
};

/**
 * Middleware to check if a user has all of the specified permissions
 */
export const requireAllPermissions = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const userRole = req.user.funcao;
    
    const hasAllPermissions = permissions.every(permission => 
      hasPermission(userRole, permission)
    );
    
    if (!hasAllPermissions) {
      return res.status(403).json({ 
        error: 'Acesso negado. Permissão insuficiente.',
        code: 'INSUFFICIENT_PERMISSION',
        required: permissions
      });
    }

    next();
  };
};

/**
 * Middleware to check if a user is accessing their own resource
 * or has the specified permission to access others' resources
 */
export const requireSelfOrPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const userRole = req.user.funcao;
    const userId = req.user.id;
    const resourceId = req.params.id;
    
    // Allow if user is accessing their own resource
    if (userId === resourceId) {
      return next();
    }
    
    // Otherwise, check permission
    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({ 
        error: 'Acesso negado. Permissão insuficiente.',
        code: 'INSUFFICIENT_PERMISSION',
        required: permission
      });
    }

    next();
  };
};

/**
 * Helper function to get all permissions for a role
 */
export const getRolePermissions = (role: string): string[] => {
  const userLevel = rolePermissionLevels[role] || 0;
  
  return Object.entries(permissionRoleLevels)
    .filter(([_, level]) => userLevel >= level)
    .map(([permission, _]) => permission);
};

export default {
  hasPermission,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireSelfOrPermission,
  getRolePermissions,
  PERMISSIONS
};
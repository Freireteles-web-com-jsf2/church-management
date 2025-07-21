"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRolePermissions = exports.requireSelfOrPermission = exports.requireAllPermissions = exports.requireAnyPermission = exports.requirePermission = exports.hasPermission = exports.PERMISSIONS = void 0;
// Define permission levels for different roles
const rolePermissionLevels = {
    'admin': 100,
    'pastor': 80,
    'lider': 60,
    'tesoureiro': 50,
    'voluntario': 30,
    'membro': 10
};
// Define permission sets for different features
exports.PERMISSIONS = {
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
const permissionRoleLevels = {
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
const hasPermission = (userRole, permission) => {
    const userLevel = rolePermissionLevels[userRole] || 0;
    const requiredLevel = permissionRoleLevels[permission] || 100;
    return userLevel >= requiredLevel;
};
exports.hasPermission = hasPermission;
/**
 * Middleware to check if a user has a specific permission
 */
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado',
                code: 'NOT_AUTHENTICATED'
            });
        }
        const userRole = req.user.funcao;
        if (!(0, exports.hasPermission)(userRole, permission)) {
            return res.status(403).json({
                error: 'Acesso negado. Permissão insuficiente.',
                code: 'INSUFFICIENT_PERMISSION',
                required: permission
            });
        }
        next();
    };
};
exports.requirePermission = requirePermission;
/**
 * Middleware to check if a user has any of the specified permissions
 */
const requireAnyPermission = (permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado',
                code: 'NOT_AUTHENTICATED'
            });
        }
        const userRole = req.user.funcao;
        const hasAnyPermission = permissions.some(permission => (0, exports.hasPermission)(userRole, permission));
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
exports.requireAnyPermission = requireAnyPermission;
/**
 * Middleware to check if a user has all of the specified permissions
 */
const requireAllPermissions = (permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado',
                code: 'NOT_AUTHENTICATED'
            });
        }
        const userRole = req.user.funcao;
        const hasAllPermissions = permissions.every(permission => (0, exports.hasPermission)(userRole, permission));
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
exports.requireAllPermissions = requireAllPermissions;
/**
 * Middleware to check if a user is accessing their own resource
 * or has the specified permission to access others' resources
 */
const requireSelfOrPermission = (permission) => {
    return (req, res, next) => {
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
        if (!(0, exports.hasPermission)(userRole, permission)) {
            return res.status(403).json({
                error: 'Acesso negado. Permissão insuficiente.',
                code: 'INSUFFICIENT_PERMISSION',
                required: permission
            });
        }
        next();
    };
};
exports.requireSelfOrPermission = requireSelfOrPermission;
/**
 * Helper function to get all permissions for a role
 */
const getRolePermissions = (role) => {
    const userLevel = rolePermissionLevels[role] || 0;
    return Object.entries(permissionRoleLevels)
        .filter(([_, level]) => userLevel >= level)
        .map(([permission, _]) => permission);
};
exports.getRolePermissions = getRolePermissions;
exports.default = {
    hasPermission: exports.hasPermission,
    requirePermission: exports.requirePermission,
    requireAnyPermission: exports.requireAnyPermission,
    requireAllPermissions: exports.requireAllPermissions,
    requireSelfOrPermission: exports.requireSelfOrPermission,
    getRolePermissions: exports.getRolePermissions,
    PERMISSIONS: exports.PERMISSIONS
};

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const permissions_1 = require("../middleware/permissions");
const UserManagementService_1 = __importDefault(require("../services/UserManagementService"));
const authErrors_1 = require("../utils/authErrors");
const router = (0, express_1.Router)();
// All user management routes require authentication
router.use(auth_1.authenticate);
// List users with filtering and pagination
router.get('/', (0, permissions_1.requirePermission)('user:view'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = {
            search: req.query.search,
            funcao: req.query.funcao,
            isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
            grupoId: req.query.grupoId,
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 50,
            sortBy: req.query.sortBy || 'nome',
            sortOrder: req.query.sortOrder || 'asc'
        };
        const users = yield UserManagementService_1.default.listUsers(filters);
        res.json({
            success: true,
            users,
            pagination: {
                page: filters.page,
                limit: filters.limit,
                total: users.length
            }
        });
    }
    catch (error) {
        console.error('List users error:', error);
        res.status(500).json({
            error: error.message || 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
}));
// Get user by ID
router.get('/:id', (0, permissions_1.requirePermission)('user:view'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield UserManagementService_1.default.getUserById(id);
        res.json({
            success: true,
            user
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        const statusCode = error.message === 'Usuário não encontrado' ? 404 : 500;
        res.status(statusCode).json({
            error: error.message || 'Erro interno do servidor',
            code: statusCode === 404 ? 'USER_NOT_FOUND' : 'INTERNAL_ERROR'
        });
    }
}));
// Create new user
router.post('/', (0, permissions_1.requirePermission)('user:create'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = req.body;
        // Validate required fields
        const requiredFields = ['nome', 'email', 'password', 'funcao', 'dataNascimento', 'genero', 'estadoCivil', 'telefone', 'endereco', 'numero', 'bairro', 'cidade', 'estado', 'dataIngresso'];
        const missingFields = requiredFields.filter(field => !userData[field]);
        if (missingFields.length > 0) {
            return res.status(400).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.MISSING_FIELDS, { missingFields }));
        }
        const newUser = yield UserManagementService_1.default.createUser(userData);
        res.status(201).json({
            success: true,
            user: newUser,
            message: 'Usuário criado com sucesso'
        });
    }
    catch (error) {
        console.error('Create user error:', error);
        const statusCode = error.message.includes('Email já está em uso') ? 409 : 400;
        const code = statusCode === 409 ? authErrors_1.AuthErrorCodes.EMAIL_EXISTS : authErrors_1.AuthErrorCodes.VALIDATION_ERROR;
        res.status(statusCode).json((0, authErrors_1.getAuthError)(code, { details: error.message }));
    }
}));
// Update user
router.put('/:id', (0, permissions_1.requirePermission)('user:edit'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userData = req.body;
        // Prevent users from changing their own role (except admin)
        if (req.user.id === id && req.user.funcao !== 'admin' && userData.funcao) {
            return res.status(403).json({
                error: 'Você não pode alterar sua própria função',
                code: 'CANNOT_CHANGE_OWN_ROLE'
            });
        }
        const updatedUser = yield UserManagementService_1.default.updateUser(id, userData);
        res.json({
            success: true,
            user: updatedUser,
            message: 'Usuário atualizado com sucesso'
        });
    }
    catch (error) {
        console.error('Update user error:', error);
        const statusCode = error.message === 'Usuário não encontrado' ? 404 :
            error.message.includes('Email já está em uso') ? 409 : 400;
        res.status(statusCode).json({
            error: error.message || 'Erro interno do servidor',
            code: statusCode === 404 ? 'USER_NOT_FOUND' :
                statusCode === 409 ? 'EMAIL_EXISTS' : 'VALIDATION_ERROR'
        });
    }
}));
// Delete user
router.delete('/:id', (0, permissions_1.requirePermission)('user:delete'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Prevent users from deleting themselves
        if (req.user.id === id) {
            return res.status(403).json({
                error: 'Você não pode excluir sua própria conta',
                code: 'CANNOT_DELETE_SELF'
            });
        }
        yield UserManagementService_1.default.deleteUser(id);
        res.json({
            success: true,
            message: 'Usuário excluído com sucesso'
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        const statusCode = error.message === 'Usuário não encontrado' ? 404 : 500;
        res.status(statusCode).json({
            error: error.message || 'Erro interno do servidor',
            code: statusCode === 404 ? 'USER_NOT_FOUND' : 'INTERNAL_ERROR'
        });
    }
}));
// Activate user
router.post('/:id/activate', (0, permissions_1.requirePermission)('user:activate'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield UserManagementService_1.default.activateUser(id);
        res.json({
            success: true,
            message: 'Usuário ativado com sucesso'
        });
    }
    catch (error) {
        console.error('Activate user error:', error);
        const statusCode = error.message === 'Usuário não encontrado' ? 404 : 500;
        res.status(statusCode).json({
            error: error.message || 'Erro interno do servidor',
            code: statusCode === 404 ? 'USER_NOT_FOUND' : 'INTERNAL_ERROR'
        });
    }
}));
// Deactivate user
router.post('/:id/deactivate', (0, permissions_1.requirePermission)('user:deactivate'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Prevent users from deactivating themselves
        if (req.user.id === id) {
            return res.status(403).json({
                error: 'Você não pode desativar sua própria conta',
                code: 'CANNOT_DEACTIVATE_SELF'
            });
        }
        yield UserManagementService_1.default.deactivateUser(id);
        res.json({
            success: true,
            message: 'Usuário desativado com sucesso'
        });
    }
    catch (error) {
        console.error('Deactivate user error:', error);
        const statusCode = error.message === 'Usuário não encontrado' ? 404 : 500;
        res.status(statusCode).json({
            error: error.message || 'Erro interno do servidor',
            code: statusCode === 404 ? 'USER_NOT_FOUND' : 'INTERNAL_ERROR'
        });
    }
}));
// Reset user password
router.post('/:id/reset-password', (0, permissions_1.requirePermission)('user:reset-password'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const newPassword = yield UserManagementService_1.default.resetUserPassword(id);
        res.json({
            success: true,
            newPassword,
            message: 'Senha redefinida com sucesso'
        });
    }
    catch (error) {
        console.error('Reset user password error:', error);
        const statusCode = error.message === 'Usuário não encontrado' ? 404 : 500;
        res.status(statusCode).json({
            error: error.message || 'Erro interno do servidor',
            code: statusCode === 404 ? 'USER_NOT_FOUND' : 'INTERNAL_ERROR'
        });
    }
}));
// Bulk operations
router.post('/bulk/activate', (0, permissions_1.requirePermission)('user:activate'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userIds } = req.body;
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                error: 'Lista de IDs de usuários é obrigatória',
                code: 'MISSING_USER_IDS'
            });
        }
        const results = [];
        for (const id of userIds) {
            try {
                yield UserManagementService_1.default.activateUser(id);
                results.push({ id, success: true });
            }
            catch (error) {
                results.push({ id, success: false, error: error.message });
            }
        }
        res.json({
            success: true,
            results,
            message: 'Operação em lote concluída'
        });
    }
    catch (error) {
        console.error('Bulk activate error:', error);
        res.status(500).json({
            error: error.message || 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
}));
router.post('/bulk/deactivate', (0, permissions_1.requirePermission)('user:deactivate'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userIds } = req.body;
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                error: 'Lista de IDs de usuários é obrigatória',
                code: 'MISSING_USER_IDS'
            });
        }
        // Prevent users from deactivating themselves
        if (userIds.includes(req.user.id)) {
            return res.status(403).json({
                error: 'Você não pode desativar sua própria conta',
                code: 'CANNOT_DEACTIVATE_SELF'
            });
        }
        const results = [];
        for (const id of userIds) {
            try {
                yield UserManagementService_1.default.deactivateUser(id);
                results.push({ id, success: true });
            }
            catch (error) {
                results.push({ id, success: false, error: error.message });
            }
        }
        res.json({
            success: true,
            results,
            message: 'Operação em lote concluída'
        });
    }
    catch (error) {
        console.error('Bulk deactivate error:', error);
        res.status(500).json({
            error: error.message || 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
}));
// Get user statistics
router.get('/stats/overview', (0, permissions_1.requirePermission)('user:view'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roleStats = yield UserManagementService_1.default.countUsersByRole();
        res.json({
            success: true,
            stats: {
                byRole: roleStats,
                total: Object.values(roleStats).reduce((sum, count) => sum + count, 0)
            }
        });
    }
    catch (error) {
        console.error('User stats error:', error);
        res.status(500).json({
            error: error.message || 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
}));
exports.default = router;

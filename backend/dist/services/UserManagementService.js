"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.UserManagementService = void 0;
const client_1 = require("@prisma/client");
const AuthService_1 = __importDefault(require("./AuthService"));
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
class UserManagementService {
    /**
     * Create a new user
     */
    static createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate email uniqueness
            const existingUser = yield prisma.pessoa.findUnique({
                where: { email: userData.email }
            });
            if (existingUser) {
                throw new Error('Email já está em uso');
            }
            // Validate password
            const passwordValidation = AuthService_1.default.validatePassword(userData.password);
            if (!passwordValidation.isValid) {
                throw new Error(`Senha inválida: ${passwordValidation.errors.join(', ')}`);
            }
            // Hash password - in a real implementation, we would store this in a separate table
            // For now, we'll store it in a global map for development purposes
            const hashedPassword = yield bcrypt.hash(userData.password, this.SALT_ROUNDS);
            // Store password in memory (in production, use a proper user_auth table)
            if (!global.userPasswords) {
                global.userPasswords = new Map();
            }
            try {
                // Create user in database
                const newUser = yield prisma.pessoa.create({
                    data: {
                        nome: userData.nome,
                        email: userData.email,
                        funcao: userData.funcao,
                        dataNascimento: userData.dataNascimento,
                        genero: userData.genero,
                        estadoCivil: userData.estadoCivil,
                        telefone: userData.telefone,
                        endereco: userData.endereco,
                        numero: userData.numero,
                        complemento: userData.complemento,
                        bairro: userData.bairro,
                        cidade: userData.cidade,
                        estado: userData.estado,
                        grupoId: userData.grupoId,
                        fotoUrl: userData.fotoUrl,
                        dataIngresso: userData.dataIngresso,
                        batizado: userData.batizado,
                        camposPersonalizados: userData.camposPersonalizados
                    }
                });
                // Store password hash
                global.userPasswords.set(newUser.id, hashedPassword);
                return Object.assign(Object.assign({}, newUser), { isActive: true // We'll assume all new users are active by default
                 });
            }
            catch (error) {
                console.error('Error creating user:', error);
                throw new Error('Erro ao criar usuário');
            }
        });
    }
    /**
     * Update an existing user
     */
    static updateUser(id, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if user exists
            const existingUser = yield prisma.pessoa.findUnique({
                where: { id }
            });
            if (!existingUser) {
                throw new Error('Usuário não encontrado');
            }
            // Check email uniqueness if email is being updated
            if (userData.email && userData.email !== existingUser.email) {
                const emailExists = yield prisma.pessoa.findUnique({
                    where: { email: userData.email }
                });
                if (emailExists) {
                    throw new Error('Email já está em uso');
                }
            }
            try {
                // Update user in database
                const updatedUser = yield prisma.pessoa.update({
                    where: { id },
                    data: {
                        nome: userData.nome,
                        email: userData.email,
                        funcao: userData.funcao,
                        dataNascimento: userData.dataNascimento,
                        genero: userData.genero,
                        estadoCivil: userData.estadoCivil,
                        telefone: userData.telefone,
                        endereco: userData.endereco,
                        numero: userData.numero,
                        complemento: userData.complemento,
                        bairro: userData.bairro,
                        cidade: userData.cidade,
                        estado: userData.estado,
                        grupoId: userData.grupoId,
                        fotoUrl: userData.fotoUrl,
                        dataIngresso: userData.dataIngresso,
                        batizado: userData.batizado,
                        camposPersonalizados: userData.camposPersonalizados
                    }
                });
                // In a real implementation, we would update the isActive status in a user_auth table
                // For now, we'll just return the user with the isActive status
                return Object.assign(Object.assign({}, updatedUser), { isActive: userData.isActive !== undefined ? userData.isActive : true });
            }
            catch (error) {
                console.error('Error updating user:', error);
                throw new Error('Erro ao atualizar usuário');
            }
        });
    }
    /**
     * Delete a user
     */
    static deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if user exists
            const existingUser = yield prisma.pessoa.findUnique({
                where: { id }
            });
            if (!existingUser) {
                throw new Error('Usuário não encontrado');
            }
            try {
                // Delete user from database
                yield prisma.pessoa.delete({
                    where: { id }
                });
                // Remove password hash
                if (global.userPasswords) {
                    global.userPasswords.delete(id);
                }
                // In a real implementation, we would also delete related data like sessions
                if (global.sessions) {
                    for (const [token, session] of global.sessions.entries()) {
                        if (session.userId === id) {
                            global.sessions.delete(token);
                        }
                    }
                }
            }
            catch (error) {
                console.error('Error deleting user:', error);
                throw new Error('Erro ao excluir usuário');
            }
        });
    }
    /**
     * Activate a user
     */
    static activateUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if user exists
            const existingUser = yield prisma.pessoa.findUnique({
                where: { id }
            });
            if (!existingUser) {
                throw new Error('Usuário não encontrado');
            }
            // In a real implementation, we would update the isActive status in a user_auth table
            // For now, we'll just log the action
            console.log(`User ${id} activated`);
        });
    }
    /**
     * Deactivate a user
     */
    static deactivateUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if user exists
            const existingUser = yield prisma.pessoa.findUnique({
                where: { id }
            });
            if (!existingUser) {
                throw new Error('Usuário não encontrado');
            }
            // In a real implementation, we would update the isActive status in a user_auth table
            // For now, we'll just log the action
            console.log(`User ${id} deactivated`);
            // Invalidate all sessions for this user
            if (global.sessions) {
                for (const [token, session] of global.sessions.entries()) {
                    if (session.userId === id) {
                        global.sessions.delete(token);
                    }
                }
            }
        });
    }
    /**
     * List users with filtering, pagination, and sorting
     */
    static listUsers() {
        return __awaiter(this, arguments, void 0, function* (filters = {}) {
            const { search, funcao, isActive, grupoId, page = 1, limit = 50, sortBy = 'nome', sortOrder = 'asc' } = filters;
            // Build where clause
            const where = {};
            if (search) {
                where.OR = [
                    { nome: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (funcao) {
                if (Array.isArray(funcao)) {
                    where.funcao = { in: funcao };
                }
                else {
                    where.funcao = funcao;
                }
            }
            if (grupoId) {
                where.grupoId = grupoId;
            }
            // Build query
            try {
                const users = yield prisma.pessoa.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: {
                        [sortBy]: sortOrder
                    },
                    include: {
                        grupo: true
                    }
                });
                // Add isActive status to each user
                // In a real implementation, this would come from a user_auth table
                return users.map(user => (Object.assign(Object.assign({}, user), { isActive: true // Default to true for now
                 })));
            }
            catch (error) {
                console.error('Error listing users:', error);
                throw new Error('Erro ao listar usuários');
            }
        });
    }
    /**
     * Get a user by ID
     */
    static getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma.pessoa.findUnique({
                    where: { id },
                    include: {
                        grupo: true
                    }
                });
                if (!user) {
                    throw new Error('Usuário não encontrado');
                }
                // Add isActive status
                // In a real implementation, this would come from a user_auth table
                return Object.assign(Object.assign({}, user), { isActive: true // Default to true for now
                 });
            }
            catch (error) {
                console.error('Error getting user:', error);
                // Re-throw the original error to maintain the error message
                throw error;
            }
        });
    }
    /**
     * Reset a user's password
     */
    static resetUserPassword(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if user exists
            const existingUser = yield prisma.pessoa.findUnique({
                where: { id }
            });
            if (!existingUser) {
                throw new Error('Usuário não encontrado');
            }
            // Generate a random password
            const newPassword = Math.random().toString(36).slice(-8);
            // Hash the new password
            const hashedPassword = yield bcrypt.hash(newPassword, this.SALT_ROUNDS);
            // Store the new password hash
            if (!global.userPasswords) {
                global.userPasswords = new Map();
            }
            global.userPasswords.set(id, hashedPassword);
            return newPassword;
        });
    }
    /**
     * Change a user's password
     */
    static changeUserPassword(id, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if user exists
            const existingUser = yield prisma.pessoa.findUnique({
                where: { id }
            });
            if (!existingUser) {
                throw new Error('Usuário não encontrado');
            }
            // Verify current password
            if (!global.userPasswords) {
                global.userPasswords = new Map();
            }
            const storedHash = global.userPasswords.get(id);
            if (!storedHash) {
                throw new Error('Senha atual não encontrada');
            }
            const isPasswordValid = yield bcrypt.compare(currentPassword, storedHash);
            if (!isPasswordValid) {
                throw new Error('Senha atual incorreta');
            }
            // Validate new password
            const passwordValidation = AuthService_1.default.validatePassword(newPassword);
            if (!passwordValidation.isValid) {
                throw new Error(`Senha inválida: ${passwordValidation.errors.join(', ')}`);
            }
            // Hash and store the new password
            const hashedPassword = yield bcrypt.hash(newPassword, this.SALT_ROUNDS);
            global.userPasswords.set(id, hashedPassword);
        });
    }
    /**
     * Validate user role and permissions
     */
    static validateUserRole(userRole, requiredRoles) {
        return requiredRoles.includes(userRole);
    }
    /**
     * Count users by role
     */
    static countUsersByRole() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield prisma.pessoa.groupBy({
                    by: ['funcao'],
                    _count: {
                        id: true
                    }
                });
                const result = {};
                users.forEach(item => {
                    result[item.funcao] = item._count.id;
                });
                return result;
            }
            catch (error) {
                console.error('Error counting users by role:', error);
                throw new Error('Erro ao contar usuários por função');
            }
        });
    }
}
exports.UserManagementService = UserManagementService;
UserManagementService.SALT_ROUNDS = 12;
exports.default = UserManagementService;

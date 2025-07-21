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
const client_1 = require("@prisma/client");
const UserManagementService_1 = __importDefault(require("../services/UserManagementService"));
const prisma = new client_1.PrismaClient();
class PessoaController {
    /**
     * List users with filtering, pagination, and sorting
     */
    static listar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filters = {
                    search: req.query.search,
                    funcao: req.query.funcao,
                    isActive: req.query.isActive === 'true',
                    grupoId: req.query.grupoId,
                    page: req.query.page ? parseInt(req.query.page) : 1,
                    limit: req.query.limit ? parseInt(req.query.limit) : 50,
                    sortBy: req.query.sortBy || 'nome',
                    sortOrder: req.query.sortOrder || 'asc'
                };
                const pessoas = yield UserManagementService_1.default.listUsers(filters);
                res.json(pessoas);
            }
            catch (error) {
                console.error('Error listing users:', error);
                res.status(500).json({ error: 'Erro ao listar usuários' });
            }
        });
    }
    /**
     * Create a new user
     */
    static criar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = req.body;
                const pessoa = yield UserManagementService_1.default.createUser(userData);
                res.status(201).json(pessoa);
            }
            catch (error) {
                console.error('Error creating user:', error);
                res.status(400).json({ error: error.message || 'Erro ao criar usuário' });
            }
        });
    }
    /**
     * Get user details by ID
     */
    static detalhar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const pessoa = yield UserManagementService_1.default.getUserById(id);
                res.json(pessoa);
            }
            catch (error) {
                console.error('Error getting user:', error);
                res.status(404).json({ error: error.message || 'Usuário não encontrado' });
            }
        });
    }
    /**
     * Update an existing user
     */
    static atualizar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const userData = req.body;
                const pessoa = yield UserManagementService_1.default.updateUser(id, userData);
                res.json(pessoa);
            }
            catch (error) {
                console.error('Error updating user:', error);
                res.status(400).json({ error: error.message || 'Erro ao atualizar usuário' });
            }
        });
    }
    /**
     * Delete a user
     */
    static remover(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield UserManagementService_1.default.deleteUser(id);
                res.status(204).send();
            }
            catch (error) {
                console.error('Error deleting user:', error);
                res.status(400).json({ error: error.message || 'Erro ao excluir usuário' });
            }
        });
    }
    /**
     * Activate a user
     */
    static ativar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield UserManagementService_1.default.activateUser(id);
                res.status(200).json({ message: 'Usuário ativado com sucesso' });
            }
            catch (error) {
                console.error('Error activating user:', error);
                res.status(400).json({ error: error.message || 'Erro ao ativar usuário' });
            }
        });
    }
    /**
     * Deactivate a user
     */
    static desativar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield UserManagementService_1.default.deactivateUser(id);
                res.status(200).json({ message: 'Usuário desativado com sucesso' });
            }
            catch (error) {
                console.error('Error deactivating user:', error);
                res.status(400).json({ error: error.message || 'Erro ao desativar usuário' });
            }
        });
    }
    /**
     * Reset a user's password
     */
    static resetarSenha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const newPassword = yield UserManagementService_1.default.resetUserPassword(id);
                res.status(200).json({
                    message: 'Senha resetada com sucesso',
                    newPassword // In a real app, this would be sent via email instead
                });
            }
            catch (error) {
                console.error('Error resetting password:', error);
                res.status(400).json({ error: error.message || 'Erro ao resetar senha' });
            }
        });
    }
    /**
     * Change a user's password
     */
    static alterarSenha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { currentPassword, newPassword } = req.body;
                if (!currentPassword || !newPassword) {
                    return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
                }
                yield UserManagementService_1.default.changeUserPassword(id, currentPassword, newPassword);
                res.status(200).json({ message: 'Senha alterada com sucesso' });
            }
            catch (error) {
                console.error('Error changing password:', error);
                res.status(400).json({ error: error.message || 'Erro ao alterar senha' });
            }
        });
    }
    /**
     * Get user statistics
     */
    static estatisticas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const countByRole = yield UserManagementService_1.default.countUsersByRole();
                res.json({ countByRole });
            }
            catch (error) {
                console.error('Error getting user statistics:', error);
                res.status(500).json({ error: error.message || 'Erro ao obter estatísticas' });
            }
        });
    }
}
exports.default = PessoaController;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PessoaController_1 = __importDefault(require("../controllers/PessoaController"));
const auth_1 = require("../middleware/auth");
const permissions_1 = require("../middleware/permissions");
const router = (0, express_1.Router)();
// Public routes (none for user management)
// Protected routes - require authentication
router.get('/', auth_1.authenticate, (0, permissions_1.requirePermission)(permissions_1.PERMISSIONS.USER_MANAGEMENT.VIEW), PessoaController_1.default.listar);
router.get('/estatisticas', auth_1.authenticate, (0, permissions_1.requirePermission)(permissions_1.PERMISSIONS.USER_MANAGEMENT.VIEW), PessoaController_1.default.estatisticas);
router.get('/:id', auth_1.authenticate, (0, permissions_1.requireSelfOrPermission)(permissions_1.PERMISSIONS.USER_MANAGEMENT.VIEW), PessoaController_1.default.detalhar);
// User management routes
router.post('/', auth_1.authenticate, (0, permissions_1.requirePermission)(permissions_1.PERMISSIONS.USER_MANAGEMENT.CREATE), PessoaController_1.default.criar);
router.put('/:id', auth_1.authenticate, (0, permissions_1.requireSelfOrPermission)(permissions_1.PERMISSIONS.USER_MANAGEMENT.EDIT), PessoaController_1.default.atualizar);
router.delete('/:id', auth_1.authenticate, (0, permissions_1.requirePermission)(permissions_1.PERMISSIONS.USER_MANAGEMENT.DELETE), PessoaController_1.default.remover);
// User activation/deactivation
router.post('/:id/ativar', auth_1.authenticate, (0, permissions_1.requirePermission)(permissions_1.PERMISSIONS.USER_MANAGEMENT.ACTIVATE), PessoaController_1.default.ativar);
router.post('/:id/desativar', auth_1.authenticate, (0, permissions_1.requirePermission)(permissions_1.PERMISSIONS.USER_MANAGEMENT.DEACTIVATE), PessoaController_1.default.desativar);
// Password management
router.post('/:id/resetar-senha', auth_1.authenticate, (0, permissions_1.requirePermission)(permissions_1.PERMISSIONS.USER_MANAGEMENT.RESET_PASSWORD), PessoaController_1.default.resetarSenha);
router.post('/:id/alterar-senha', auth_1.authenticate, (0, permissions_1.requireSelfOrPermission)(permissions_1.PERMISSIONS.PROFILE.CHANGE_PASSWORD), PessoaController_1.default.alterarSenha);
exports.default = router;

import { Router } from 'express';
import PessoaController from '../controllers/PessoaController';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireSelfOrPermission, PERMISSIONS } from '../middleware/permissions';

const router = Router();

// Public routes (none for user management)

// Protected routes - require authentication
router.get('/', authenticate, requirePermission(PERMISSIONS.USER_MANAGEMENT.VIEW), PessoaController.listar);
router.get('/estatisticas', authenticate, requirePermission(PERMISSIONS.USER_MANAGEMENT.VIEW), PessoaController.estatisticas);
router.get('/:id', authenticate, requireSelfOrPermission(PERMISSIONS.USER_MANAGEMENT.VIEW), PessoaController.detalhar);

// User management routes
router.post('/', authenticate, requirePermission(PERMISSIONS.USER_MANAGEMENT.CREATE), PessoaController.criar);
router.put('/:id', authenticate, requireSelfOrPermission(PERMISSIONS.USER_MANAGEMENT.EDIT), PessoaController.atualizar);
router.delete('/:id', authenticate, requirePermission(PERMISSIONS.USER_MANAGEMENT.DELETE), PessoaController.remover);

// User activation/deactivation
router.post('/:id/ativar', authenticate, requirePermission(PERMISSIONS.USER_MANAGEMENT.ACTIVATE), PessoaController.ativar);
router.post('/:id/desativar', authenticate, requirePermission(PERMISSIONS.USER_MANAGEMENT.DEACTIVATE), PessoaController.desativar);

// Password management
router.post('/:id/resetar-senha', authenticate, requirePermission(PERMISSIONS.USER_MANAGEMENT.RESET_PASSWORD), PessoaController.resetarSenha);
router.post('/:id/alterar-senha', authenticate, requireSelfOrPermission(PERMISSIONS.PROFILE.CHANGE_PASSWORD), PessoaController.alterarSenha);

export default router;
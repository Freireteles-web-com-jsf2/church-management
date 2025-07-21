import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import UserManagementService, { CreateUserData, UpdateUserData, UserFilters } from '../services/UserManagementService';
import { AuthErrorCodes, getAuthError } from '../utils/authErrors';

const router = Router();

// All user management routes require authentication
router.use(authenticate);

// List users with filtering and pagination
router.get('/', requirePermission('user:view'), async (req: Request, res: Response) => {
  try {
    const filters: UserFilters = {
      search: req.query.search as string,
      funcao: req.query.funcao as any,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      grupoId: req.query.grupoId as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
      sortBy: req.query.sortBy as string || 'nome',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc'
    };

    const users = await UserManagementService.listUsers(filters);

    res.json({
      success: true,
      users,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: users.length
      }
    });

  } catch (error: any) {
    console.error('List users error:', error);
    res.status(500).json({
      error: error.message || 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Get user by ID
router.get('/:id', requirePermission('user:view'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await UserManagementService.getUserById(id);

    res.json({
      success: true,
      user
    });

  } catch (error: any) {
    console.error('Get user error:', error);
    const statusCode = error.message === 'Usuário não encontrado' ? 404 : 500;
    res.status(statusCode).json({
      error: error.message || 'Erro interno do servidor',
      code: statusCode === 404 ? 'USER_NOT_FOUND' : 'INTERNAL_ERROR'
    });
  }
});

// Create new user
router.post('/', requirePermission('user:create'), async (req: Request, res: Response) => {
  try {
    const userData: CreateUserData = req.body;

    // Validate required fields
    const requiredFields = ['nome', 'email', 'password', 'funcao', 'dataNascimento', 'genero', 'estadoCivil', 'telefone', 'endereco', 'numero', 'bairro', 'cidade', 'estado', 'dataIngresso'];
    const missingFields = requiredFields.filter(field => !userData[field as keyof CreateUserData]);

    if (missingFields.length > 0) {
      return res.status(400).json(getAuthError(AuthErrorCodes.MISSING_FIELDS, { missingFields }));
    }

    const newUser = await UserManagementService.createUser(userData);

    res.status(201).json({
      success: true,
      user: newUser,
      message: 'Usuário criado com sucesso'
    });

  } catch (error: any) {
    console.error('Create user error:', error);
    const statusCode = error.message.includes('Email já está em uso') ? 409 : 400;
    const code = statusCode === 409 ? AuthErrorCodes.EMAIL_EXISTS : AuthErrorCodes.VALIDATION_ERROR;
    res.status(statusCode).json(getAuthError(code, { details: error.message }));
  }
});

// Update user
router.put('/:id', requirePermission('user:edit'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userData: UpdateUserData = req.body;

    // Prevent users from changing their own role (except admin)
    if (req.user.id === id && req.user.funcao !== 'admin' && userData.funcao) {
      return res.status(403).json({
        error: 'Você não pode alterar sua própria função',
        code: 'CANNOT_CHANGE_OWN_ROLE'
      });
    }

    const updatedUser = await UserManagementService.updateUser(id, userData);

    res.json({
      success: true,
      user: updatedUser,
      message: 'Usuário atualizado com sucesso'
    });

  } catch (error: any) {
    console.error('Update user error:', error);
    const statusCode = error.message === 'Usuário não encontrado' ? 404 : 
                      error.message.includes('Email já está em uso') ? 409 : 400;
    res.status(statusCode).json({
      error: error.message || 'Erro interno do servidor',
      code: statusCode === 404 ? 'USER_NOT_FOUND' : 
            statusCode === 409 ? 'EMAIL_EXISTS' : 'VALIDATION_ERROR'
    });
  }
});

// Delete user
router.delete('/:id', requirePermission('user:delete'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent users from deleting themselves
    if (req.user.id === id) {
      return res.status(403).json({
        error: 'Você não pode excluir sua própria conta',
        code: 'CANNOT_DELETE_SELF'
      });
    }

    await UserManagementService.deleteUser(id);

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });

  } catch (error: any) {
    console.error('Delete user error:', error);
    const statusCode = error.message === 'Usuário não encontrado' ? 404 : 500;
    res.status(statusCode).json({
      error: error.message || 'Erro interno do servidor',
      code: statusCode === 404 ? 'USER_NOT_FOUND' : 'INTERNAL_ERROR'
    });
  }
});

// Activate user
router.post('/:id/activate', requirePermission('user:activate'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await UserManagementService.activateUser(id);

    res.json({
      success: true,
      message: 'Usuário ativado com sucesso'
    });

  } catch (error: any) {
    console.error('Activate user error:', error);
    const statusCode = error.message === 'Usuário não encontrado' ? 404 : 500;
    res.status(statusCode).json({
      error: error.message || 'Erro interno do servidor',
      code: statusCode === 404 ? 'USER_NOT_FOUND' : 'INTERNAL_ERROR'
    });
  }
});

// Deactivate user
router.post('/:id/deactivate', requirePermission('user:deactivate'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent users from deactivating themselves
    if (req.user.id === id) {
      return res.status(403).json({
        error: 'Você não pode desativar sua própria conta',
        code: 'CANNOT_DEACTIVATE_SELF'
      });
    }

    await UserManagementService.deactivateUser(id);

    res.json({
      success: true,
      message: 'Usuário desativado com sucesso'
    });

  } catch (error: any) {
    console.error('Deactivate user error:', error);
    const statusCode = error.message === 'Usuário não encontrado' ? 404 : 500;
    res.status(statusCode).json({
      error: error.message || 'Erro interno do servidor',
      code: statusCode === 404 ? 'USER_NOT_FOUND' : 'INTERNAL_ERROR'
    });
  }
});

// Reset user password
router.post('/:id/reset-password', requirePermission('user:reset-password'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const newPassword = await UserManagementService.resetUserPassword(id);

    res.json({
      success: true,
      newPassword,
      message: 'Senha redefinida com sucesso'
    });

  } catch (error: any) {
    console.error('Reset user password error:', error);
    const statusCode = error.message === 'Usuário não encontrado' ? 404 : 500;
    res.status(statusCode).json({
      error: error.message || 'Erro interno do servidor',
      code: statusCode === 404 ? 'USER_NOT_FOUND' : 'INTERNAL_ERROR'
    });
  }
});

// Bulk operations
router.post('/bulk/activate', requirePermission('user:activate'), async (req: Request, res: Response) => {
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
        await UserManagementService.activateUser(id);
        results.push({ id, success: true });
      } catch (error: any) {
        results.push({ id, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      results,
      message: 'Operação em lote concluída'
    });

  } catch (error: any) {
    console.error('Bulk activate error:', error);
    res.status(500).json({
      error: error.message || 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

router.post('/bulk/deactivate', requirePermission('user:deactivate'), async (req: Request, res: Response) => {
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
        await UserManagementService.deactivateUser(id);
        results.push({ id, success: true });
      } catch (error: any) {
        results.push({ id, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      results,
      message: 'Operação em lote concluída'
    });

  } catch (error: any) {
    console.error('Bulk deactivate error:', error);
    res.status(500).json({
      error: error.message || 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Get user statistics
router.get('/stats/overview', requirePermission('user:view'), async (req: Request, res: Response) => {
  try {
    const roleStats = await UserManagementService.countUsersByRole();

    res.json({
      success: true,
      stats: {
        byRole: roleStats,
        total: Object.values(roleStats).reduce((sum, count) => sum + count, 0)
      }
    });

  } catch (error: any) {
    console.error('User stats error:', error);
    res.status(500).json({
      error: error.message || 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;
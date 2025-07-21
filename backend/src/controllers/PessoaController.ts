import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import UserManagementService, { UserFilters } from '../services/UserManagementService';

const prisma = new PrismaClient();

export default class PessoaController {
  /**
   * List users with filtering, pagination, and sorting
   */
  static async listar(req: Request, res: Response) {
    try {
      const filters: UserFilters = {
        search: req.query.search as string,
        funcao: req.query.funcao as string,
        isActive: req.query.isActive === 'true',
        grupoId: req.query.grupoId as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        sortBy: req.query.sortBy as string || 'nome',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc'
      };

      const pessoas = await UserManagementService.listUsers(filters);
      res.json(pessoas);
    } catch (error) {
      console.error('Error listing users:', error);
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

  /**
   * Create a new user
   */
  static async criar(req: Request, res: Response) {
    try {
      const userData = req.body;
      const pessoa = await UserManagementService.createUser(userData);
      res.status(201).json(pessoa);
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(400).json({ error: error.message || 'Erro ao criar usuário' });
    }
  }

  /**
   * Get user details by ID
   */
  static async detalhar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pessoa = await UserManagementService.getUserById(id);
      res.json(pessoa);
    } catch (error: any) {
      console.error('Error getting user:', error);
      res.status(404).json({ error: error.message || 'Usuário não encontrado' });
    }
  }

  /**
   * Update an existing user
   */
  static async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userData = req.body;
      const pessoa = await UserManagementService.updateUser(id, userData);
      res.json(pessoa);
    } catch (error: any) {
      console.error('Error updating user:', error);
      res.status(400).json({ error: error.message || 'Erro ao atualizar usuário' });
    }
  }

  /**
   * Delete a user
   */
  static async remover(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await UserManagementService.deleteUser(id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(400).json({ error: error.message || 'Erro ao excluir usuário' });
    }
  }

  /**
   * Activate a user
   */
  static async ativar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await UserManagementService.activateUser(id);
      res.status(200).json({ message: 'Usuário ativado com sucesso' });
    } catch (error: any) {
      console.error('Error activating user:', error);
      res.status(400).json({ error: error.message || 'Erro ao ativar usuário' });
    }
  }

  /**
   * Deactivate a user
   */
  static async desativar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await UserManagementService.deactivateUser(id);
      res.status(200).json({ message: 'Usuário desativado com sucesso' });
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      res.status(400).json({ error: error.message || 'Erro ao desativar usuário' });
    }
  }

  /**
   * Reset a user's password
   */
  static async resetarSenha(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const newPassword = await UserManagementService.resetUserPassword(id);
      res.status(200).json({ 
        message: 'Senha resetada com sucesso',
        newPassword // In a real app, this would be sent via email instead
      });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      res.status(400).json({ error: error.message || 'Erro ao resetar senha' });
    }
  }

  /**
   * Change a user's password
   */
  static async alterarSenha(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
      }
      
      await UserManagementService.changeUserPassword(id, currentPassword, newPassword);
      res.status(200).json({ message: 'Senha alterada com sucesso' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      res.status(400).json({ error: error.message || 'Erro ao alterar senha' });
    }
  }

  /**
   * Get user statistics
   */
  static async estatisticas(req: Request, res: Response) {
    try {
      const countByRole = await UserManagementService.countUsersByRole();
      res.json({ countByRole });
    } catch (error: any) {
      console.error('Error getting user statistics:', error);
      res.status(500).json({ error: error.message || 'Erro ao obter estatísticas' });
    }
  }
} 
import { PrismaClient } from '@prisma/client';
import AuthService from './AuthService';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export interface CreateUserData {
  nome: string;
  email: string;
  password: string;
  funcao: UserRole;
  dataNascimento: Date;
  genero: string;
  estadoCivil: string;
  telefone: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  grupoId?: string;
  fotoUrl?: string;
  dataIngresso: Date;
  batizado: boolean;
  camposPersonalizados?: any;
}

export interface UpdateUserData {
  nome?: string;
  email?: string;
  funcao?: UserRole;
  dataNascimento?: Date;
  genero?: string;
  estadoCivil?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  grupoId?: string;
  fotoUrl?: string;
  dataIngresso?: Date;
  batizado?: boolean;
  camposPersonalizados?: any;
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  funcao?: UserRole | UserRole[];
  isActive?: boolean;
  grupoId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type UserRole = 'admin' | 'pastor' | 'lider' | 'tesoureiro' | 'voluntario' | 'membro';

export interface UserWithPassword {
  id: string;
  nome: string;
  email: string;
  funcao: UserRole;
  password: string;
  isActive: boolean;
}

export class UserManagementService {
  private static readonly SALT_ROUNDS = 12;
  
  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserData): Promise<any> {
    // Validate email uniqueness
    const existingUser = await prisma.pessoa.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Validate password
    const passwordValidation = AuthService.validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Senha inválida: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash password - in a real implementation, we would store this in a separate table
    // For now, we'll store it in a global map for development purposes
    const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);
    
    // Store password in memory (in production, use a proper user_auth table)
    if (!global.userPasswords) {
      global.userPasswords = new Map<string, string>();
    }

    try {
      // Create user in database
      const newUser = await prisma.pessoa.create({
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

      return {
        ...newUser,
        isActive: true // We'll assume all new users are active by default
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Erro ao criar usuário');
    }
  }

  /**
   * Update an existing user
   */
  static async updateUser(id: string, userData: UpdateUserData): Promise<any> {
    // Check if user exists
    const existingUser = await prisma.pessoa.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    // Check email uniqueness if email is being updated
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await prisma.pessoa.findUnique({
        where: { email: userData.email }
      });

      if (emailExists) {
        throw new Error('Email já está em uso');
      }
    }

    try {
      // Update user in database
      const updatedUser = await prisma.pessoa.update({
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
      return {
        ...updatedUser,
        isActive: userData.isActive !== undefined ? userData.isActive : true
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Erro ao atualizar usuário');
    }
  }

  /**
   * Delete a user
   */
  static async deleteUser(id: string): Promise<void> {
    // Check if user exists
    const existingUser = await prisma.pessoa.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    try {
      // Delete user from database
      await prisma.pessoa.delete({
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
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Erro ao excluir usuário');
    }
  }

  /**
   * Activate a user
   */
  static async activateUser(id: string): Promise<void> {
    // Check if user exists
    const existingUser = await prisma.pessoa.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    // In a real implementation, we would update the isActive status in a user_auth table
    // For now, we'll just log the action
    console.log(`User ${id} activated`);
  }

  /**
   * Deactivate a user
   */
  static async deactivateUser(id: string): Promise<void> {
    // Check if user exists
    const existingUser = await prisma.pessoa.findUnique({
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
  }

  /**
   * List users with filtering, pagination, and sorting
   */
  static async listUsers(filters: UserFilters = {}): Promise<any[]> {
    const {
      search,
      funcao,
      isActive,
      grupoId,
      page = 1,
      limit = 50,
      sortBy = 'nome',
      sortOrder = 'asc'
    } = filters;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (funcao) {
      if (Array.isArray(funcao)) {
        where.funcao = { in: funcao };
      } else {
        where.funcao = funcao;
      }
    }

    if (grupoId) {
      where.grupoId = grupoId;
    }

    // Build query
    try {
      const users = await prisma.pessoa.findMany({
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
      return users.map(user => ({
        ...user,
        isActive: true // Default to true for now
      }));
    } catch (error) {
      console.error('Error listing users:', error);
      throw new Error('Erro ao listar usuários');
    }
  }

  /**
   * Get a user by ID
   */
  static async getUserById(id: string): Promise<any> {
    try {
      const user = await prisma.pessoa.findUnique({
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
      return {
        ...user,
        isActive: true // Default to true for now
      };
    } catch (error: any) {
      console.error('Error getting user:', error);
      // Re-throw the original error to maintain the error message
      throw error;
    }
  }

  /**
   * Reset a user's password
   */
  static async resetUserPassword(id: string): Promise<string> {
    // Check if user exists
    const existingUser = await prisma.pessoa.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    // Generate a random password
    const newPassword = Math.random().toString(36).slice(-8);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Store the new password hash
    if (!global.userPasswords) {
      global.userPasswords = new Map<string, string>();
    }
    global.userPasswords.set(id, hashedPassword);

    return newPassword;
  }

  /**
   * Change a user's password
   */
  static async changeUserPassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    // Check if user exists
    const existingUser = await prisma.pessoa.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    // Verify current password
    if (!global.userPasswords) {
      global.userPasswords = new Map<string, string>();
    }

    const storedHash = global.userPasswords.get(id);
    if (!storedHash) {
      throw new Error('Senha atual não encontrada');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, storedHash);
    if (!isPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    // Validate new password
    const passwordValidation = AuthService.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Senha inválida: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash and store the new password
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    global.userPasswords.set(id, hashedPassword);
  }

  /**
   * Validate user role and permissions
   */
  static validateUserRole(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole);
  }

  /**
   * Count users by role
   */
  static async countUsersByRole(): Promise<Record<string, number>> {
    try {
      const users = await prisma.pessoa.groupBy({
        by: ['funcao'],
        _count: {
          id: true
        }
      });

      const result: Record<string, number> = {};
      users.forEach(item => {
        result[item.funcao] = item._count.id;
      });

      return result;
    } catch (error) {
      console.error('Error counting users by role:', error);
      throw new Error('Erro ao contar usuários por função');
    }
  }
}

export default UserManagementService;
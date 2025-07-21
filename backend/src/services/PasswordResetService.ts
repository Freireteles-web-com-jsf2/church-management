import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import AuthService from './AuthService';
import CryptoUtils from '../utils/crypto';

const prisma = new PrismaClient();

// Define a interface para o token de redefinição de senha
export interface PasswordResetToken {
  id: string;
  userId: string;
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

// Declare global types for in-memory storage
declare global {
  var passwordResetTokens: Map<string, PasswordResetToken>;
}

export class PasswordResetService {
  private static readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Cria um token de redefinição de senha para o usuário
   */
  static async createResetToken(email: string): Promise<PasswordResetToken | null> {
    try {
      // Verificar se o email existe
      const user = await prisma.pessoa.findUnique({
        where: { email }
      });

      if (!user) {
        // Por segurança, não revelamos se o email existe ou não
        console.log(`Reset password requested for non-existent email: ${email}`);
        return null;
      }

      // Gerar token seguro
      const token = CryptoUtils.generateSecureToken(32);
      
      // Criar registro de token
      const resetToken: PasswordResetToken = {
        id: crypto.randomUUID(),
        userId: user.id,
        email: user.email,
        token: token,
        expiresAt: new Date(Date.now() + this.TOKEN_EXPIRY),
        used: false,
        createdAt: new Date()
      };

      // Armazenar token (em produção, isso seria armazenado no banco de dados)
      if (!global.passwordResetTokens) {
        global.passwordResetTokens = new Map();
      }

      // Invalidar tokens anteriores para este usuário
      for (const [existingToken, tokenData] of global.passwordResetTokens.entries()) {
        if (tokenData.userId === user.id && !tokenData.used) {
          tokenData.used = true;
          global.passwordResetTokens.set(existingToken, tokenData);
        }
      }

      // Armazenar o novo token
      global.passwordResetTokens.set(token, resetToken);

      return resetToken;
    } catch (error) {
      console.error('Error creating password reset token:', error);
      return null;
    }
  }

  /**
   * Verifica se um token de redefinição de senha é válido
   */
  static async validateResetToken(token: string): Promise<PasswordResetToken | null> {
    if (!global.passwordResetTokens) {
      return null;
    }

    const resetToken = global.passwordResetTokens.get(token);
    if (!resetToken) {
      return null;
    }

    // Verificar se o token expirou
    if (new Date() > resetToken.expiresAt || resetToken.used) {
      return null;
    }

    return resetToken;
  }

  /**
   * Redefine a senha do usuário usando um token válido
   */
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Validar o token
      const resetToken = await this.validateResetToken(token);
      if (!resetToken) {
        return false;
      }

      // Validar a nova senha
      const passwordValidation = AuthService.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return false;
      }

      // Gerar hash da nova senha
      const hashedPassword = await AuthService.hashPassword(newPassword);

      // Em uma implementação real, você atualizaria a senha no banco de dados
      // Por enquanto, apenas simulamos o sucesso
      console.log(`Password reset for user ${resetToken.userId} (${resetToken.email})`);

      // Marcar o token como usado
      resetToken.used = true;
      global.passwordResetTokens.set(token, resetToken);

      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  }

  /**
   * Limpa tokens expirados ou usados
   */
  static async cleanupExpiredTokens(): Promise<void> {
    if (!global.passwordResetTokens) {
      return;
    }

    const now = new Date();
    for (const [token, tokenData] of global.passwordResetTokens.entries()) {
      if (now > tokenData.expiresAt || tokenData.used) {
        global.passwordResetTokens.delete(token);
      }
    }
  }
}

// Inicializar limpeza periódica de tokens expirados
setInterval(() => {
  PasswordResetService.cleanupExpiredTokens();
}, 60 * 60 * 1000); // Limpar a cada hora

export default PasswordResetService;
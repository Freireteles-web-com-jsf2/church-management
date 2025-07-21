import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import AuthService from '../services/AuthService';
import { authenticate, rateLimitAuth, refreshSession } from '../middleware/auth';
import { AuthErrorCodes, getAuthError } from '../utils/authErrors';

const router = Router();
const prisma = new PrismaClient();

// Login endpoint
router.post('/login', rateLimitAuth(), async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json(getAuthError(AuthErrorCodes.MISSING_CREDENTIALS));
    }

    // Get client info
    const clientIp = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Authenticate user
    const result = await AuthService.authenticateUser(email, password, clientIp, userAgent);

    if (!result.success) {
      return res.status(401).json(getAuthError(AuthErrorCodes.AUTHENTICATION_FAILED, { details: result.error }));
    }

    // Return success response
    res.json({
      success: true,
      user: result.user,
      token: result.token,
      message: 'Login realizado com sucesso'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// Logout endpoint
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.substring(7) || req.headers['x-auth-token'] as string;

    if (token) {
      await AuthService.logout(token);
    }

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// Validate token endpoint
router.get('/validate', authenticate, (req: Request, res: Response) => {
  res.json({
    valid: true,
    user: req.user,
    session: {
      expiresAt: req.session.expiresAt,
      lastActivity: req.session.lastActivity
    }
  });
});

// Refresh token endpoint
router.post('/refresh', authenticate, refreshSession, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.substring(7) || req.headers['x-auth-token'] as string;

    const refreshedSession = await AuthService.refreshSession(token);

    if (!refreshedSession) {
      return res.status(401).json(getAuthError('REFRESH_FAILED'));
    }

    res.json({
      success: true,
      session: {
        expiresAt: refreshedSession.expiresAt,
        lastActivity: refreshedSession.lastActivity
      },
      message: 'Sessão renovada com sucesso'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// Get user profile endpoint
router.get('/profile', authenticate, (req: Request, res: Response) => {
  res.json({
    user: req.user
  });
});

// Get login history endpoint
router.get('/history', authenticate, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const history = await AuthService.getLoginHistory(req.user.id, limit);

    res.json({
      history: history.map(attempt => ({
        success: attempt.success,
        timestamp: attempt.timestamp,
        ipAddress: attempt.ipAddress,
        userAgent: attempt.userAgent,
        failureReason: attempt.failureReason
      }))
    });

  } catch (error) {
    console.error('Login history error:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// Get active sessions endpoint
router.get('/sessions', authenticate, async (req: Request, res: Response) => {
  try {
    const sessions = await AuthService.getActiveSessions(req.user.id);

    res.json({
      sessions: sessions.map(session => ({
        token: session.token.substring(0, 10) + '...', // Partial token for security
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        expiresAt: session.expiresAt,
        rememberMe: session.rememberMe,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent
      }))
    });

  } catch (error) {
    console.error('Active sessions error:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// Password validation endpoint
router.post('/validate-password', (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json(getAuthError(AuthErrorCodes.MISSING_PASSWORD));
    }

    const validation = AuthService.validatePassword(password);

    res.json({
      valid: validation.isValid,
      errors: validation.errors
    });

  } catch (error) {
    console.error('Password validation error:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// Security events endpoint (admin only)
router.get('/security-events', authenticate, async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.user.funcao !== 'admin') {
      return res.status(403).json(getAuthError(AuthErrorCodes.INSUFFICIENT_PERMISSIONS));
    }

    const limit = parseInt(req.query.limit as string) || 100;
    const events = await AuthService.getSecurityEvents(limit);

    res.json({
      events: events.map(event => ({
        email: event.email,
        timestamp: event.timestamp,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        failureReason: event.failureReason
      }))
    });

  } catch (error) {
    console.error('Security events error:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// Password recovery endpoints
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email é obrigatório',
        code: 'MISSING_EMAIL'
      });
    }

    // Importar serviços necessários
    const PasswordResetService = (await import('../services/PasswordResetService')).default;
    const EmailService = (await import('../services/EmailService')).default;

    // Criar token de redefinição de senha
    const resetToken = await PasswordResetService.createResetToken(email);

    // Por segurança, sempre retornamos sucesso, mesmo se o email não existir
    // Isso evita que atacantes descubram quais emails estão cadastrados
    if (resetToken) {
      // Buscar informações do usuário
      const user = await prisma.pessoa.findUnique({
        where: { email }
      });

      if (user) {
        // Enviar email com o token
        await EmailService.sendPasswordResetEmail(
          email,
          resetToken.token,
          user.nome
        );
      }
    }

    res.json({
      success: true,
      message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

router.post('/validate-reset-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token é obrigatório',
        code: 'MISSING_TOKEN'
      });
    }

    // Importar serviço necessário
    const PasswordResetService = (await import('../services/PasswordResetService')).default;

    // Validar token
    const resetToken = await PasswordResetService.validateResetToken(token);

    if (!resetToken) {
      return res.status(400).json({
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    }

    res.json({
      valid: true,
      email: resetToken.email,
      expiresAt: resetToken.expiresAt
    });

  } catch (error) {
    console.error('Validate reset token error:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json(getAuthError(AuthErrorCodes.MISSING_FIELDS));
    }

    // Validar requisitos da senha
    const passwordValidation = AuthService.validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json(getAuthError(AuthErrorCodes.INVALID_PASSWORD, passwordValidation.errors));
    }

    // Importar serviços necessários
    const PasswordResetService = (await import('../services/PasswordResetService')).default;
    const EmailService = (await import('../services/EmailService')).default;

    // Redefinir senha
    const success = await PasswordResetService.resetPassword(token, password);

    if (!success) {
      return res.status(400).json(getAuthError(AuthErrorCodes.RESET_FAILED));
    }

    // Obter informações do token para enviar email de confirmação
    const resetToken = await PasswordResetService.validateResetToken(token);
    if (resetToken) {
      // Buscar informações do usuário
      const user = await prisma.pessoa.findUnique({
        where: { email: resetToken.email }
      });

      if (user) {
        // Enviar email de confirmação
        await EmailService.sendPasswordChangedEmail(
          resetToken.email,
          user.nome
        );
      }
    }

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso. Você já pode fazer login com sua nova senha.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

export default router; 
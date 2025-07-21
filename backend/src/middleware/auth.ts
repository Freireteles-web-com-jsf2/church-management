import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService';
import { AuthErrorCodes, getAuthError } from '../utils/authErrors';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      session?: any;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    nome: string;
    email: string;
    funcao: string;
    isActive: boolean;
  };
  session: {
    token: string;
    userId: string;
    expiresAt: Date;
    rememberMe: boolean;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    lastActivity: Date;
  };
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : req.headers['x-auth-token'] as string;

    if (!token) {
      return res.status(401).json(getAuthError(AuthErrorCodes.NO_TOKEN));
    }

    // Validate session
    const session = await AuthService.validateSession(token);
    if (!session) {
      return res.status(401).json(getAuthError(AuthErrorCodes.INVALID_TOKEN));
    }

    // Get user data
    const user = await AuthService.getUserFromToken(token);
    if (!user) {
      return res.status(401).json(getAuthError(AuthErrorCodes.USER_NOT_FOUND));
    }

    if (!user.isActive) {
      return res.status(401).json(getAuthError(AuthErrorCodes.ACCOUNT_INACTIVE));
    }

    // Attach user and session to request
    req.user = user;
    req.session = session;

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
};

// Authorization middleware factory
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(getAuthError(AuthErrorCodes.NOT_AUTHENTICATED));
    }

    const userRole = req.user.funcao;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json(getAuthError(AuthErrorCodes.INSUFFICIENT_PERMISSIONS, { required: allowedRoles, current: userRole }));
    }

    next();
  };
};

// Role-based authorization helpers
export const requireAdmin = authorize(['admin']);
export const requirePastor = authorize(['admin', 'pastor']);
export const requireLider = authorize(['admin', 'pastor', 'lider']);
export const requireTesoureiro = authorize(['admin', 'pastor', 'tesoureiro']);
export const requireVoluntario = authorize(['admin', 'pastor', 'lider', 'tesoureiro', 'voluntario']);
export const requireMembro = authorize(['admin', 'pastor', 'lider', 'tesoureiro', 'voluntario', 'membro']);

// Rate limiting middleware for authentication endpoints
export const rateLimitAuth = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const email = req.body.email;

    if (email) {
      const canAttempt = await AuthService.checkLoginAttempts(email, clientIp);
      if (!canAttempt) {
        return res.status(429).json(getAuthError(AuthErrorCodes.TOO_MANY_ATTEMPTS, { retryAfter: windowMs / 1000 }));
      }
    }

    next();
  };
};

// Session refresh middleware
export const refreshSession = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.token) {
    try {
      await AuthService.refreshSession(req.session.token);
    } catch (error) {
      console.error('Session refresh error:', error);
      // Continue without failing the request
    }
  }
  next();
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict transport security (HTTPS only)
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};

export default {
  authenticate,
  authorize,
  requireAdmin,
  requirePastor,
  requireLider,
  requireTesoureiro,
  requireVoluntario,
  requireMembro,
  rateLimitAuth,
  refreshSession,
  securityHeaders
};
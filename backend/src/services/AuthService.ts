import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import SecurityAuditService from './SecurityAuditService';

// Declare global types for in-memory storage
declare global {
  var loginAttempts: LoginAttempt[];
  var sessions: Map<string, SessionData>;
}

const prisma = new PrismaClient();

export interface LoginAttempt {
  id: string;
  email: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  failureReason?: string;
}

export interface SessionData {
  token: string;
  userId: string;
  expiresAt: Date;
  rememberMe: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  lastActivity: Date;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface LocalUser {
  id: string;
  nome: string;
  email: string;
  funcao: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
  private static readonly LOCKOUT_DURATION = parseInt(process.env.LOCKOUT_DURATION || '900000'); // 15 minutes
  private static readonly SESSION_DURATION = parseInt(process.env.SESSION_DURATION || '86400000'); // 24 hours
  private static readonly EXTENDED_SESSION_DURATION = parseInt(process.env.EXTENDED_SESSION_DURATION || '2592000000'); // 30 days

  // Password validation and hashing
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    // Basic length requirement
    if (password.length < 8) {
      errors.push('A senha deve ter pelo menos 8 caracteres');
    }

    // Maximum length to prevent DoS attacks
    if (password.length > 128) {
      errors.push('A senha não pode ter mais de 128 caracteres');
    }

    // Must contain at least one letter
    if (!/[a-zA-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra');
    }

    // Must contain at least one number
    if (!/\d/.test(password)) {
      errors.push('A senha deve conter pelo menos um número');
    }

    // Must contain at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('A senha deve conter pelo menos um caractere especial');
    }

    // Must contain both uppercase and lowercase letters for stronger passwords
    if (password.length >= 12) {
      if (!/[a-z]/.test(password)) {
        errors.push('Senhas com 12+ caracteres devem conter pelo menos uma letra minúscula');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Senhas com 12+ caracteres devem conter pelo menos uma letra maiúscula');
      }
    }

    // Check for common weak patterns
    const weakPatterns = [
      /(.)\1{2,}/,  // Three or more consecutive identical characters
      /123456|654321|abcdef|qwerty/i,  // Common sequences
      /password|senha|admin|user|login/i,  // Common words
    ];

    for (const pattern of weakPatterns) {
      if (pattern.test(password)) {
        errors.push('A senha contém padrões comuns que a tornam vulnerável');
        break;
      }
    }

    // Check for whitespace at beginning or end
    if (password !== password.trim()) {
      errors.push('A senha não pode começar ou terminar com espaços');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get password strength score (0-100)
  static getPasswordStrength(password: string): { score: number; level: 'weak' | 'fair' | 'good' | 'strong'; feedback: string[] } {
    let score = 0;
    const feedback: string[] = [];

    // Length scoring
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Character variety scoring
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/\d/.test(password)) score += 10;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

    // Bonus for multiple character types
    const charTypes = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ].filter(Boolean).length;

    if (charTypes >= 3) score += 10;
    if (charTypes === 4) score += 5;

    // Penalties for weak patterns
    if (/(.)\1{2,}/.test(password)) score -= 10;
    if (/123456|654321|abcdef|qwerty/i.test(password)) score -= 15;
    if (/password|senha|admin|user|login/i.test(password)) score -= 20;

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    // Determine level and feedback
    let level: 'weak' | 'fair' | 'good' | 'strong';
    if (score < 30) {
      level = 'weak';
      feedback.push('Senha muito fraca - adicione mais caracteres e variedade');
    } else if (score < 60) {
      level = 'fair';
      feedback.push('Senha razoável - considere adicionar mais caracteres especiais');
    } else if (score < 80) {
      level = 'good';
      feedback.push('Boa senha - bem protegida contra ataques comuns');
    } else {
      level = 'strong';
      feedback.push('Senha muito forte - excelente proteção');
    }

    return { score, level, feedback };
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Token generation and validation
  static generateSecureToken(): string {
    return jwt.sign(
      {
        random: Math.random(),
        timestamp: Date.now()
      },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  static generateSessionToken(userId: string, rememberMe: boolean = false): string {
    const expiresIn = rememberMe ? '30d' : '24h';
    return jwt.sign(
      {
        userId,
        type: 'session',
        rememberMe
      },
      this.JWT_SECRET,
      { expiresIn }
    );
  }

  static validateToken(token: string): { isValid: boolean; payload?: any } {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET);
      return { isValid: true, payload };
    } catch (error) {
      return { isValid: false };
    }
  }

  // Login attempt tracking and brute force protection
  static async recordLoginAttempt(
    email: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    failureReason?: string
  ): Promise<void> {
    // In a real implementation, this would be stored in a database
    // For now, we'll use a simple in-memory store
    const attempt: LoginAttempt = {
      id: Math.random().toString(36),
      email,
      success,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      failureReason
    };

    // Store in memory (in production, use Redis or database)
    if (!global.loginAttempts) {
      global.loginAttempts = [];
    }
    global.loginAttempts.push(attempt);

    // Log authentication event to audit system
    await SecurityAuditService.logAuthenticationEvent(
      success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
      success ? 'SUCCESS' : 'FAILURE',
      email,
      undefined, // userId not available at this point
      ipAddress,
      userAgent,
      {
        failureReason,
        attemptId: attempt.id,
        timestamp: attempt.timestamp
      }
    );

    // Clean old attempts (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    global.loginAttempts = global.loginAttempts.filter(
      (attempt: LoginAttempt) => attempt.timestamp > oneHourAgo
    );
  }

  static async checkLoginAttempts(email: string, ipAddress?: string): Promise<boolean> {
    if (!global.loginAttempts) {
      return true; // Allow if no attempts recorded
    }

    const now = new Date();
    const lockoutTime = new Date(now.getTime() - this.LOCKOUT_DURATION);

    // Check failed attempts by email in the last 15 minutes
    const recentFailedAttempts = global.loginAttempts.filter(
      (attempt: LoginAttempt) =>
        attempt.email === email &&
        !attempt.success &&
        attempt.timestamp > lockoutTime
    );

    // Check failed attempts by IP in the last 15 minutes
    const recentFailedAttemptsFromIP = ipAddress ? global.loginAttempts.filter(
      (attempt: LoginAttempt) =>
        attempt.ipAddress === ipAddress &&
        !attempt.success &&
        attempt.timestamp > lockoutTime
    ) : [];

    return recentFailedAttempts.length < this.MAX_LOGIN_ATTEMPTS &&
      recentFailedAttemptsFromIP.length < this.MAX_LOGIN_ATTEMPTS * 2;
  }

  static async isAccountLocked(email: string): Promise<boolean> {
    return !(await this.checkLoginAttempts(email));
  }

  // Session management
  static createSession(user: LocalUser, rememberMe: boolean = false, ipAddress?: string, userAgent?: string): SessionData {
    const token = this.generateSessionToken(user.id, rememberMe);
    const duration = rememberMe ? this.EXTENDED_SESSION_DURATION : this.SESSION_DURATION;

    const session: SessionData = {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + duration),
      rememberMe,
      ipAddress,
      userAgent,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    // Store session (in production, use Redis or database)
    if (!global.sessions) {
      global.sessions = new Map();
    }
    global.sessions.set(token, session);

    // Log session creation
    SecurityAuditService.logSessionEvent(
      'SESSION_CREATED',
      'SUCCESS',
      user.id,
      user.email,
      token,
      ipAddress,
      {
        rememberMe,
        expiresAt: session.expiresAt,
        userAgent
      }
    );

    return session;
  }

  static async validateSession(token: string): Promise<SessionData | null> {
    if (!global.sessions) {
      return null;
    }

    const session = global.sessions.get(token);
    if (!session) {
      return null;
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      global.sessions.delete(token);
      return null;
    }

    // Update last activity
    session.lastActivity = new Date();
    global.sessions.set(token, session);

    return session;
  }

  static async refreshSession(token: string): Promise<SessionData | null> {
    const session = await this.validateSession(token);
    if (!session) {
      return null;
    }

    // Extend session expiry
    const duration = session.rememberMe ? this.EXTENDED_SESSION_DURATION : this.SESSION_DURATION;
    session.expiresAt = new Date(Date.now() + duration);
    session.lastActivity = new Date();

    global.sessions.set(token, session);
    return session;
  }

  static async destroySession(token: string): Promise<void> {
    if (global.sessions) {
      const session = global.sessions.get(token);
      if (session) {
        // Log session destruction
        SecurityAuditService.logSessionEvent(
          'SESSION_DESTROYED',
          'SUCCESS',
          session.userId,
          undefined, // userEmail not available in session
          token,
          session.ipAddress,
          {
            sessionDuration: new Date().getTime() - session.createdAt.getTime(),
            lastActivity: session.lastActivity
          }
        );
      }
      global.sessions.delete(token);
    }
  }

  static async cleanExpiredSessions(): Promise<void> {
    if (!global.sessions) {
      return;
    }

    const now = new Date();
    for (const [token, session] of global.sessions.entries()) {
      if (now > session.expiresAt) {
        global.sessions.delete(token);
      }
    }
  }

  static async getActiveSessions(userId: string): Promise<SessionData[]> {
    if (!global.sessions) {
      return [];
    }

    const userSessions: SessionData[] = [];
    for (const session of global.sessions.values()) {
      if (session.userId === userId) {
        userSessions.push(session);
      }
    }

    return userSessions;
  }

  // Authentication methods
  static async authenticateUser(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<{ success: boolean; user?: LocalUser; token?: string; error?: string }> {
    try {
      // Check if account is locked
      const canAttemptLogin = await this.checkLoginAttempts(email, ipAddress);
      if (!canAttemptLogin) {
        await this.recordLoginAttempt(email, false, ipAddress, userAgent, 'ACCOUNT_LOCKED');
        return {
          success: false,
          error: 'Conta temporariamente bloqueada devido a muitas tentativas de login. Tente novamente em 15 minutos.'
        };
      }

      // Find user by email
      const pessoa = await prisma.pessoa.findUnique({
        where: { email }
      });

      if (!pessoa) {
        await this.recordLoginAttempt(email, false, ipAddress, userAgent, 'USER_NOT_FOUND');
        return {
          success: false,
          error: 'Credenciais inválidas'
        };
      }

      // For now, we'll use a simple password check since we don't have hashed passwords in the current schema
      // In a real implementation, you would verify against a hashed password
      // const isPasswordValid = await this.verifyPassword(password, pessoa.hashedPassword);

      // Temporary simple password validation (replace with proper hash verification)
      const isPasswordValid = password === 'admin123'; // This should be replaced with proper password verification

      if (!isPasswordValid) {
        await this.recordLoginAttempt(email, false, ipAddress, userAgent, 'INVALID_PASSWORD');
        return {
          success: false,
          error: 'Credenciais inválidas'
        };
      }

      // Update last login
      await prisma.pessoa.update({
        where: { id: pessoa.id },
        data: {
          // lastLogin: new Date() // This field doesn't exist in current schema
        }
      });

      const user: LocalUser = {
        id: pessoa.id,
        nome: pessoa.nome,
        email: pessoa.email,
        funcao: pessoa.funcao,
        isActive: true, // Assuming all users are active for now
        createdAt: new Date(), // This field doesn't exist in current schema
        updatedAt: new Date()  // This field doesn't exist in current schema
      };

      // Create session
      const session = this.createSession(user, false, ipAddress, userAgent);

      await this.recordLoginAttempt(email, true, ipAddress, userAgent);

      return {
        success: true,
        user,
        token: session.token
      };

    } catch (error) {
      console.error('Authentication error:', error);
      await this.recordLoginAttempt(email, false, ipAddress, userAgent, 'SYSTEM_ERROR');
      return {
        success: false,
        error: 'Erro interno do sistema'
      };
    }
  }

  static async logout(token: string): Promise<void> {
    await this.destroySession(token);
  }

  // Utility methods
  static async getUserFromToken(token: string): Promise<LocalUser | null> {
    const session = await this.validateSession(token);
    if (!session) {
      return null;
    }

    try {
      const pessoa = await prisma.pessoa.findUnique({
        where: { id: session.userId }
      });

      if (!pessoa) {
        return null;
      }

      return {
        id: pessoa.id,
        nome: pessoa.nome,
        email: pessoa.email,
        funcao: pessoa.funcao,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error getting user from token:', error);
      return null;
    }
  }

  // Security audit methods
  static async getLoginHistory(userId: string, limit: number = 50): Promise<LoginAttempt[]> {
    if (!global.loginAttempts) {
      return [];
    }

    // Get user email first
    const user = await prisma.pessoa.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return [];
    }

    return global.loginAttempts
      .filter((attempt: LoginAttempt) => attempt.email === user.email)
      .sort((a: LoginAttempt, b: LoginAttempt) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  static async getSecurityEvents(limit: number = 100): Promise<LoginAttempt[]> {
    if (!global.loginAttempts) {
      return [];
    }

    return global.loginAttempts
      .filter((attempt: LoginAttempt) => !attempt.success)
      .sort((a: LoginAttempt, b: LoginAttempt) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

// Initialize cleanup interval for expired sessions
setInterval(() => {
  AuthService.cleanExpiredSessions();
}, 60 * 60 * 1000); // Clean every hour

export default AuthService;
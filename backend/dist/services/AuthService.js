"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.AuthService = void 0;
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const SecurityAuditService_1 = __importDefault(require("./SecurityAuditService"));
const prisma = new client_1.PrismaClient();
class AuthService {
    // Password validation and hashing
    static validatePassword(password) {
        const errors = [];
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
            /(.)\1{2,}/, // Three or more consecutive identical characters
            /123456|654321|abcdef|qwerty/i, // Common sequences
            /password|senha|admin|user|login/i, // Common words
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
    static getPasswordStrength(password) {
        let score = 0;
        const feedback = [];
        // Length scoring
        if (password.length >= 8)
            score += 20;
        if (password.length >= 12)
            score += 10;
        if (password.length >= 16)
            score += 10;
        // Character variety scoring
        if (/[a-z]/.test(password))
            score += 10;
        if (/[A-Z]/.test(password))
            score += 10;
        if (/\d/.test(password))
            score += 10;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password))
            score += 15;
        // Bonus for multiple character types
        const charTypes = [
            /[a-z]/.test(password),
            /[A-Z]/.test(password),
            /\d/.test(password),
            /[!@#$%^&*(),.?":{}|<>]/.test(password)
        ].filter(Boolean).length;
        if (charTypes >= 3)
            score += 10;
        if (charTypes === 4)
            score += 5;
        // Penalties for weak patterns
        if (/(.)\1{2,}/.test(password))
            score -= 10;
        if (/123456|654321|abcdef|qwerty/i.test(password))
            score -= 15;
        if (/password|senha|admin|user|login/i.test(password))
            score -= 20;
        // Ensure score is within bounds
        score = Math.max(0, Math.min(100, score));
        // Determine level and feedback
        let level;
        if (score < 30) {
            level = 'weak';
            feedback.push('Senha muito fraca - adicione mais caracteres e variedade');
        }
        else if (score < 60) {
            level = 'fair';
            feedback.push('Senha razoável - considere adicionar mais caracteres especiais');
        }
        else if (score < 80) {
            level = 'good';
            feedback.push('Boa senha - bem protegida contra ataques comuns');
        }
        else {
            level = 'strong';
            feedback.push('Senha muito forte - excelente proteção');
        }
        return { score, level, feedback };
    }
    static hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcrypt.hash(password, this.SALT_ROUNDS);
        });
    }
    static verifyPassword(password, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcrypt.compare(password, hash);
        });
    }
    // Token generation and validation
    static generateSecureToken() {
        return jwt.sign({
            random: Math.random(),
            timestamp: Date.now()
        }, this.JWT_SECRET, { expiresIn: '24h' });
    }
    static generateSessionToken(userId, rememberMe = false) {
        const expiresIn = rememberMe ? '30d' : '24h';
        return jwt.sign({
            userId,
            type: 'session',
            rememberMe
        }, this.JWT_SECRET, { expiresIn });
    }
    static validateToken(token) {
        try {
            const payload = jwt.verify(token, this.JWT_SECRET);
            return { isValid: true, payload };
        }
        catch (error) {
            return { isValid: false };
        }
    }
    // Login attempt tracking and brute force protection
    static recordLoginAttempt(email, success, ipAddress, userAgent, failureReason) {
        return __awaiter(this, void 0, void 0, function* () {
            // In a real implementation, this would be stored in a database
            // For now, we'll use a simple in-memory store
            const attempt = {
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
            yield SecurityAuditService_1.default.logAuthenticationEvent(success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE', success ? 'SUCCESS' : 'FAILURE', email, undefined, // userId not available at this point
            ipAddress, userAgent, {
                failureReason,
                attemptId: attempt.id,
                timestamp: attempt.timestamp
            });
            // Clean old attempts (older than 1 hour)
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            global.loginAttempts = global.loginAttempts.filter((attempt) => attempt.timestamp > oneHourAgo);
        });
    }
    static checkLoginAttempts(email, ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!global.loginAttempts) {
                return true; // Allow if no attempts recorded
            }
            const now = new Date();
            const lockoutTime = new Date(now.getTime() - this.LOCKOUT_DURATION);
            // Check failed attempts by email in the last 15 minutes
            const recentFailedAttempts = global.loginAttempts.filter((attempt) => attempt.email === email &&
                !attempt.success &&
                attempt.timestamp > lockoutTime);
            // Check failed attempts by IP in the last 15 minutes
            const recentFailedAttemptsFromIP = ipAddress ? global.loginAttempts.filter((attempt) => attempt.ipAddress === ipAddress &&
                !attempt.success &&
                attempt.timestamp > lockoutTime) : [];
            return recentFailedAttempts.length < this.MAX_LOGIN_ATTEMPTS &&
                recentFailedAttemptsFromIP.length < this.MAX_LOGIN_ATTEMPTS * 2;
        });
    }
    static isAccountLocked(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return !(yield this.checkLoginAttempts(email));
        });
    }
    // Session management
    static createSession(user, rememberMe = false, ipAddress, userAgent) {
        const token = this.generateSessionToken(user.id, rememberMe);
        const duration = rememberMe ? this.EXTENDED_SESSION_DURATION : this.SESSION_DURATION;
        const session = {
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
        SecurityAuditService_1.default.logSessionEvent('SESSION_CREATED', 'SUCCESS', user.id, user.email, token, ipAddress, {
            rememberMe,
            expiresAt: session.expiresAt,
            userAgent
        });
        return session;
    }
    static validateSession(token) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    static refreshSession(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.validateSession(token);
            if (!session) {
                return null;
            }
            // Extend session expiry
            const duration = session.rememberMe ? this.EXTENDED_SESSION_DURATION : this.SESSION_DURATION;
            session.expiresAt = new Date(Date.now() + duration);
            session.lastActivity = new Date();
            global.sessions.set(token, session);
            return session;
        });
    }
    static destroySession(token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (global.sessions) {
                const session = global.sessions.get(token);
                if (session) {
                    // Log session destruction
                    SecurityAuditService_1.default.logSessionEvent('SESSION_DESTROYED', 'SUCCESS', session.userId, undefined, // userEmail not available in session
                    token, session.ipAddress, {
                        sessionDuration: new Date().getTime() - session.createdAt.getTime(),
                        lastActivity: session.lastActivity
                    });
                }
                global.sessions.delete(token);
            }
        });
    }
    static cleanExpiredSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!global.sessions) {
                return;
            }
            const now = new Date();
            for (const [token, session] of global.sessions.entries()) {
                if (now > session.expiresAt) {
                    global.sessions.delete(token);
                }
            }
        });
    }
    static getActiveSessions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!global.sessions) {
                return [];
            }
            const userSessions = [];
            for (const session of global.sessions.values()) {
                if (session.userId === userId) {
                    userSessions.push(session);
                }
            }
            return userSessions;
        });
    }
    // Authentication methods
    static authenticateUser(email, password, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if account is locked
                const canAttemptLogin = yield this.checkLoginAttempts(email, ipAddress);
                if (!canAttemptLogin) {
                    yield this.recordLoginAttempt(email, false, ipAddress, userAgent, 'ACCOUNT_LOCKED');
                    return {
                        success: false,
                        error: 'Conta temporariamente bloqueada devido a muitas tentativas de login. Tente novamente em 15 minutos.'
                    };
                }
                // Find user by email
                const pessoa = yield prisma.pessoa.findUnique({
                    where: { email }
                });
                if (!pessoa) {
                    yield this.recordLoginAttempt(email, false, ipAddress, userAgent, 'USER_NOT_FOUND');
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
                    yield this.recordLoginAttempt(email, false, ipAddress, userAgent, 'INVALID_PASSWORD');
                    return {
                        success: false,
                        error: 'Credenciais inválidas'
                    };
                }
                // Update last login
                yield prisma.pessoa.update({
                    where: { id: pessoa.id },
                    data: {
                    // lastLogin: new Date() // This field doesn't exist in current schema
                    }
                });
                const user = {
                    id: pessoa.id,
                    nome: pessoa.nome,
                    email: pessoa.email,
                    funcao: pessoa.funcao,
                    isActive: true, // Assuming all users are active for now
                    createdAt: new Date(), // This field doesn't exist in current schema
                    updatedAt: new Date() // This field doesn't exist in current schema
                };
                // Create session
                const session = this.createSession(user, false, ipAddress, userAgent);
                yield this.recordLoginAttempt(email, true, ipAddress, userAgent);
                return {
                    success: true,
                    user,
                    token: session.token
                };
            }
            catch (error) {
                console.error('Authentication error:', error);
                yield this.recordLoginAttempt(email, false, ipAddress, userAgent, 'SYSTEM_ERROR');
                return {
                    success: false,
                    error: 'Erro interno do sistema'
                };
            }
        });
    }
    static logout(token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.destroySession(token);
        });
    }
    // Utility methods
    static getUserFromToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.validateSession(token);
            if (!session) {
                return null;
            }
            try {
                const pessoa = yield prisma.pessoa.findUnique({
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
            }
            catch (error) {
                console.error('Error getting user from token:', error);
                return null;
            }
        });
    }
    // Security audit methods
    static getLoginHistory(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 50) {
            if (!global.loginAttempts) {
                return [];
            }
            // Get user email first
            const user = yield prisma.pessoa.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return [];
            }
            return global.loginAttempts
                .filter((attempt) => attempt.email === user.email)
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, limit);
        });
    }
    static getSecurityEvents() {
        return __awaiter(this, arguments, void 0, function* (limit = 100) {
            if (!global.loginAttempts) {
                return [];
            }
            return global.loginAttempts
                .filter((attempt) => !attempt.success)
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, limit);
        });
    }
}
exports.AuthService = AuthService;
AuthService.SALT_ROUNDS = 12;
AuthService.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
AuthService.MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
AuthService.LOCKOUT_DURATION = parseInt(process.env.LOCKOUT_DURATION || '900000'); // 15 minutes
AuthService.SESSION_DURATION = parseInt(process.env.SESSION_DURATION || '86400000'); // 24 hours
AuthService.EXTENDED_SESSION_DURATION = parseInt(process.env.EXTENDED_SESSION_DURATION || '2592000000'); // 30 days
// Initialize cleanup interval for expired sessions
setInterval(() => {
    AuthService.cleanExpiredSessions();
}, 60 * 60 * 1000); // Clean every hour
exports.default = AuthService;

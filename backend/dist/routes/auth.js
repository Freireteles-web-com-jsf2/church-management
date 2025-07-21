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
const express_1 = require("express");
const client_1 = require("@prisma/client");
const AuthService_1 = __importDefault(require("../services/AuthService"));
const auth_1 = require("../middleware/auth");
const authErrors_1 = require("../utils/authErrors");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Login endpoint
router.post('/login', (0, auth_1.rateLimitAuth)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, rememberMe } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.MISSING_CREDENTIALS));
        }
        // Get client info
        const clientIp = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        // Authenticate user
        const result = yield AuthService_1.default.authenticateUser(email, password, clientIp, userAgent);
        if (!result.success) {
            return res.status(401).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.AUTHENTICATION_FAILED, { details: result.error }));
        }
        // Return success response
        res.json({
            success: true,
            user: result.user,
            token: result.token,
            message: 'Login realizado com sucesso'
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// Logout endpoint
router.post('/logout', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.substring(7)) || req.headers['x-auth-token'];
        if (token) {
            yield AuthService_1.default.logout(token);
        }
        res.json({
            success: true,
            message: 'Logout realizado com sucesso'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// Validate token endpoint
router.get('/validate', auth_1.authenticate, (req, res) => {
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
router.post('/refresh', auth_1.authenticate, auth_1.refreshSession, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.substring(7)) || req.headers['x-auth-token'];
        const refreshedSession = yield AuthService_1.default.refreshSession(token);
        if (!refreshedSession) {
            return res.status(401).json((0, authErrors_1.getAuthError)('REFRESH_FAILED'));
        }
        res.json({
            success: true,
            session: {
                expiresAt: refreshedSession.expiresAt,
                lastActivity: refreshedSession.lastActivity
            },
            message: 'Sessão renovada com sucesso'
        });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// Get user profile endpoint
router.get('/profile', auth_1.authenticate, (req, res) => {
    res.json({
        user: req.user
    });
});
// Get login history endpoint
router.get('/history', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const history = yield AuthService_1.default.getLoginHistory(req.user.id, limit);
        res.json({
            history: history.map(attempt => ({
                success: attempt.success,
                timestamp: attempt.timestamp,
                ipAddress: attempt.ipAddress,
                userAgent: attempt.userAgent,
                failureReason: attempt.failureReason
            }))
        });
    }
    catch (error) {
        console.error('Login history error:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// Get active sessions endpoint
router.get('/sessions', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessions = yield AuthService_1.default.getActiveSessions(req.user.id);
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
    }
    catch (error) {
        console.error('Active sessions error:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// Password validation endpoint
router.post('/validate-password', (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.MISSING_PASSWORD));
        }
        const validation = AuthService_1.default.validatePassword(password);
        res.json({
            valid: validation.isValid,
            errors: validation.errors
        });
    }
    catch (error) {
        console.error('Password validation error:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
});
// Security events endpoint (admin only)
router.get('/security-events', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user is admin
        if (req.user.funcao !== 'admin') {
            return res.status(403).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INSUFFICIENT_PERMISSIONS));
        }
        const limit = parseInt(req.query.limit) || 100;
        const events = yield AuthService_1.default.getSecurityEvents(limit);
        res.json({
            events: events.map(event => ({
                email: event.email,
                timestamp: event.timestamp,
                ipAddress: event.ipAddress,
                userAgent: event.userAgent,
                failureReason: event.failureReason
            }))
        });
    }
    catch (error) {
        console.error('Security events error:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// Password recovery endpoints
router.post('/forgot-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                error: 'Email é obrigatório',
                code: 'MISSING_EMAIL'
            });
        }
        // Importar serviços necessários
        const PasswordResetService = (yield Promise.resolve().then(() => __importStar(require('../services/PasswordResetService')))).default;
        const EmailService = (yield Promise.resolve().then(() => __importStar(require('../services/EmailService')))).default;
        // Criar token de redefinição de senha
        const resetToken = yield PasswordResetService.createResetToken(email);
        // Por segurança, sempre retornamos sucesso, mesmo se o email não existir
        // Isso evita que atacantes descubram quais emails estão cadastrados
        if (resetToken) {
            // Buscar informações do usuário
            const user = yield prisma.pessoa.findUnique({
                where: { email }
            });
            if (user) {
                // Enviar email com o token
                yield EmailService.sendPasswordResetEmail(email, resetToken.token, user.nome);
            }
        }
        res.json({
            success: true,
            message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
router.post('/validate-reset-token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                error: 'Token é obrigatório',
                code: 'MISSING_TOKEN'
            });
        }
        // Importar serviço necessário
        const PasswordResetService = (yield Promise.resolve().then(() => __importStar(require('../services/PasswordResetService')))).default;
        // Validar token
        const resetToken = yield PasswordResetService.validateResetToken(token);
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
    }
    catch (error) {
        console.error('Validate reset token error:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
router.post('/reset-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.MISSING_FIELDS));
        }
        // Validar requisitos da senha
        const passwordValidation = AuthService_1.default.validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INVALID_PASSWORD, passwordValidation.errors));
        }
        // Importar serviços necessários
        const PasswordResetService = (yield Promise.resolve().then(() => __importStar(require('../services/PasswordResetService')))).default;
        const EmailService = (yield Promise.resolve().then(() => __importStar(require('../services/EmailService')))).default;
        // Redefinir senha
        const success = yield PasswordResetService.resetPassword(token, password);
        if (!success) {
            return res.status(400).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.RESET_FAILED));
        }
        // Obter informações do token para enviar email de confirmação
        const resetToken = yield PasswordResetService.validateResetToken(token);
        if (resetToken) {
            // Buscar informações do usuário
            const user = yield prisma.pessoa.findUnique({
                where: { email: resetToken.email }
            });
            if (user) {
                // Enviar email de confirmação
                yield EmailService.sendPasswordChangedEmail(resetToken.email, user.nome);
            }
        }
        res.json({
            success: true,
            message: 'Senha redefinida com sucesso. Você já pode fazer login com sua nova senha.'
        });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
exports.default = router;

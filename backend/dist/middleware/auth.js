"use strict";
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
exports.securityHeaders = exports.refreshSession = exports.rateLimitAuth = exports.requireMembro = exports.requireVoluntario = exports.requireTesoureiro = exports.requireLider = exports.requirePastor = exports.requireAdmin = exports.authorize = exports.authenticate = void 0;
const AuthService_1 = __importDefault(require("../services/AuthService"));
const authErrors_1 = require("../utils/authErrors");
// Authentication middleware
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : req.headers['x-auth-token'];
        if (!token) {
            return res.status(401).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.NO_TOKEN));
        }
        // Validate session
        const session = yield AuthService_1.default.validateSession(token);
        if (!session) {
            return res.status(401).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INVALID_TOKEN));
        }
        // Get user data
        const user = yield AuthService_1.default.getUserFromToken(token);
        if (!user) {
            return res.status(401).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.USER_NOT_FOUND));
        }
        if (!user.isActive) {
            return res.status(401).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.ACCOUNT_INACTIVE));
        }
        // Attach user and session to request
        req.user = user;
        req.session = session;
        next();
    }
    catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
});
exports.authenticate = authenticate;
// Authorization middleware factory
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.NOT_AUTHENTICATED));
        }
        const userRole = req.user.funcao;
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INSUFFICIENT_PERMISSIONS, { required: allowedRoles, current: userRole }));
        }
        next();
    };
};
exports.authorize = authorize;
// Role-based authorization helpers
exports.requireAdmin = (0, exports.authorize)(['admin']);
exports.requirePastor = (0, exports.authorize)(['admin', 'pastor']);
exports.requireLider = (0, exports.authorize)(['admin', 'pastor', 'lider']);
exports.requireTesoureiro = (0, exports.authorize)(['admin', 'pastor', 'tesoureiro']);
exports.requireVoluntario = (0, exports.authorize)(['admin', 'pastor', 'lider', 'tesoureiro', 'voluntario']);
exports.requireMembro = (0, exports.authorize)(['admin', 'pastor', 'lider', 'tesoureiro', 'voluntario', 'membro']);
// Rate limiting middleware for authentication endpoints
const rateLimitAuth = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
        const email = req.body.email;
        if (email) {
            const canAttempt = yield AuthService_1.default.checkLoginAttempts(email, clientIp);
            if (!canAttempt) {
                return res.status(429).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.TOO_MANY_ATTEMPTS, { retryAfter: windowMs / 1000 }));
            }
        }
        next();
    });
};
exports.rateLimitAuth = rateLimitAuth;
// Session refresh middleware
const refreshSession = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.session && req.session.token) {
        try {
            yield AuthService_1.default.refreshSession(req.session.token);
        }
        catch (error) {
            console.error('Session refresh error:', error);
            // Continue without failing the request
        }
    }
    next();
});
exports.refreshSession = refreshSession;
// Security headers middleware
const securityHeaders = (req, res, next) => {
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
exports.securityHeaders = securityHeaders;
exports.default = {
    authenticate: exports.authenticate,
    authorize: exports.authorize,
    requireAdmin: exports.requireAdmin,
    requirePastor: exports.requirePastor,
    requireLider: exports.requireLider,
    requireTesoureiro: exports.requireTesoureiro,
    requireVoluntario: exports.requireVoluntario,
    requireMembro: exports.requireMembro,
    rateLimitAuth: exports.rateLimitAuth,
    refreshSession: exports.refreshSession,
    securityHeaders: exports.securityHeaders
};

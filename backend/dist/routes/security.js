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
const express_1 = __importDefault(require("express"));
const SecurityMonitoringService_1 = __importDefault(require("../services/SecurityMonitoringService"));
const AuthService_1 = require("../services/AuthService");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get security dashboard data (admin only)
router.get('/dashboard', auth_1.authenticate, auth_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dashboardData = yield SecurityMonitoringService_1.default.getSecurityDashboard();
        res.json(dashboardData);
    }
    catch (error) {
        console.error('Error getting security dashboard:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Get login attempt statistics
router.get('/login-stats', auth_1.authenticate, auth_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const timeRange = parseInt(req.query.timeRange) || 60; // minutes
        const stats = yield SecurityMonitoringService_1.default.analyzeLoginAttempts(timeRange);
        res.json(stats);
    }
    catch (error) {
        console.error('Error getting login stats:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Get security alerts
router.get('/alerts', auth_1.authenticate, auth_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const alerts = yield SecurityMonitoringService_1.default.generateSecurityAlerts();
        res.json(alerts);
    }
    catch (error) {
        console.error('Error getting security alerts:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Get suspicious activity patterns
router.get('/suspicious-patterns', auth_1.authenticate, auth_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patterns = yield SecurityMonitoringService_1.default.detectSuspiciousPatterns();
        res.json(patterns);
    }
    catch (error) {
        console.error('Error getting suspicious patterns:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Get account lockout information
router.get('/lockout-info/:email', auth_1.authenticate, auth_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.params;
        const lockoutInfo = yield SecurityMonitoringService_1.default.getAccountLockoutInfo(email);
        res.json(lockoutInfo);
    }
    catch (error) {
        console.error('Error getting lockout info:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Get login history for a user
router.get('/login-history/:userId', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        // Users can only see their own history, admins can see any user's history
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== userId && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.funcao) !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        const history = yield AuthService_1.AuthService.getLoginHistory(userId, limit);
        res.json(history);
    }
    catch (error) {
        console.error('Error getting login history:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Get security events (admin only)
router.get('/events', auth_1.authenticate, auth_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const events = yield AuthService_1.AuthService.getSecurityEvents(limit);
        res.json(events);
    }
    catch (error) {
        console.error('Error getting security events:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Manually unlock an account (admin only)
router.post('/unlock-account', auth_1.authenticate, auth_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email é obrigatório' });
        }
        // Clear failed login attempts for this email
        if (global.loginAttempts) {
            global.loginAttempts = global.loginAttempts.filter(attempt => attempt.email !== email || attempt.success);
        }
        // Log security event
        yield SecurityMonitoringService_1.default.logSecurityEvent({
            type: 'ACCOUNT_LOCKOUT',
            severity: 'MEDIUM',
            email,
            details: {
                action: 'MANUAL_UNLOCK',
                unlockedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                timestamp: new Date()
            }
        });
        res.json({ message: 'Conta desbloqueada com sucesso' });
    }
    catch (error) {
        console.error('Error unlocking account:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Acknowledge security alert (admin only)
router.post('/alerts/:alertId/acknowledge', auth_1.authenticate, auth_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { alertId } = req.params;
        // In a real implementation, this would update the alert in the database
        // For now, we'll just log the acknowledgment
        yield SecurityMonitoringService_1.default.logSecurityEvent({
            type: 'SUSPICIOUS_ACTIVITY',
            severity: 'LOW',
            details: {
                action: 'ALERT_ACKNOWLEDGED',
                alertId,
                acknowledgedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                timestamp: new Date()
            }
        });
        res.json({ message: 'Alerta reconhecido com sucesso' });
    }
    catch (error) {
        console.error('Error acknowledging alert:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Get current user's login attempts (for self-monitoring)
router.get('/my-login-attempts', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.email)) {
            return res.status(400).json({ error: 'Usuário não encontrado' });
        }
        const lockoutInfo = yield SecurityMonitoringService_1.default.getAccountLockoutInfo(req.user.email);
        // Get recent attempts for this user
        const recentAttempts = global.loginAttempts ?
            global.loginAttempts
                .filter(attempt => attempt.email === req.user.email)
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, 10) : [];
        res.json({
            lockoutInfo,
            recentAttempts: recentAttempts.map(attempt => ({
                success: attempt.success,
                timestamp: attempt.timestamp,
                ipAddress: attempt.ipAddress,
                failureReason: attempt.failureReason
            }))
        });
    }
    catch (error) {
        console.error('Error getting user login attempts:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
exports.default = router;

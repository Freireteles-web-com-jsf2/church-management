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
const SecurityAuditService_1 = __importDefault(require("../services/SecurityAuditService"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get audit events with filtering (admin only)
router.get('/events', auth_1.authenticate, auth_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventTypes, categories, severities, userEmails, ipAddresses, dateFrom, dateTo, outcomes, riskScoreMin, riskScoreMax, tags, searchText, limit, offset } = req.query;
        const query = {};
        if (eventTypes) {
            query.eventTypes = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
        }
        if (categories) {
            query.categories = Array.isArray(categories) ? categories : [categories];
        }
        if (severities) {
            query.severities = Array.isArray(severities) ? severities : [severities];
        }
        if (userEmails) {
            query.userEmails = Array.isArray(userEmails) ? userEmails : [userEmails];
        }
        if (ipAddresses) {
            query.ipAddresses = Array.isArray(ipAddresses) ? ipAddresses : [ipAddresses];
        }
        if (dateFrom) {
            query.dateFrom = new Date(dateFrom);
        }
        if (dateTo) {
            query.dateTo = new Date(dateTo);
        }
        if (outcomes) {
            query.outcomes = Array.isArray(outcomes) ? outcomes : [outcomes];
        }
        if (riskScoreMin) {
            query.riskScoreMin = parseInt(riskScoreMin);
        }
        if (riskScoreMax) {
            query.riskScoreMax = parseInt(riskScoreMax);
        }
        if (tags) {
            query.tags = Array.isArray(tags) ? tags : [tags];
        }
        if (searchText) {
            query.searchText = searchText;
        }
        if (limit) {
            query.limit = parseInt(limit);
        }
        if (offset) {
            query.offset = parseInt(offset);
        }
        const events = yield SecurityAuditService_1.default.queryAuditEvents(query);
        res.json(events);
    }
    catch (error) {
        console.error('Error getting audit events:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Get audit summary statistics (admin only)
router.get('/summary', auth_1.authenticate, auth_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dateFrom, dateTo } = req.query;
        const summary = yield SecurityAuditService_1.default.getAuditSummary(dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
        res.json(summary);
    }
    catch (error) {
        console.error('Error getting audit summary:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Get suspicious activity patterns (admin only)
router.get('/suspicious-activity', auth_1.authenticate, auth_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const suspiciousActivities = yield SecurityAuditService_1.default.detectSuspiciousActivity();
        res.json(suspiciousActivities);
    }
    catch (error) {
        console.error('Error getting suspicious activity:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Get detailed login history with audit information (admin or own user)
router.get('/login-history/:userId', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        // Users can only see their own history, admins can see any user's history
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== userId && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.funcao) !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        const history = yield SecurityAuditService_1.default.getDetailedLoginHistory(userId, limit);
        res.json(history);
    }
    catch (error) {
        console.error('Error getting detailed login history:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Log a custom audit event (admin only)
router.post('/log-event', auth_1.authenticate, auth_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { eventType, category, severity, action, details, targetUserId, targetUserEmail, resource, outcome, tags } = req.body;
        if (!eventType || !category || !severity || !action || !outcome) {
            return res.status(400).json({
                error: 'Campos obrigatórios: eventType, category, severity, action, outcome'
            });
        }
        const auditEvent = yield SecurityAuditService_1.default.logAuditEvent({
            eventType,
            category,
            severity,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            userEmail: (_b = req.user) === null || _b === void 0 ? void 0 : _b.email,
            targetUserId,
            targetUserEmail,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            resource,
            action,
            details: details || {},
            outcome,
            tags: tags || []
        });
        res.status(201).json(auditEvent);
    }
    catch (error) {
        console.error('Error logging audit event:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Get current user's audit trail
router.get('/my-activity', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(400).json({ error: 'Usuário não encontrado' });
        }
        const limit = parseInt(req.query.limit) || 50;
        const userActivity = yield SecurityAuditService_1.default.queryAuditEvents({
            userIds: [req.user.id],
            limit
        });
        // Filter out sensitive information for regular users
        const filteredActivity = userActivity.map(event => ({
            id: event.id,
            eventType: event.eventType,
            category: event.category,
            action: event.action,
            outcome: event.outcome,
            timestamp: event.metadata.timestamp,
            ipAddress: event.ipAddress,
            userAgent: event.userAgent,
            // Don't include full details for security reasons
            summary: event.details.summary || `${event.action} - ${event.outcome}`
        }));
        res.json(filteredActivity);
    }
    catch (error) {
        console.error('Error getting user activity:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Get audit event by ID (admin only)
router.get('/events/:eventId', auth_1.authenticate, auth_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId } = req.params;
        const events = yield SecurityAuditService_1.default.queryAuditEvents({
            searchText: eventId,
            limit: 1
        });
        const event = events.find(e => e.id === eventId);
        if (!event) {
            return res.status(404).json({ error: 'Evento de auditoria não encontrado' });
        }
        res.json(event);
    }
    catch (error) {
        console.error('Error getting audit event:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Export audit data (admin only)
router.get('/export', auth_1.authenticate, auth_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { format = 'json', dateFrom, dateTo, eventTypes, severities } = req.query;
        const query = {
            limit: 10000 // Large limit for export
        };
        if (dateFrom)
            query.dateFrom = new Date(dateFrom);
        if (dateTo)
            query.dateTo = new Date(dateTo);
        if (eventTypes) {
            query.eventTypes = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
        }
        if (severities) {
            query.severities = Array.isArray(severities) ? severities : [severities];
        }
        const events = yield SecurityAuditService_1.default.queryAuditEvents(query);
        if (format === 'csv') {
            // Convert to CSV format
            const csvHeader = 'ID,Event Type,Category,Severity,User Email,Action,Outcome,Timestamp,IP Address,Risk Score\n';
            const csvRows = events.map(event => `"${event.id}","${event.eventType}","${event.category}","${event.severity}","${event.userEmail || ''}","${event.action}","${event.outcome}","${event.metadata.timestamp.toISOString()}","${event.ipAddress || ''}","${event.riskScore}"`).join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="audit-export-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csvHeader + csvRows);
        }
        else {
            // JSON format
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="audit-export-${new Date().toISOString().split('T')[0]}.json"`);
            res.json({
                exportDate: new Date().toISOString(),
                totalEvents: events.length,
                events
            });
        }
    }
    catch (error) {
        console.error('Error exporting audit data:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Get audit statistics for dashboard
router.get('/stats', auth_1.authenticate, auth_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hours = parseInt(req.query.hours) || 24;
        const dateFrom = new Date(Date.now() - hours * 60 * 60 * 1000);
        const [summary, suspiciousActivity] = yield Promise.all([
            SecurityAuditService_1.default.getAuditSummary(dateFrom),
            SecurityAuditService_1.default.detectSuspiciousActivity()
        ]);
        const stats = {
            totalEvents: summary.totalEvents,
            highRiskEvents: Object.values(summary.eventsBySeverity).reduce((acc, count, index) => {
                const severities = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
                return acc + (index >= 3 ? count : 0); // HIGH and CRITICAL
            }, 0),
            suspiciousActivities: suspiciousActivity.length,
            topEventTypes: Object.entries(summary.eventsByType)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([type, count]) => ({ type, count })),
            recentHighRiskEvents: yield SecurityAuditService_1.default.queryAuditEvents({
                severities: ['HIGH', 'CRITICAL'],
                dateFrom,
                limit: 10
            })
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Error getting audit stats:', error);
        res.status(500).json({ error: 'Erro internal do servidor' });
    }
}));
exports.default = router;

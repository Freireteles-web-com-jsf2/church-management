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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityAuditService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class SecurityAuditService {
    // Log a security audit event
    static logAuditEvent(eventData) {
        return __awaiter(this, void 0, void 0, function* () {
            const auditEvent = Object.assign(Object.assign({ id: this.generateEventId() }, eventData), { metadata: {
                    timestamp: new Date(),
                    source: 'church-management-system',
                    version: '1.0.0',
                    environment: process.env.NODE_ENV || 'development'
                }, riskScore: this.calculateRiskScore(eventData) });
            // Store in memory (in production, use database)
            if (!global.auditEvents) {
                global.auditEvents = [];
            }
            global.auditEvents.push(auditEvent);
            // Keep only the most recent events in memory
            if (global.auditEvents.length > this.MAX_EVENTS_IN_MEMORY) {
                global.auditEvents = global.auditEvents
                    .sort((a, b) => b.metadata.timestamp.getTime() - a.metadata.timestamp.getTime())
                    .slice(0, this.MAX_EVENTS_IN_MEMORY);
            }
            // Log to console for development
            console.log(`[AUDIT] ${auditEvent.severity} - ${auditEvent.eventType}: ${auditEvent.action}`, {
                user: auditEvent.userEmail,
                ip: auditEvent.ipAddress,
                outcome: auditEvent.outcome,
                riskScore: auditEvent.riskScore
            });
            // Trigger real-time alerts for high-risk events
            if (auditEvent.riskScore >= 70) {
                yield this.triggerSecurityAlert(auditEvent);
            }
            return auditEvent;
        });
    }
    // Generate unique event ID
    static generateEventId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `audit_${timestamp}_${random}`;
    }
    // Calculate risk score based on event characteristics
    static calculateRiskScore(eventData) {
        let score = 0;
        // Base score by event type
        const eventTypeScores = {
            'AUTHENTICATION': 20,
            'AUTHORIZATION': 30,
            'USER_MANAGEMENT': 40,
            'SESSION_MANAGEMENT': 25,
            'PASSWORD_MANAGEMENT': 35,
            'SECURITY_VIOLATION': 80,
            'SYSTEM_ACCESS': 50,
            'DATA_ACCESS': 45,
            'CONFIGURATION_CHANGE': 60,
            'ADMIN_ACTION': 55
        };
        score += eventTypeScores[eventData.eventType] || 20;
        // Severity multiplier
        const severityMultipliers = {
            'INFO': 0.5,
            'LOW': 1.0,
            'MEDIUM': 1.5,
            'HIGH': 2.0,
            'CRITICAL': 3.0
        };
        score *= severityMultipliers[eventData.severity];
        // Outcome modifier
        if (eventData.outcome === 'FAILURE') {
            score *= 1.5;
        }
        else if (eventData.outcome === 'PARTIAL') {
            score *= 1.2;
        }
        // Special conditions
        if (eventData.details.multipleFailedAttempts) {
            score += 20;
        }
        if (eventData.details.privilegeEscalation) {
            score += 30;
        }
        if (eventData.details.outsideBusinessHours) {
            score += 15;
        }
        if (eventData.details.unusualLocation) {
            score += 25;
        }
        // Ensure score is within bounds
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    // Trigger security alert for high-risk events
    static triggerSecurityAlert(event) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn(`[SECURITY ALERT] High-risk event detected:`, {
                eventId: event.id,
                type: event.eventType,
                action: event.action,
                user: event.userEmail,
                riskScore: event.riskScore,
                timestamp: event.metadata.timestamp
            });
            // In production, this would send notifications to security team
            // For now, we'll just log the alert
        });
    }
    // Query audit events
    static queryAuditEvents() {
        return __awaiter(this, arguments, void 0, function* (query = {}) {
            if (!global.auditEvents) {
                return [];
            }
            let events = [...global.auditEvents];
            // Apply filters
            if (query.eventTypes && query.eventTypes.length > 0) {
                events = events.filter(event => query.eventTypes.includes(event.eventType));
            }
            if (query.categories && query.categories.length > 0) {
                events = events.filter(event => query.categories.includes(event.category));
            }
            if (query.severities && query.severities.length > 0) {
                events = events.filter(event => query.severities.includes(event.severity));
            }
            if (query.userIds && query.userIds.length > 0) {
                events = events.filter(event => event.userId && query.userIds.includes(event.userId));
            }
            if (query.userEmails && query.userEmails.length > 0) {
                events = events.filter(event => event.userEmail && query.userEmails.includes(event.userEmail));
            }
            if (query.ipAddresses && query.ipAddresses.length > 0) {
                events = events.filter(event => event.ipAddress && query.ipAddresses.includes(event.ipAddress));
            }
            if (query.dateFrom) {
                events = events.filter(event => event.metadata.timestamp >= query.dateFrom);
            }
            if (query.dateTo) {
                events = events.filter(event => event.metadata.timestamp <= query.dateTo);
            }
            if (query.outcomes && query.outcomes.length > 0) {
                events = events.filter(event => query.outcomes.includes(event.outcome));
            }
            if (query.riskScoreMin !== undefined) {
                events = events.filter(event => event.riskScore >= query.riskScoreMin);
            }
            if (query.riskScoreMax !== undefined) {
                events = events.filter(event => event.riskScore <= query.riskScoreMax);
            }
            if (query.tags && query.tags.length > 0) {
                events = events.filter(event => query.tags.some(tag => event.tags.includes(tag)));
            }
            if (query.searchText) {
                const searchLower = query.searchText.toLowerCase();
                events = events.filter(event => {
                    var _a, _b;
                    return event.action.toLowerCase().includes(searchLower) ||
                        ((_a = event.userEmail) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchLower)) ||
                        ((_b = event.resource) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchLower)) ||
                        JSON.stringify(event.details).toLowerCase().includes(searchLower);
                });
            }
            // Sort by timestamp (newest first)
            events.sort((a, b) => b.metadata.timestamp.getTime() - a.metadata.timestamp.getTime());
            // Apply pagination
            const offset = query.offset || 0;
            const limit = query.limit || 100;
            return events.slice(offset, offset + limit);
        });
    }
    // Get audit summary statistics
    static getAuditSummary(dateFrom, dateTo) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = yield this.queryAuditEvents({ dateFrom, dateTo, limit: 10000 });
            const summary = {
                totalEvents: events.length,
                eventsByType: {},
                eventsByCategory: {},
                eventsBySeverity: {},
                eventsByOutcome: {},
                topUsers: [],
                topIPs: [],
                riskScoreDistribution: [],
                timeRange: {
                    start: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    end: dateTo || new Date()
                }
            };
            // Count events by type
            events.forEach(event => {
                summary.eventsByType[event.eventType] = (summary.eventsByType[event.eventType] || 0) + 1;
                summary.eventsByCategory[event.category] = (summary.eventsByCategory[event.category] || 0) + 1;
                summary.eventsBySeverity[event.severity] = (summary.eventsBySeverity[event.severity] || 0) + 1;
                summary.eventsByOutcome[event.outcome] = (summary.eventsByOutcome[event.outcome] || 0) + 1;
            });
            // Top users
            const userCounts = {};
            events.forEach(event => {
                if (event.userId && event.userEmail) {
                    const key = event.userId;
                    if (!userCounts[key]) {
                        userCounts[key] = { userId: event.userId, userEmail: event.userEmail, count: 0 };
                    }
                    userCounts[key].count++;
                }
            });
            summary.topUsers = Object.values(userCounts)
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
                .map(user => ({ userId: user.userId, userEmail: user.userEmail, eventCount: user.count }));
            // Top IPs
            const ipCounts = {};
            events.forEach(event => {
                if (event.ipAddress) {
                    ipCounts[event.ipAddress] = (ipCounts[event.ipAddress] || 0) + 1;
                }
            });
            summary.topIPs = Object.entries(ipCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([ipAddress, eventCount]) => ({ ipAddress, eventCount }));
            // Risk score distribution
            const riskRanges = [
                { range: '0-20', min: 0, max: 20 },
                { range: '21-40', min: 21, max: 40 },
                { range: '41-60', min: 41, max: 60 },
                { range: '61-80', min: 61, max: 80 },
                { range: '81-100', min: 81, max: 100 }
            ];
            summary.riskScoreDistribution = riskRanges.map(range => ({
                range: range.range,
                count: events.filter(event => event.riskScore >= range.min && event.riskScore <= range.max).length
            }));
            return summary;
        });
    }
    // Detect suspicious activity patterns
    static detectSuspiciousActivity() {
        return __awaiter(this, void 0, void 0, function* () {
            const events = yield this.queryAuditEvents({ limit: 5000 });
            const suspiciousActivities = [];
            // Pattern 1: Multiple failed login attempts
            const failedLogins = events.filter(event => event.eventType === 'AUTHENTICATION' &&
                event.outcome === 'FAILURE' &&
                event.metadata.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
            );
            const loginsByUser = {};
            failedLogins.forEach(event => {
                if (event.userEmail) {
                    if (!loginsByUser[event.userEmail]) {
                        loginsByUser[event.userEmail] = [];
                    }
                    loginsByUser[event.userEmail].push(event);
                }
            });
            Object.entries(loginsByUser).forEach(([userEmail, userEvents]) => {
                if (userEvents.length >= 5) {
                    suspiciousActivities.push({
                        id: this.generateEventId(),
                        type: 'BRUTE_FORCE',
                        description: `${userEvents.length} tentativas de login falhadas para ${userEmail} na última hora`,
                        riskScore: Math.min(100, userEvents.length * 10),
                        events: userEvents,
                        affectedUsers: [userEmail],
                        detectedAt: new Date(),
                        status: 'ACTIVE'
                    });
                }
            });
            // Pattern 2: Privilege escalation attempts
            const privilegeEvents = events.filter(event => event.eventType === 'AUTHORIZATION' &&
                event.details.privilegeEscalation &&
                event.metadata.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            );
            if (privilegeEvents.length > 0) {
                const affectedUsers = [...new Set(privilegeEvents.map(e => e.userEmail).filter(Boolean))];
                suspiciousActivities.push({
                    id: this.generateEventId(),
                    type: 'PRIVILEGE_ESCALATION',
                    description: `${privilegeEvents.length} tentativas de escalação de privilégios detectadas`,
                    riskScore: Math.min(100, privilegeEvents.length * 20),
                    events: privilegeEvents,
                    affectedUsers: affectedUsers,
                    detectedAt: new Date(),
                    status: 'ACTIVE'
                });
            }
            // Pattern 3: Unusual login patterns
            const recentLogins = events.filter(event => event.eventType === 'AUTHENTICATION' &&
                event.outcome === 'SUCCESS' &&
                event.metadata.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000));
            const loginsByUserAndIP = {};
            recentLogins.forEach(event => {
                if (event.userEmail && event.ipAddress) {
                    if (!loginsByUserAndIP[event.userEmail]) {
                        loginsByUserAndIP[event.userEmail] = new Set();
                    }
                    loginsByUserAndIP[event.userEmail].add(event.ipAddress);
                }
            });
            Object.entries(loginsByUserAndIP).forEach(([userEmail, ips]) => {
                if (ips.size >= 3) {
                    const userEvents = recentLogins.filter(e => e.userEmail === userEmail);
                    suspiciousActivities.push({
                        id: this.generateEventId(),
                        type: 'UNUSUAL_LOGIN_PATTERN',
                        description: `Usuário ${userEmail} fez login de ${ips.size} IPs diferentes nas últimas 24 horas`,
                        riskScore: Math.min(100, ips.size * 15),
                        events: userEvents,
                        affectedUsers: [userEmail],
                        detectedAt: new Date(),
                        status: 'ACTIVE'
                    });
                }
            });
            return suspiciousActivities.sort((a, b) => b.riskScore - a.riskScore);
        });
    }
    // Get login history with detailed audit information
    static getDetailedLoginHistory(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 50) {
            return this.queryAuditEvents({
                eventTypes: ['AUTHENTICATION'],
                userIds: [userId],
                limit
            });
        });
    }
    // Log authentication events
    static logAuthenticationEvent(action_1, outcome_1, userEmail_1, userId_1, ipAddress_1, userAgent_1) {
        return __awaiter(this, arguments, void 0, function* (action, outcome, userEmail, userId, ipAddress, userAgent, details = {}) {
            return this.logAuditEvent({
                eventType: 'AUTHENTICATION',
                category: 'SECURITY',
                severity: outcome === 'FAILURE' ? 'MEDIUM' : 'INFO',
                userId,
                userEmail,
                ipAddress,
                userAgent,
                action,
                details: Object.assign(Object.assign({}, details), { loginMethod: 'local', timestamp: new Date() }),
                outcome,
                tags: ['authentication', 'login']
            });
        });
    }
    // Log user management events
    static logUserManagementEvent(action_1, outcome_1, adminUserId_1, adminUserEmail_1, targetUserId_1, targetUserEmail_1, ipAddress_1) {
        return __awaiter(this, arguments, void 0, function* (action, outcome, adminUserId, adminUserEmail, targetUserId, targetUserEmail, ipAddress, details = {}) {
            return this.logAuditEvent({
                eventType: 'USER_MANAGEMENT',
                category: 'ADMIN',
                severity: 'MEDIUM',
                userId: adminUserId,
                userEmail: adminUserEmail,
                targetUserId,
                targetUserEmail,
                ipAddress,
                action,
                details: Object.assign(Object.assign({}, details), { timestamp: new Date() }),
                outcome,
                tags: ['user-management', 'admin']
            });
        });
    }
    // Log password management events
    static logPasswordEvent(action_1, outcome_1, userId_1, userEmail_1, ipAddress_1) {
        return __awaiter(this, arguments, void 0, function* (action, outcome, userId, userEmail, ipAddress, details = {}) {
            return this.logAuditEvent({
                eventType: 'PASSWORD_MANAGEMENT',
                category: 'SECURITY',
                severity: 'MEDIUM',
                userId,
                userEmail,
                ipAddress,
                action,
                details: Object.assign(Object.assign({}, details), { timestamp: new Date() }),
                outcome,
                tags: ['password', 'security']
            });
        });
    }
    // Log session management events
    static logSessionEvent(action_1, outcome_1, userId_1, userEmail_1, sessionId_1, ipAddress_1) {
        return __awaiter(this, arguments, void 0, function* (action, outcome, userId, userEmail, sessionId, ipAddress, details = {}) {
            return this.logAuditEvent({
                eventType: 'SESSION_MANAGEMENT',
                category: 'SECURITY',
                severity: 'LOW',
                userId,
                userEmail,
                sessionId,
                ipAddress,
                action,
                details: Object.assign(Object.assign({}, details), { timestamp: new Date() }),
                outcome,
                tags: ['session', 'security']
            });
        });
    }
    // Log security violations
    static logSecurityViolation(action_1, userId_1, userEmail_1, ipAddress_1) {
        return __awaiter(this, arguments, void 0, function* (action, userId, userEmail, ipAddress, details = {}) {
            return this.logAuditEvent({
                eventType: 'SECURITY_VIOLATION',
                category: 'SECURITY',
                severity: 'HIGH',
                userId,
                userEmail,
                ipAddress,
                action,
                details: Object.assign(Object.assign({}, details), { timestamp: new Date() }),
                outcome: 'FAILURE',
                tags: ['security-violation', 'alert']
            });
        });
    }
    // Cleanup old audit events
    static cleanupOldEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!global.auditEvents) {
                return;
            }
            const cutoffDate = new Date(Date.now() - this.CLEANUP_INTERVAL_DAYS * 24 * 60 * 60 * 1000);
            const beforeCount = global.auditEvents.length;
            global.auditEvents = global.auditEvents.filter(event => event.metadata.timestamp > cutoffDate);
            const afterCount = global.auditEvents.length;
            const removedCount = beforeCount - afterCount;
            if (removedCount > 0) {
                console.log(`[AUDIT CLEANUP] Removed ${removedCount} old audit events`);
            }
        });
    }
}
exports.SecurityAuditService = SecurityAuditService;
SecurityAuditService.MAX_EVENTS_IN_MEMORY = 10000;
SecurityAuditService.CLEANUP_INTERVAL_DAYS = 90;
// Initialize cleanup interval
setInterval(() => {
    SecurityAuditService.cleanupOldEvents();
}, 24 * 60 * 60 * 1000); // Clean every 24 hours
exports.default = SecurityAuditService;

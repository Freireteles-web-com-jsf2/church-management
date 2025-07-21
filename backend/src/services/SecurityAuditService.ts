import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditEvent {
  id: string;
  eventType: AuditEventType;
  category: AuditCategory;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  targetUserId?: string;
  targetUserEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  resource?: string;
  action: string;
  details: Record<string, any>;
  metadata: {
    timestamp: Date;
    source: string;
    version: string;
    environment: string;
  };
  outcome: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  riskScore: number;
  tags: string[];
}

export type AuditEventType = 
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'USER_MANAGEMENT'
  | 'SESSION_MANAGEMENT'
  | 'PASSWORD_MANAGEMENT'
  | 'SECURITY_VIOLATION'
  | 'SYSTEM_ACCESS'
  | 'DATA_ACCESS'
  | 'CONFIGURATION_CHANGE'
  | 'ADMIN_ACTION';

export type AuditCategory = 
  | 'SECURITY'
  | 'ACCESS'
  | 'ADMIN'
  | 'USER'
  | 'SYSTEM'
  | 'DATA';

export type AuditSeverity = 
  | 'INFO'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export interface AuditQuery {
  eventTypes?: AuditEventType[];
  categories?: AuditCategory[];
  severities?: AuditSeverity[];
  userIds?: string[];
  userEmails?: string[];
  ipAddresses?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  outcomes?: ('SUCCESS' | 'FAILURE' | 'PARTIAL')[];
  riskScoreMin?: number;
  riskScoreMax?: number;
  tags?: string[];
  searchText?: string;
  limit?: number;
  offset?: number;
}

export interface AuditSummary {
  totalEvents: number;
  eventsByType: Record<AuditEventType, number>;
  eventsByCategory: Record<AuditCategory, number>;
  eventsBySeverity: Record<AuditSeverity, number>;
  eventsByOutcome: Record<string, number>;
  topUsers: { userId: string; userEmail: string; eventCount: number }[];
  topIPs: { ipAddress: string; eventCount: number }[];
  riskScoreDistribution: { range: string; count: number }[];
  timeRange: { start: Date; end: Date };
}

export interface SuspiciousActivity {
  id: string;
  type: 'UNUSUAL_LOGIN_PATTERN' | 'PRIVILEGE_ESCALATION' | 'DATA_EXFILTRATION' | 'BRUTE_FORCE' | 'ACCOUNT_TAKEOVER';
  description: string;
  riskScore: number;
  events: AuditEvent[];
  affectedUsers: string[];
  detectedAt: Date;
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
  assignedTo?: string;
  notes?: string;
}

export class SecurityAuditService {
  private static readonly MAX_EVENTS_IN_MEMORY = 10000;
  private static readonly CLEANUP_INTERVAL_DAYS = 90;

  // Log a security audit event
  static async logAuditEvent(eventData: Omit<AuditEvent, 'id' | 'metadata' | 'riskScore'>): Promise<AuditEvent> {
    const auditEvent: AuditEvent = {
      id: this.generateEventId(),
      ...eventData,
      metadata: {
        timestamp: new Date(),
        source: 'church-management-system',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      },
      riskScore: this.calculateRiskScore(eventData)
    };

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
      await this.triggerSecurityAlert(auditEvent);
    }

    return auditEvent;
  }

  // Generate unique event ID
  private static generateEventId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `audit_${timestamp}_${random}`;
  }

  // Calculate risk score based on event characteristics
  private static calculateRiskScore(eventData: Omit<AuditEvent, 'id' | 'metadata' | 'riskScore'>): number {
    let score = 0;

    // Base score by event type
    const eventTypeScores: Record<AuditEventType, number> = {
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
    const severityMultipliers: Record<AuditSeverity, number> = {
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
    } else if (eventData.outcome === 'PARTIAL') {
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
  private static async triggerSecurityAlert(event: AuditEvent): Promise<void> {
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
  }

  // Query audit events
  static async queryAuditEvents(query: AuditQuery = {}): Promise<AuditEvent[]> {
    if (!global.auditEvents) {
      return [];
    }

    let events = [...global.auditEvents];

    // Apply filters
    if (query.eventTypes && query.eventTypes.length > 0) {
      events = events.filter(event => query.eventTypes!.includes(event.eventType));
    }

    if (query.categories && query.categories.length > 0) {
      events = events.filter(event => query.categories!.includes(event.category));
    }

    if (query.severities && query.severities.length > 0) {
      events = events.filter(event => query.severities!.includes(event.severity));
    }

    if (query.userIds && query.userIds.length > 0) {
      events = events.filter(event => event.userId && query.userIds!.includes(event.userId));
    }

    if (query.userEmails && query.userEmails.length > 0) {
      events = events.filter(event => event.userEmail && query.userEmails!.includes(event.userEmail));
    }

    if (query.ipAddresses && query.ipAddresses.length > 0) {
      events = events.filter(event => event.ipAddress && query.ipAddresses!.includes(event.ipAddress));
    }

    if (query.dateFrom) {
      events = events.filter(event => event.metadata.timestamp >= query.dateFrom!);
    }

    if (query.dateTo) {
      events = events.filter(event => event.metadata.timestamp <= query.dateTo!);
    }

    if (query.outcomes && query.outcomes.length > 0) {
      events = events.filter(event => query.outcomes!.includes(event.outcome));
    }

    if (query.riskScoreMin !== undefined) {
      events = events.filter(event => event.riskScore >= query.riskScoreMin!);
    }

    if (query.riskScoreMax !== undefined) {
      events = events.filter(event => event.riskScore <= query.riskScoreMax!);
    }

    if (query.tags && query.tags.length > 0) {
      events = events.filter(event => 
        query.tags!.some(tag => event.tags.includes(tag))
      );
    }

    if (query.searchText) {
      const searchLower = query.searchText.toLowerCase();
      events = events.filter(event => 
        event.action.toLowerCase().includes(searchLower) ||
        event.userEmail?.toLowerCase().includes(searchLower) ||
        event.resource?.toLowerCase().includes(searchLower) ||
        JSON.stringify(event.details).toLowerCase().includes(searchLower)
      );
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => b.metadata.timestamp.getTime() - a.metadata.timestamp.getTime());

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    
    return events.slice(offset, offset + limit);
  }

  // Get audit summary statistics
  static async getAuditSummary(dateFrom?: Date, dateTo?: Date): Promise<AuditSummary> {
    const events = await this.queryAuditEvents({ dateFrom, dateTo, limit: 10000 });

    const summary: AuditSummary = {
      totalEvents: events.length,
      eventsByType: {} as Record<AuditEventType, number>,
      eventsByCategory: {} as Record<AuditCategory, number>,
      eventsBySeverity: {} as Record<AuditSeverity, number>,
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
    const userCounts: Record<string, { userId: string; userEmail: string; count: number }> = {};
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
    const ipCounts: Record<string, number> = {};
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
  }

  // Detect suspicious activity patterns
  static async detectSuspiciousActivity(): Promise<SuspiciousActivity[]> {
    const events = await this.queryAuditEvents({ limit: 5000 });
    const suspiciousActivities: SuspiciousActivity[] = [];

    // Pattern 1: Multiple failed login attempts
    const failedLogins = events.filter(event => 
      event.eventType === 'AUTHENTICATION' && 
      event.outcome === 'FAILURE' &&
      event.metadata.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );

    const loginsByUser: Record<string, AuditEvent[]> = {};
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
    const privilegeEvents = events.filter(event => 
      event.eventType === 'AUTHORIZATION' && 
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
        affectedUsers: affectedUsers as string[],
        detectedAt: new Date(),
        status: 'ACTIVE'
      });
    }

    // Pattern 3: Unusual login patterns
    const recentLogins = events.filter(event => 
      event.eventType === 'AUTHENTICATION' && 
      event.outcome === 'SUCCESS' &&
      event.metadata.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const loginsByUserAndIP: Record<string, Set<string>> = {};
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
  }

  // Get login history with detailed audit information
  static async getDetailedLoginHistory(userId: string, limit: number = 50): Promise<AuditEvent[]> {
    return this.queryAuditEvents({
      eventTypes: ['AUTHENTICATION'],
      userIds: [userId],
      limit
    });
  }

  // Log authentication events
  static async logAuthenticationEvent(
    action: string,
    outcome: 'SUCCESS' | 'FAILURE',
    userEmail?: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    details: Record<string, any> = {}
  ): Promise<AuditEvent> {
    return this.logAuditEvent({
      eventType: 'AUTHENTICATION',
      category: 'SECURITY',
      severity: outcome === 'FAILURE' ? 'MEDIUM' : 'INFO',
      userId,
      userEmail,
      ipAddress,
      userAgent,
      action,
      details: {
        ...details,
        loginMethod: 'local',
        timestamp: new Date()
      },
      outcome,
      tags: ['authentication', 'login']
    });
  }

  // Log user management events
  static async logUserManagementEvent(
    action: string,
    outcome: 'SUCCESS' | 'FAILURE',
    adminUserId: string,
    adminUserEmail: string,
    targetUserId?: string,
    targetUserEmail?: string,
    ipAddress?: string,
    details: Record<string, any> = {}
  ): Promise<AuditEvent> {
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
      details: {
        ...details,
        timestamp: new Date()
      },
      outcome,
      tags: ['user-management', 'admin']
    });
  }

  // Log password management events
  static async logPasswordEvent(
    action: string,
    outcome: 'SUCCESS' | 'FAILURE',
    userId?: string,
    userEmail?: string,
    ipAddress?: string,
    details: Record<string, any> = {}
  ): Promise<AuditEvent> {
    return this.logAuditEvent({
      eventType: 'PASSWORD_MANAGEMENT',
      category: 'SECURITY',
      severity: 'MEDIUM',
      userId,
      userEmail,
      ipAddress,
      action,
      details: {
        ...details,
        timestamp: new Date()
      },
      outcome,
      tags: ['password', 'security']
    });
  }

  // Log session management events
  static async logSessionEvent(
    action: string,
    outcome: 'SUCCESS' | 'FAILURE',
    userId?: string,
    userEmail?: string,
    sessionId?: string,
    ipAddress?: string,
    details: Record<string, any> = {}
  ): Promise<AuditEvent> {
    return this.logAuditEvent({
      eventType: 'SESSION_MANAGEMENT',
      category: 'SECURITY',
      severity: 'LOW',
      userId,
      userEmail,
      sessionId,
      ipAddress,
      action,
      details: {
        ...details,
        timestamp: new Date()
      },
      outcome,
      tags: ['session', 'security']
    });
  }

  // Log security violations
  static async logSecurityViolation(
    action: string,
    userId?: string,
    userEmail?: string,
    ipAddress?: string,
    details: Record<string, any> = {}
  ): Promise<AuditEvent> {
    return this.logAuditEvent({
      eventType: 'SECURITY_VIOLATION',
      category: 'SECURITY',
      severity: 'HIGH',
      userId,
      userEmail,
      ipAddress,
      action,
      details: {
        ...details,
        timestamp: new Date()
      },
      outcome: 'FAILURE',
      tags: ['security-violation', 'alert']
    });
  }

  // Cleanup old audit events
  static async cleanupOldEvents(): Promise<void> {
    if (!global.auditEvents) {
      return;
    }

    const cutoffDate = new Date(Date.now() - this.CLEANUP_INTERVAL_DAYS * 24 * 60 * 60 * 1000);
    const beforeCount = global.auditEvents.length;

    global.auditEvents = global.auditEvents.filter(
      event => event.metadata.timestamp > cutoffDate
    );

    const afterCount = global.auditEvents.length;
    const removedCount = beforeCount - afterCount;

    if (removedCount > 0) {
      console.log(`[AUDIT CLEANUP] Removed ${removedCount} old audit events`);
    }
  }
}

// Declare global types for audit events
declare global {
  var auditEvents: AuditEvent[];
}

// Initialize cleanup interval
setInterval(() => {
  SecurityAuditService.cleanupOldEvents();
}, 24 * 60 * 60 * 1000); // Clean every 24 hours

export default SecurityAuditService;
import { PrismaClient } from '@prisma/client';
import { LoginAttempt } from './AuthService';

const prisma = new PrismaClient();

export interface SecurityEvent {
  id: string;
  type: 'LOGIN_ATTEMPT' | 'ACCOUNT_LOCKOUT' | 'SUSPICIOUS_ACTIVITY' | 'PASSWORD_RESET' | 'SESSION_HIJACK' | 'BRUTE_FORCE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface SecurityAlert {
  id: string;
  type: 'MULTIPLE_FAILED_LOGINS' | 'SUSPICIOUS_IP' | 'ACCOUNT_COMPROMISE' | 'UNUSUAL_ACTIVITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  affectedUsers: string[];
  ipAddresses: string[];
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface LoginAttemptStats {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  uniqueIPs: number;
  uniqueUsers: number;
  topFailureReasons: { reason: string; count: number }[];
  timeRange: { start: Date; end: Date };
}

export interface SuspiciousActivityPattern {
  type: 'RAPID_ATTEMPTS' | 'MULTIPLE_IPS' | 'UNUSUAL_HOURS' | 'GEOGRAPHIC_ANOMALY';
  description: string;
  riskScore: number;
  evidence: string[];
  affectedAccounts: string[];
  detectedAt: Date;
}

export class SecurityMonitoringService {
  private static readonly SUSPICIOUS_ATTEMPT_THRESHOLD = 10; // attempts per minute
  private static readonly MULTIPLE_IP_THRESHOLD = 3; // different IPs for same user
  private static readonly UNUSUAL_HOUR_START = 2; // 2 AM
  private static readonly UNUSUAL_HOUR_END = 6; // 6 AM

  // Enhanced login attempt tracking with detailed analysis
  static async analyzeLoginAttempts(timeRangeMinutes: number = 60): Promise<LoginAttemptStats> {
    if (!global.loginAttempts) {
      return {
        totalAttempts: 0,
        successfulAttempts: 0,
        failedAttempts: 0,
        uniqueIPs: 0,
        uniqueUsers: 0,
        topFailureReasons: [],
        timeRange: { start: new Date(), end: new Date() }
      };
    }

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (timeRangeMinutes * 60 * 1000));

    const relevantAttempts = global.loginAttempts.filter(
      attempt => attempt.timestamp >= startTime && attempt.timestamp <= endTime
    );

    const successfulAttempts = relevantAttempts.filter(attempt => attempt.success);
    const failedAttempts = relevantAttempts.filter(attempt => !attempt.success);

    const uniqueIPs = new Set(relevantAttempts.map(attempt => attempt.ipAddress).filter(Boolean)).size;
    const uniqueUsers = new Set(relevantAttempts.map(attempt => attempt.email)).size;

    // Count failure reasons
    const failureReasonCounts: Record<string, number> = {};
    failedAttempts.forEach(attempt => {
      if (attempt.failureReason) {
        failureReasonCounts[attempt.failureReason] = (failureReasonCounts[attempt.failureReason] || 0) + 1;
      }
    });

    const topFailureReasons = Object.entries(failureReasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalAttempts: relevantAttempts.length,
      successfulAttempts: successfulAttempts.length,
      failedAttempts: failedAttempts.length,
      uniqueIPs,
      uniqueUsers,
      topFailureReasons,
      timeRange: { start: startTime, end: endTime }
    };
  }

  // Detect suspicious activity patterns
  static async detectSuspiciousPatterns(): Promise<SuspiciousActivityPattern[]> {
    if (!global.loginAttempts) {
      return [];
    }

    const patterns: SuspiciousActivityPattern[] = [];
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const recentAttempts = global.loginAttempts.filter(
      attempt => attempt.timestamp >= oneHourAgo
    );

    // Pattern 1: Rapid login attempts from same IP
    const ipAttemptCounts: Record<string, LoginAttempt[]> = {};
    recentAttempts.forEach(attempt => {
      if (attempt.ipAddress) {
        if (!ipAttemptCounts[attempt.ipAddress]) {
          ipAttemptCounts[attempt.ipAddress] = [];
        }
        ipAttemptCounts[attempt.ipAddress].push(attempt);
      }
    });

    Object.entries(ipAttemptCounts).forEach(([ip, attempts]) => {
      const failedAttempts = attempts.filter(a => !a.success);
      if (failedAttempts.length >= this.SUSPICIOUS_ATTEMPT_THRESHOLD) {
        const affectedAccounts = [...new Set(failedAttempts.map(a => a.email))];
        patterns.push({
          type: 'RAPID_ATTEMPTS',
          description: `${failedAttempts.length} tentativas de login falhadas do IP ${ip} na última hora`,
          riskScore: Math.min(100, failedAttempts.length * 5),
          evidence: [
            `IP: ${ip}`,
            `Tentativas falhadas: ${failedAttempts.length}`,
            `Contas afetadas: ${affectedAccounts.length}`,
            `Período: ${failedAttempts[0].timestamp.toLocaleString()} - ${failedAttempts[failedAttempts.length - 1].timestamp.toLocaleString()}`
          ],
          affectedAccounts,
          detectedAt: now
        });
      }
    });

    // Pattern 2: Same user from multiple IPs
    const userIpCounts: Record<string, Set<string>> = {};
    recentAttempts.forEach(attempt => {
      if (attempt.ipAddress) {
        if (!userIpCounts[attempt.email]) {
          userIpCounts[attempt.email] = new Set();
        }
        userIpCounts[attempt.email].add(attempt.ipAddress);
      }
    });

    Object.entries(userIpCounts).forEach(([email, ips]) => {
      if (ips.size >= this.MULTIPLE_IP_THRESHOLD) {
        patterns.push({
          type: 'MULTIPLE_IPS',
          description: `Usuário ${email} tentou fazer login de ${ips.size} IPs diferentes`,
          riskScore: ips.size * 15,
          evidence: [
            `Usuário: ${email}`,
            `IPs diferentes: ${ips.size}`,
            `IPs: ${Array.from(ips).join(', ')}`
          ],
          affectedAccounts: [email],
          detectedAt: now
        });
      }
    });

    // Pattern 3: Login attempts during unusual hours
    const unusualHourAttempts = recentAttempts.filter(attempt => {
      const hour = attempt.timestamp.getHours();
      return hour >= this.UNUSUAL_HOUR_START && hour <= this.UNUSUAL_HOUR_END;
    });

    if (unusualHourAttempts.length > 0) {
      const affectedAccounts = [...new Set(unusualHourAttempts.map(a => a.email))];
      const affectedIPs = [...new Set(unusualHourAttempts.map(a => a.ipAddress).filter(Boolean))];
      
      patterns.push({
        type: 'UNUSUAL_HOURS',
        description: `${unusualHourAttempts.length} tentativas de login durante horário incomum (${this.UNUSUAL_HOUR_START}h-${this.UNUSUAL_HOUR_END}h)`,
        riskScore: unusualHourAttempts.length * 3,
        evidence: [
          `Tentativas: ${unusualHourAttempts.length}`,
          `Contas afetadas: ${affectedAccounts.length}`,
          `IPs envolvidos: ${affectedIPs.length}`,
          `Horário: ${this.UNUSUAL_HOUR_START}h-${this.UNUSUAL_HOUR_END}h`
        ],
        affectedAccounts,
        detectedAt: now
      });
    }

    return patterns.sort((a, b) => b.riskScore - a.riskScore);
  }

  // Generate security alerts based on patterns
  static async generateSecurityAlerts(): Promise<SecurityAlert[]> {
    const patterns = await this.detectSuspiciousPatterns();
    const alerts: SecurityAlert[] = [];

    patterns.forEach(pattern => {
      let alertType: SecurityAlert['type'];
      let severity: SecurityAlert['severity'];

      switch (pattern.type) {
        case 'RAPID_ATTEMPTS':
          alertType = 'MULTIPLE_FAILED_LOGINS';
          severity = pattern.riskScore > 50 ? 'HIGH' : 'MEDIUM';
          break;
        case 'MULTIPLE_IPS':
          alertType = 'SUSPICIOUS_IP';
          severity = pattern.riskScore > 45 ? 'HIGH' : 'MEDIUM';
          break;
        case 'UNUSUAL_HOURS':
          alertType = 'UNUSUAL_ACTIVITY';
          severity = pattern.riskScore > 30 ? 'MEDIUM' : 'LOW';
          break;
        default:
          alertType = 'UNUSUAL_ACTIVITY';
          severity = 'LOW';
      }

      alerts.push({
        id: Math.random().toString(36).substring(2, 15),
        type: alertType,
        severity,
        message: pattern.description,
        affectedUsers: pattern.affectedAccounts,
        ipAddresses: pattern.evidence.filter(e => e.startsWith('IP:')).map(e => e.substring(4)),
        timestamp: pattern.detectedAt,
        acknowledged: false
      });
    });

    return alerts;
  }

  // Log security events
  static async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): Promise<SecurityEvent> {
    const securityEvent: SecurityEvent = {
      id: Math.random().toString(36).substring(2, 15),
      timestamp: new Date(),
      resolved: false,
      ...event
    };

    // In production, this would be stored in a database
    // For now, we'll log to console and store in memory
    console.log(`[SECURITY EVENT] ${securityEvent.severity} - ${securityEvent.type}:`, securityEvent.details);

    // Store in global memory (in production, use database)
    if (!global.securityEvents) {
      global.securityEvents = [];
    }
    global.securityEvents.push(securityEvent);

    return securityEvent;
  }

  // Get account lockout status with detailed information
  static async getAccountLockoutInfo(email: string): Promise<{
    isLocked: boolean;
    lockoutReason?: string;
    failedAttempts: number;
    lockoutExpiresAt?: Date;
    lastAttemptAt?: Date;
    canRetryAt?: Date;
  }> {
    if (!global.loginAttempts) {
      return { isLocked: false, failedAttempts: 0 };
    }

    const now = new Date();
    const lockoutTime = new Date(now.getTime() - 15 * 60 * 1000); // 15 minutes

    const recentFailedAttempts = global.loginAttempts.filter(
      attempt => 
        attempt.email === email &&
        !attempt.success &&
        attempt.timestamp > lockoutTime
    );

    const isLocked = recentFailedAttempts.length >= 5;
    const lastAttempt = recentFailedAttempts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    let canRetryAt: Date | undefined;
    if (isLocked && lastAttempt) {
      canRetryAt = new Date(lastAttempt.timestamp.getTime() + 15 * 60 * 1000);
    }

    return {
      isLocked,
      lockoutReason: isLocked ? 'Muitas tentativas de login falhadas' : undefined,
      failedAttempts: recentFailedAttempts.length,
      lockoutExpiresAt: canRetryAt,
      lastAttemptAt: lastAttempt?.timestamp,
      canRetryAt
    };
  }

  // Get comprehensive security dashboard data
  static async getSecurityDashboard(): Promise<{
    stats: LoginAttemptStats;
    alerts: SecurityAlert[];
    patterns: SuspiciousActivityPattern[];
    recentEvents: SecurityEvent[];
    lockedAccounts: string[];
  }> {
    const stats = await this.analyzeLoginAttempts(60);
    const alerts = await this.generateSecurityAlerts();
    const patterns = await this.detectSuspiciousPatterns();
    
    // Get recent security events
    const recentEvents = global.securityEvents ? 
      global.securityEvents
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 20) : [];

    // Get currently locked accounts
    const lockedAccounts: string[] = [];
    if (global.loginAttempts) {
      const uniqueEmails = [...new Set(global.loginAttempts.map(a => a.email))];
      for (const email of uniqueEmails) {
        const lockoutInfo = await this.getAccountLockoutInfo(email);
        if (lockoutInfo.isLocked) {
          lockedAccounts.push(email);
        }
      }
    }

    return {
      stats,
      alerts,
      patterns,
      recentEvents,
      lockedAccounts
    };
  }

  // Clear old login attempts and events (cleanup)
  static async cleanupOldData(): Promise<void> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Clean old login attempts
    if (global.loginAttempts) {
      global.loginAttempts = global.loginAttempts.filter(
        attempt => attempt.timestamp > oneWeekAgo
      );
    }

    // Clean old security events
    if (global.securityEvents) {
      global.securityEvents = global.securityEvents.filter(
        event => event.timestamp > oneWeekAgo
      );
    }
  }
}

// Declare global types for security events
declare global {
  var securityEvents: SecurityEvent[];
}

// Initialize cleanup interval
setInterval(() => {
  SecurityMonitoringService.cleanupOldData();
}, 24 * 60 * 60 * 1000); // Clean every 24 hours

export default SecurityMonitoringService;
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export interface LoginAttemptStats {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  uniqueIPs: number;
  uniqueUsers: number;
  topFailureReasons: { reason: string; count: number }[];
  timeRange: { start: Date; end: Date };
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

export interface SuspiciousActivityPattern {
  type: 'RAPID_ATTEMPTS' | 'MULTIPLE_IPS' | 'UNUSUAL_HOURS' | 'GEOGRAPHIC_ANOMALY';
  description: string;
  riskScore: number;
  evidence: string[];
  affectedAccounts: string[];
  detectedAt: Date;
}

export interface LoginAttempt {
  id: string;
  email: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  failureReason?: string;
}

export interface AccountLockoutInfo {
  isLocked: boolean;
  lockoutReason?: string;
  failedAttempts: number;
  lockoutExpiresAt?: Date;
  lastAttemptAt?: Date;
  canRetryAt?: Date;
}

export interface SecurityDashboard {
  stats: LoginAttemptStats;
  alerts: SecurityAlert[];
  patterns: SuspiciousActivityPattern[];
  recentEvents: any[];
  lockedAccounts: string[];
}

export interface UserLoginAttempts {
  lockoutInfo: AccountLockoutInfo;
  recentAttempts: {
    success: boolean;
    timestamp: Date;
    ipAddress?: string;
    failureReason?: string;
  }[];
}

class SecurityService {
  private getAuthHeaders() {
    const token = localStorage.getItem('church_session');
    if (token) {
      try {
        const sessionData = JSON.parse(token);
        return {
          'Authorization': `Bearer ${sessionData.token}`,
          'Content-Type': 'application/json'
        };
      } catch {
        return { 'Content-Type': 'application/json' };
      }
    }
    return { 'Content-Type': 'application/json' };
  }

  // Get security dashboard data (admin only)
  async getSecurityDashboard(): Promise<SecurityDashboard> {
    try {
      const response = await axios.get(`${API_BASE_URL}/security/dashboard`, {
        headers: this.getAuthHeaders()
      });
      
      // Convert date strings to Date objects
      const data = response.data;
      data.stats.timeRange.start = new Date(data.stats.timeRange.start);
      data.stats.timeRange.end = new Date(data.stats.timeRange.end);
      
      data.alerts.forEach((alert: any) => {
        alert.timestamp = new Date(alert.timestamp);
        if (alert.acknowledgedAt) {
          alert.acknowledgedAt = new Date(alert.acknowledgedAt);
        }
      });
      
      data.patterns.forEach((pattern: any) => {
        pattern.detectedAt = new Date(pattern.detectedAt);
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching security dashboard:', error);
      throw new Error('Erro ao carregar dashboard de segurança');
    }
  }

  // Get login attempt statistics
  async getLoginStats(timeRangeMinutes: number = 60): Promise<LoginAttemptStats> {
    try {
      const response = await axios.get(`${API_BASE_URL}/security/login-stats`, {
        headers: this.getAuthHeaders(),
        params: { timeRange: timeRangeMinutes }
      });
      
      const data = response.data;
      data.timeRange.start = new Date(data.timeRange.start);
      data.timeRange.end = new Date(data.timeRange.end);
      
      return data;
    } catch (error) {
      console.error('Error fetching login stats:', error);
      throw new Error('Erro ao carregar estatísticas de login');
    }
  }

  // Get security alerts
  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/security/alerts`, {
        headers: this.getAuthHeaders()
      });
      
      return response.data.map((alert: any) => ({
        ...alert,
        timestamp: new Date(alert.timestamp),
        acknowledgedAt: alert.acknowledgedAt ? new Date(alert.acknowledgedAt) : undefined
      }));
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      throw new Error('Erro ao carregar alertas de segurança');
    }
  }

  // Get suspicious activity patterns
  async getSuspiciousPatterns(): Promise<SuspiciousActivityPattern[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/security/suspicious-patterns`, {
        headers: this.getAuthHeaders()
      });
      
      return response.data.map((pattern: any) => ({
        ...pattern,
        detectedAt: new Date(pattern.detectedAt)
      }));
    } catch (error) {
      console.error('Error fetching suspicious patterns:', error);
      throw new Error('Erro ao carregar padrões suspeitos');
    }
  }

  // Get account lockout information
  async getAccountLockoutInfo(email: string): Promise<AccountLockoutInfo> {
    try {
      const response = await axios.get(`${API_BASE_URL}/security/lockout-info/${encodeURIComponent(email)}`, {
        headers: this.getAuthHeaders()
      });
      
      const data = response.data;
      return {
        ...data,
        lockoutExpiresAt: data.lockoutExpiresAt ? new Date(data.lockoutExpiresAt) : undefined,
        lastAttemptAt: data.lastAttemptAt ? new Date(data.lastAttemptAt) : undefined,
        canRetryAt: data.canRetryAt ? new Date(data.canRetryAt) : undefined
      };
    } catch (error) {
      console.error('Error fetching lockout info:', error);
      throw new Error('Erro ao carregar informações de bloqueio');
    }
  }

  // Get login history for a user
  async getLoginHistory(userId: string, limit: number = 50): Promise<LoginAttempt[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/security/login-history/${userId}`, {
        headers: this.getAuthHeaders(),
        params: { limit }
      });
      
      return response.data.map((attempt: any) => ({
        ...attempt,
        timestamp: new Date(attempt.timestamp)
      }));
    } catch (error) {
      console.error('Error fetching login history:', error);
      throw new Error('Erro ao carregar histórico de login');
    }
  }

  // Get security events (admin only)
  async getSecurityEvents(limit: number = 100): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/security/events`, {
        headers: this.getAuthHeaders(),
        params: { limit }
      });
      
      return response.data.map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp)
      }));
    } catch (error) {
      console.error('Error fetching security events:', error);
      throw new Error('Erro ao carregar eventos de segurança');
    }
  }

  // Manually unlock an account (admin only)
  async unlockAccount(email: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/security/unlock-account`, 
        { email },
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      console.error('Error unlocking account:', error);
      throw new Error('Erro ao desbloquear conta');
    }
  }

  // Acknowledge security alert (admin only)
  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/security/alerts/${alertId}/acknowledge`, 
        {},
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw new Error('Erro ao reconhecer alerta');
    }
  }

  // Get current user's login attempts
  async getMyLoginAttempts(): Promise<UserLoginAttempts> {
    try {
      const response = await axios.get(`${API_BASE_URL}/security/my-login-attempts`, {
        headers: this.getAuthHeaders()
      });
      
      const data = response.data;
      return {
        lockoutInfo: {
          ...data.lockoutInfo,
          lockoutExpiresAt: data.lockoutInfo.lockoutExpiresAt ? new Date(data.lockoutInfo.lockoutExpiresAt) : undefined,
          lastAttemptAt: data.lockoutInfo.lastAttemptAt ? new Date(data.lockoutInfo.lastAttemptAt) : undefined,
          canRetryAt: data.lockoutInfo.canRetryAt ? new Date(data.lockoutInfo.canRetryAt) : undefined
        },
        recentAttempts: data.recentAttempts.map((attempt: any) => ({
          ...attempt,
          timestamp: new Date(attempt.timestamp)
        }))
      };
    } catch (error) {
      console.error('Error fetching user login attempts:', error);
      throw new Error('Erro ao carregar tentativas de login');
    }
  }

  // Format time remaining until account unlock
  formatTimeRemaining(canRetryAt: Date): string {
    const now = new Date();
    const diff = canRetryAt.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Agora';
    }
    
    const minutes = Math.ceil(diff / (1000 * 60));
    if (minutes < 60) {
      return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hora${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  }

  // Get severity color for UI
  getSeverityColor(severity: SecurityAlert['severity']): string {
    switch (severity) {
      case 'LOW':
        return '#2196f3'; // Blue
      case 'MEDIUM':
        return '#ff9800'; // Orange
      case 'HIGH':
        return '#f44336'; // Red
      case 'CRITICAL':
        return '#9c27b0'; // Purple
      default:
        return '#757575'; // Gray
    }
  }

  // Get risk score color for UI
  getRiskScoreColor(score: number): string {
    if (score < 30) return '#4caf50'; // Green
    if (score < 60) return '#ff9800'; // Orange
    if (score < 80) return '#f44336'; // Red
    return '#9c27b0'; // Purple
  }
}

export const securityService = new SecurityService();
export default securityService;
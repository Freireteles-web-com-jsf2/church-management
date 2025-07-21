import express from 'express';
import SecurityMonitoringService from '../services/SecurityMonitoringService';
import { AuthService } from '../services/AuthService';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Get security dashboard data (admin only)
router.get('/dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    const dashboardData = await SecurityMonitoringService.getSecurityDashboard();
    res.json(dashboardData);
  } catch (error) {
    console.error('Error getting security dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get login attempt statistics
router.get('/login-stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const timeRange = parseInt(req.query.timeRange as string) || 60; // minutes
    const stats = await SecurityMonitoringService.analyzeLoginAttempts(timeRange);
    res.json(stats);
  } catch (error) {
    console.error('Error getting login stats:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get security alerts
router.get('/alerts', authenticate, requireAdmin, async (req, res) => {
  try {
    const alerts = await SecurityMonitoringService.generateSecurityAlerts();
    res.json(alerts);
  } catch (error) {
    console.error('Error getting security alerts:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get suspicious activity patterns
router.get('/suspicious-patterns', authenticate, requireAdmin, async (req, res) => {
  try {
    const patterns = await SecurityMonitoringService.detectSuspiciousPatterns();
    res.json(patterns);
  } catch (error) {
    console.error('Error getting suspicious patterns:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get account lockout information
router.get('/lockout-info/:email', authenticate, requireAdmin, async (req, res) => {
  try {
    const { email } = req.params;
    const lockoutInfo = await SecurityMonitoringService.getAccountLockoutInfo(email);
    res.json(lockoutInfo);
  } catch (error) {
    console.error('Error getting lockout info:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get login history for a user
router.get('/login-history/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Users can only see their own history, admins can see any user's history
    if (req.user?.id !== userId && req.user?.funcao !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    const history = await AuthService.getLoginHistory(userId, limit);
    res.json(history);
  } catch (error) {
    console.error('Error getting login history:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get security events (admin only)
router.get('/events', authenticate, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const events = await AuthService.getSecurityEvents(limit);
    res.json(events);
  } catch (error) {
    console.error('Error getting security events:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Manually unlock an account (admin only)
router.post('/unlock-account', authenticate, requireAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }
    
    // Clear failed login attempts for this email
    if (global.loginAttempts) {
      global.loginAttempts = global.loginAttempts.filter(
        attempt => attempt.email !== email || attempt.success
      );
    }
    
    // Log security event
    await SecurityMonitoringService.logSecurityEvent({
      type: 'ACCOUNT_LOCKOUT',
      severity: 'MEDIUM',
      email,
      details: {
        action: 'MANUAL_UNLOCK',
        unlockedBy: req.user?.id,
        timestamp: new Date()
      }
    });
    
    res.json({ message: 'Conta desbloqueada com sucesso' });
  } catch (error) {
    console.error('Error unlocking account:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Acknowledge security alert (admin only)
router.post('/alerts/:alertId/acknowledge', authenticate, requireAdmin, async (req, res) => {
  try {
    const { alertId } = req.params;
    
    // In a real implementation, this would update the alert in the database
    // For now, we'll just log the acknowledgment
    await SecurityMonitoringService.logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      severity: 'LOW',
      details: {
        action: 'ALERT_ACKNOWLEDGED',
        alertId,
        acknowledgedBy: req.user?.id,
        timestamp: new Date()
      }
    });
    
    res.json({ message: 'Alerta reconhecido com sucesso' });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get current user's login attempts (for self-monitoring)
router.get('/my-login-attempts', authenticate, async (req, res) => {
  try {
    if (!req.user?.email) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }
    
    const lockoutInfo = await SecurityMonitoringService.getAccountLockoutInfo(req.user.email);
    
    // Get recent attempts for this user
    const recentAttempts = global.loginAttempts ? 
      global.loginAttempts
        .filter(attempt => attempt.email === req.user!.email)
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
  } catch (error) {
    console.error('Error getting user login attempts:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
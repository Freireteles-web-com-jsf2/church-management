import express from 'express';
import SecurityAuditService from '../services/SecurityAuditService';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Get audit events with filtering (admin only)
router.get('/events', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      eventTypes,
      categories,
      severities,
      userEmails,
      ipAddresses,
      dateFrom,
      dateTo,
      outcomes,
      riskScoreMin,
      riskScoreMax,
      tags,
      searchText,
      limit,
      offset
    } = req.query;

    const query: any = {};

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
      query.dateFrom = new Date(dateFrom as string);
    }
    if (dateTo) {
      query.dateTo = new Date(dateTo as string);
    }
    if (outcomes) {
      query.outcomes = Array.isArray(outcomes) ? outcomes : [outcomes];
    }
    if (riskScoreMin) {
      query.riskScoreMin = parseInt(riskScoreMin as string);
    }
    if (riskScoreMax) {
      query.riskScoreMax = parseInt(riskScoreMax as string);
    }
    if (tags) {
      query.tags = Array.isArray(tags) ? tags : [tags];
    }
    if (searchText) {
      query.searchText = searchText as string;
    }
    if (limit) {
      query.limit = parseInt(limit as string);
    }
    if (offset) {
      query.offset = parseInt(offset as string);
    }

    const events = await SecurityAuditService.queryAuditEvents(query);
    res.json(events);
  } catch (error) {
    console.error('Error getting audit events:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get audit summary statistics (admin only)
router.get('/summary', authenticate, requireAdmin, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    const summary = await SecurityAuditService.getAuditSummary(
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );
    
    res.json(summary);
  } catch (error) {
    console.error('Error getting audit summary:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get suspicious activity patterns (admin only)
router.get('/suspicious-activity', authenticate, requireAdmin, async (req, res) => {
  try {
    const suspiciousActivities = await SecurityAuditService.detectSuspiciousActivity();
    res.json(suspiciousActivities);
  } catch (error) {
    console.error('Error getting suspicious activity:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get detailed login history with audit information (admin or own user)
router.get('/login-history/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Users can only see their own history, admins can see any user's history
    if (req.user?.id !== userId && req.user?.funcao !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    const history = await SecurityAuditService.getDetailedLoginHistory(userId, limit);
    res.json(history);
  } catch (error) {
    console.error('Error getting detailed login history:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Log a custom audit event (admin only)
router.post('/log-event', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      eventType,
      category,
      severity,
      action,
      details,
      targetUserId,
      targetUserEmail,
      resource,
      outcome,
      tags
    } = req.body;

    if (!eventType || !category || !severity || !action || !outcome) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: eventType, category, severity, action, outcome' 
      });
    }

    const auditEvent = await SecurityAuditService.logAuditEvent({
      eventType,
      category,
      severity,
      userId: req.user?.id,
      userEmail: req.user?.email,
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
  } catch (error) {
    console.error('Error logging audit event:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get current user's audit trail
router.get('/my-activity', authenticate, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    
    const userActivity = await SecurityAuditService.queryAuditEvents({
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
  } catch (error) {
    console.error('Error getting user activity:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get audit event by ID (admin only)
router.get('/events/:eventId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const events = await SecurityAuditService.queryAuditEvents({
      searchText: eventId,
      limit: 1
    });

    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Evento de auditoria não encontrado' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error getting audit event:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Export audit data (admin only)
router.get('/export', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      format = 'json',
      dateFrom,
      dateTo,
      eventTypes,
      severities
    } = req.query;

    const query: any = {
      limit: 10000 // Large limit for export
    };

    if (dateFrom) query.dateFrom = new Date(dateFrom as string);
    if (dateTo) query.dateTo = new Date(dateTo as string);
    if (eventTypes) {
      query.eventTypes = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
    }
    if (severities) {
      query.severities = Array.isArray(severities) ? severities : [severities];
    }

    const events = await SecurityAuditService.queryAuditEvents(query);

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'ID,Event Type,Category,Severity,User Email,Action,Outcome,Timestamp,IP Address,Risk Score\n';
      const csvRows = events.map(event => 
        `"${event.id}","${event.eventType}","${event.category}","${event.severity}","${event.userEmail || ''}","${event.action}","${event.outcome}","${event.metadata.timestamp.toISOString()}","${event.ipAddress || ''}","${event.riskScore}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvHeader + csvRows);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="audit-export-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        exportDate: new Date().toISOString(),
        totalEvents: events.length,
        events
      });
    }
  } catch (error) {
    console.error('Error exporting audit data:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get audit statistics for dashboard
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const dateFrom = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const [summary, suspiciousActivity] = await Promise.all([
      SecurityAuditService.getAuditSummary(dateFrom),
      SecurityAuditService.detectSuspiciousActivity()
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
      recentHighRiskEvents: await SecurityAuditService.queryAuditEvents({
        severities: ['HIGH', 'CRITICAL'],
        dateFrom,
        limit: 10
      })
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting audit stats:', error);
    res.status(500).json({ error: 'Erro internal do servidor' });
  }
});

export default router;
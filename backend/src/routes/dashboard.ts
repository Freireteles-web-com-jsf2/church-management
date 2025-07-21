import express from 'express';
import { authenticate } from '../middleware/auth';
import { AuthErrorCodes, getAuthError } from '../utils/authErrors';
import DashboardService from '../services/DashboardService';

const router = express.Router();



// GET /api/dashboard/stats - Estatísticas gerais do dashboard
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = await DashboardService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// GET /api/dashboard/charts - Dados para gráficos
router.get('/charts', authenticate, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const chartData = await DashboardService.getChartData(period as 'month' | 'quarter' | 'year');
    res.json(chartData);
  } catch (error) {
    console.error('Erro ao buscar dados de gráficos:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// GET /api/dashboard/events - Próximos eventos
router.get('/events', authenticate, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const eventos = await DashboardService.getUpcomingEvents(parseInt(limit as string));
    res.json(eventos);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// GET /api/dashboard/birthdays - Aniversariantes
router.get('/birthdays', authenticate, async (req, res) => {
  try {
    const { type = 'month' } = req.query;
    const aniversariantes = await DashboardService.getBirthdays(type as 'today' | 'month');
    res.json(aniversariantes);
  } catch (error) {
    console.error('Erro ao buscar aniversariantes:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// GET /api/dashboard/notifications - Notificações do dashboard
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await DashboardService.getNotifications();
    res.json(notifications);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// POST /api/dashboard/refresh - Forçar atualização do cache
router.post('/refresh', authenticate, async (req, res) => {
  try {
    DashboardService.clearDashboardCache();
    res.json({ message: 'Cache do dashboard limpo com sucesso' });
  } catch (error) {
    console.error('Erro ao limpar cache do dashboard:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// POST /api/dashboard/warmup - Pré-aquecer o cache
router.post('/warmup', authenticate, async (req, res) => {
  try {
    await DashboardService.warmupCache();
    res.json({ message: 'Cache do dashboard pré-aquecido com sucesso' });
  } catch (error) {
    console.error('Erro ao pré-aquecer cache do dashboard:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// POST /api/dashboard/cleanup - Limpar entradas expiradas do cache
router.post('/cleanup', authenticate, async (req, res) => {
  try {
    DashboardService.cleanupExpiredCache();
    res.json({ message: 'Cache do dashboard limpo de entradas expiradas' });
  } catch (error) {
    console.error('Erro ao limpar cache expirado:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// GET /api/dashboard/activities - Atividades recentes
router.get('/activities', authenticate, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const activities = await DashboardService.getRecentActivities(parseInt(limit as string));
    res.json(activities);
  } catch (error) {
    console.error('Erro ao buscar atividades recentes:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// GET /api/dashboard/all - Todos os dados do dashboard em uma única requisição
router.get('/all', authenticate, async (req, res) => {
  try {
    const { period = 'month', eventsLimit = 5, activitiesLimit = 10 } = req.query;
    const dashboardData = await DashboardService.getAllDashboardData({
      period: period as 'month' | 'quarter' | 'year',
      eventsLimit: parseInt(eventsLimit as string),
      activitiesLimit: parseInt(activitiesLimit as string)
    });
    res.json(dashboardData);
  } catch (error) {
    console.error('Erro ao buscar todos os dados do dashboard:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// GET /api/dashboard/cache-stats - Estatísticas do cache (para debug)
router.get('/cache-stats', authenticate, async (req, res) => {
  try {
    const cacheStats = DashboardService.getCacheStats();
    res.json(cacheStats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas do cache:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// GET /api/dashboard/advanced-stats - Estatísticas avançadas de membros
router.get('/advanced-stats', authenticate, async (req, res) => {
  try {
    const advancedStats = await DashboardService.getAdvancedMemberStats();
    res.json(advancedStats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas avançadas:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// GET /api/dashboard/financial-metrics - Métricas financeiras avançadas
router.get('/financial-metrics', authenticate, async (req, res) => {
  try {
    const financialMetrics = await DashboardService.getAdvancedFinancialMetrics();
    res.json(financialMetrics);
  } catch (error) {
    console.error('Erro ao buscar métricas financeiras:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// GET /api/dashboard/system-usage - Estatísticas de uso do sistema
router.get('/system-usage', authenticate, async (req, res) => {
  try {
    const systemUsage = await DashboardService.getSystemUsageStats();
    res.json(systemUsage);
  } catch (error) {
    console.error('Erro ao buscar estatísticas de uso do sistema:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

// POST /api/dashboard/invalidate-cache - Invalidar cache específico
router.post('/invalidate-cache', authenticate, async (req, res) => {
  try {
    const { type = 'all' } = req.body;
    DashboardService.invalidateCache(type);
    res.json({ message: `Cache do tipo '${type}' invalidado com sucesso` });
  } catch (error) {
    console.error('Erro ao invalidar cache:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

export default router;
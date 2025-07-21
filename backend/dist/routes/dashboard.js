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
const auth_1 = require("../middleware/auth");
const authErrors_1 = require("../utils/authErrors");
const DashboardService_1 = __importDefault(require("../services/DashboardService"));
const router = express_1.default.Router();
// GET /api/dashboard/stats - Estatísticas gerais do dashboard
router.get('/stats', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield DashboardService_1.default.getDashboardStats();
        res.json(stats);
    }
    catch (error) {
        console.error('Erro ao buscar estatísticas do dashboard:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// GET /api/dashboard/charts - Dados para gráficos
router.get('/charts', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { period = 'month' } = req.query;
        const chartData = yield DashboardService_1.default.getChartData(period);
        res.json(chartData);
    }
    catch (error) {
        console.error('Erro ao buscar dados de gráficos:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// GET /api/dashboard/events - Próximos eventos
router.get('/events', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit = 5 } = req.query;
        const eventos = yield DashboardService_1.default.getUpcomingEvents(parseInt(limit));
        res.json(eventos);
    }
    catch (error) {
        console.error('Erro ao buscar eventos:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// GET /api/dashboard/birthdays - Aniversariantes
router.get('/birthdays', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type = 'month' } = req.query;
        const aniversariantes = yield DashboardService_1.default.getBirthdays(type);
        res.json(aniversariantes);
    }
    catch (error) {
        console.error('Erro ao buscar aniversariantes:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// GET /api/dashboard/notifications - Notificações do dashboard
router.get('/notifications', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notifications = yield DashboardService_1.default.getNotifications();
        res.json(notifications);
    }
    catch (error) {
        console.error('Erro ao buscar notificações:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// POST /api/dashboard/refresh - Forçar atualização do cache
router.post('/refresh', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        DashboardService_1.default.clearDashboardCache();
        res.json({ message: 'Cache do dashboard limpo com sucesso' });
    }
    catch (error) {
        console.error('Erro ao limpar cache do dashboard:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// POST /api/dashboard/warmup - Pré-aquecer o cache
router.post('/warmup', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield DashboardService_1.default.warmupCache();
        res.json({ message: 'Cache do dashboard pré-aquecido com sucesso' });
    }
    catch (error) {
        console.error('Erro ao pré-aquecer cache do dashboard:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// POST /api/dashboard/cleanup - Limpar entradas expiradas do cache
router.post('/cleanup', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        DashboardService_1.default.cleanupExpiredCache();
        res.json({ message: 'Cache do dashboard limpo de entradas expiradas' });
    }
    catch (error) {
        console.error('Erro ao limpar cache expirado:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// GET /api/dashboard/activities - Atividades recentes
router.get('/activities', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit = 10 } = req.query;
        const activities = yield DashboardService_1.default.getRecentActivities(parseInt(limit));
        res.json(activities);
    }
    catch (error) {
        console.error('Erro ao buscar atividades recentes:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// GET /api/dashboard/all - Todos os dados do dashboard em uma única requisição
router.get('/all', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { period = 'month', eventsLimit = 5, activitiesLimit = 10 } = req.query;
        const dashboardData = yield DashboardService_1.default.getAllDashboardData({
            period: period,
            eventsLimit: parseInt(eventsLimit),
            activitiesLimit: parseInt(activitiesLimit)
        });
        res.json(dashboardData);
    }
    catch (error) {
        console.error('Erro ao buscar todos os dados do dashboard:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// GET /api/dashboard/cache-stats - Estatísticas do cache (para debug)
router.get('/cache-stats', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheStats = DashboardService_1.default.getCacheStats();
        res.json(cacheStats);
    }
    catch (error) {
        console.error('Erro ao buscar estatísticas do cache:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// GET /api/dashboard/advanced-stats - Estatísticas avançadas de membros
router.get('/advanced-stats', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const advancedStats = yield DashboardService_1.default.getAdvancedMemberStats();
        res.json(advancedStats);
    }
    catch (error) {
        console.error('Erro ao buscar estatísticas avançadas:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// GET /api/dashboard/financial-metrics - Métricas financeiras avançadas
router.get('/financial-metrics', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const financialMetrics = yield DashboardService_1.default.getAdvancedFinancialMetrics();
        res.json(financialMetrics);
    }
    catch (error) {
        console.error('Erro ao buscar métricas financeiras:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// GET /api/dashboard/system-usage - Estatísticas de uso do sistema
router.get('/system-usage', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const systemUsage = yield DashboardService_1.default.getSystemUsageStats();
        res.json(systemUsage);
    }
    catch (error) {
        console.error('Erro ao buscar estatísticas de uso do sistema:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
// POST /api/dashboard/invalidate-cache - Invalidar cache específico
router.post('/invalidate-cache', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type = 'all' } = req.body;
        DashboardService_1.default.invalidateCache(type);
        res.json({ message: `Cache do tipo '${type}' invalidado com sucesso` });
    }
    catch (error) {
        console.error('Erro ao invalidar cache:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
exports.default = router;

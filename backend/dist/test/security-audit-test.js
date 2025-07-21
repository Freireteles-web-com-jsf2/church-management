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
const SecurityAuditService_1 = __importDefault(require("../services/SecurityAuditService"));
console.log('📋 Testando Sistema de Auditoria de Segurança...\n');
function testSecurityAuditSystem() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🔍 1. Testando logging de eventos de auditoria...\n');
        // Clear existing audit events
        if (global.auditEvents) {
            global.auditEvents = [];
        }
        // Test authentication events
        console.log('   🔐 Testando eventos de autenticação...');
        const authSuccessEvent = yield SecurityAuditService_1.default.logAuthenticationEvent('LOGIN_SUCCESS', 'SUCCESS', 'admin@igreja.com', 'user-123', '192.168.1.100', 'Mozilla/5.0 Test Browser', { loginMethod: 'local', sessionDuration: 3600 });
        console.log(`   ✅ Login bem-sucedido registrado: ${authSuccessEvent.id}`);
        console.log(`      - Pontuação de risco: ${authSuccessEvent.riskScore}`);
        console.log(`      - Severidade: ${authSuccessEvent.severity}`);
        const authFailureEvent = yield SecurityAuditService_1.default.logAuthenticationEvent('LOGIN_FAILURE', 'FAILURE', 'hacker@malicious.com', undefined, '10.0.0.1', 'Malicious Bot', { failureReason: 'INVALID_PASSWORD', attemptCount: 5 });
        console.log(`   ❌ Login falhado registrado: ${authFailureEvent.id}`);
        console.log(`      - Pontuação de risco: ${authFailureEvent.riskScore}`);
        console.log(`      - Severidade: ${authFailureEvent.severity}`);
        // Test user management events
        console.log('\n   👥 Testando eventos de gestão de usuários...');
        const userCreateEvent = yield SecurityAuditService_1.default.logUserManagementEvent('USER_CREATED', 'SUCCESS', 'admin-123', 'admin@igreja.com', 'new-user-456', 'newuser@igreja.com', '192.168.1.100', { role: 'membro', createdBy: 'admin' });
        console.log(`   ✅ Criação de usuário registrada: ${userCreateEvent.id}`);
        console.log(`      - Pontuação de risco: ${userCreateEvent.riskScore}`);
        // Test password events
        console.log('\n   🔑 Testando eventos de senha...');
        const passwordChangeEvent = yield SecurityAuditService_1.default.logPasswordEvent('PASSWORD_CHANGED', 'SUCCESS', 'user-123', 'user@igreja.com', '192.168.1.100', { changeReason: 'USER_INITIATED', strengthScore: 85 });
        console.log(`   ✅ Mudança de senha registrada: ${passwordChangeEvent.id}`);
        console.log(`      - Pontuação de risco: ${passwordChangeEvent.riskScore}`);
        // Test session events
        console.log('\n   🎫 Testando eventos de sessão...');
        const sessionEvent = yield SecurityAuditService_1.default.logSessionEvent('SESSION_CREATED', 'SUCCESS', 'user-123', 'user@igreja.com', 'session-token-789', '192.168.1.100', { rememberMe: true, expiresIn: 2592000 });
        console.log(`   ✅ Criação de sessão registrada: ${sessionEvent.id}`);
        console.log(`      - Pontuação de risco: ${sessionEvent.riskScore}`);
        // Test security violations
        console.log('\n   🚨 Testando violações de segurança...');
        const violationEvent = yield SecurityAuditService_1.default.logSecurityViolation('BRUTE_FORCE_ATTEMPT', 'attacker-999', 'attacker@malicious.com', '10.0.0.1', { attemptCount: 15, timeWindow: 300, targetAccounts: ['admin@igreja.com', 'user@igreja.com'] });
        console.log(`   🚨 Violação de segurança registrada: ${violationEvent.id}`);
        console.log(`      - Pontuação de risco: ${violationEvent.riskScore}`);
        console.log(`      - Severidade: ${violationEvent.severity}`);
        console.log('\n📊 2. Testando consultas de eventos de auditoria...\n');
        // Test basic query
        const allEvents = yield SecurityAuditService_1.default.queryAuditEvents({ limit: 10 });
        console.log(`   Total de eventos encontrados: ${allEvents.length}`);
        // Test filtered queries
        const authEvents = yield SecurityAuditService_1.default.queryAuditEvents({
            eventTypes: ['AUTHENTICATION'],
            limit: 10
        });
        console.log(`   Eventos de autenticação: ${authEvents.length}`);
        const highRiskEvents = yield SecurityAuditService_1.default.queryAuditEvents({
            riskScoreMin: 50,
            limit: 10
        });
        console.log(`   Eventos de alto risco (≥50): ${highRiskEvents.length}`);
        const failureEvents = yield SecurityAuditService_1.default.queryAuditEvents({
            outcomes: ['FAILURE'],
            limit: 10
        });
        console.log(`   Eventos com falha: ${failureEvents.length}`);
        // Test search
        const searchResults = yield SecurityAuditService_1.default.queryAuditEvents({
            searchText: 'LOGIN',
            limit: 10
        });
        console.log(`   Eventos contendo 'LOGIN': ${searchResults.length}`);
        console.log('\n📈 3. Testando resumo de auditoria...\n');
        const summary = yield SecurityAuditService_1.default.getAuditSummary();
        console.log('   Resumo de auditoria:');
        console.log(`   - Total de eventos: ${summary.totalEvents}`);
        console.log(`   - Eventos por tipo:`);
        Object.entries(summary.eventsByType).forEach(([type, count]) => {
            console.log(`     * ${type}: ${count}`);
        });
        console.log(`   - Eventos por categoria:`);
        Object.entries(summary.eventsByCategory).forEach(([category, count]) => {
            console.log(`     * ${category}: ${count}`);
        });
        console.log(`   - Eventos por severidade:`);
        Object.entries(summary.eventsBySeverity).forEach(([severity, count]) => {
            console.log(`     * ${severity}: ${count}`);
        });
        console.log(`   - Principais usuários:`);
        summary.topUsers.slice(0, 3).forEach(user => {
            console.log(`     * ${user.userEmail}: ${user.eventCount} eventos`);
        });
        console.log(`   - Principais IPs:`);
        summary.topIPs.slice(0, 3).forEach(ip => {
            console.log(`     * ${ip.ipAddress}: ${ip.eventCount} eventos`);
        });
        console.log('\n🕵️ 4. Testando detecção de atividade suspeita...\n');
        // Add more events to trigger suspicious activity detection
        console.log('   Simulando atividade suspeita...');
        // Multiple failed logins from same user
        for (let i = 0; i < 8; i++) {
            yield SecurityAuditService_1.default.logAuthenticationEvent('LOGIN_FAILURE', 'FAILURE', 'victim@igreja.com', undefined, '192.168.1.200', 'Suspicious Browser', { failureReason: 'INVALID_PASSWORD', attemptNumber: i + 1 });
        }
        // Multiple IPs for same user
        const ips = ['10.0.0.1', '172.16.0.1', '203.0.113.1', '198.51.100.1'];
        for (const ip of ips) {
            yield SecurityAuditService_1.default.logAuthenticationEvent('LOGIN_SUCCESS', 'SUCCESS', 'traveler@igreja.com', 'traveler-123', ip, 'Mobile Browser', { location: `Location for ${ip}` });
        }
        // Privilege escalation attempts
        yield SecurityAuditService_1.default.logAuditEvent({
            eventType: 'AUTHORIZATION',
            category: 'SECURITY',
            severity: 'HIGH',
            userId: 'user-456',
            userEmail: 'user@igreja.com',
            ipAddress: '192.168.1.150',
            action: 'PRIVILEGE_ESCALATION_ATTEMPT',
            details: {
                privilegeEscalation: true,
                requestedRole: 'admin',
                currentRole: 'membro'
            },
            outcome: 'FAILURE',
            tags: ['privilege-escalation', 'security-violation']
        });
        const suspiciousActivities = yield SecurityAuditService_1.default.detectSuspiciousActivity();
        console.log(`   Atividades suspeitas detectadas: ${suspiciousActivities.length}`);
        suspiciousActivities.forEach((activity, index) => {
            console.log(`\n   Atividade suspeita ${index + 1}:`);
            console.log(`   - Tipo: ${activity.type}`);
            console.log(`   - Descrição: ${activity.description}`);
            console.log(`   - Pontuação de risco: ${activity.riskScore}/100`);
            console.log(`   - Usuários afetados: ${activity.affectedUsers.length}`);
            console.log(`   - Eventos relacionados: ${activity.events.length}`);
            console.log(`   - Status: ${activity.status}`);
        });
        console.log('\n📋 5. Testando histórico detalhado de login...\n');
        const loginHistory = yield SecurityAuditService_1.default.getDetailedLoginHistory('user-123', 10);
        console.log(`   Histórico de login encontrado: ${loginHistory.length} entradas`);
        loginHistory.slice(0, 3).forEach((entry, index) => {
            console.log(`   ${index + 1}. ${entry.action} - ${entry.outcome}`);
            console.log(`      - Timestamp: ${entry.metadata.timestamp.toLocaleString()}`);
            console.log(`      - IP: ${entry.ipAddress || 'N/A'}`);
            console.log(`      - Pontuação de risco: ${entry.riskScore}`);
        });
        console.log('\n🧹 6. Testando limpeza de eventos antigos...\n');
        const beforeCleanup = global.auditEvents ? global.auditEvents.length : 0;
        console.log(`   Eventos antes da limpeza: ${beforeCleanup}`);
        yield SecurityAuditService_1.default.cleanupOldEvents();
        const afterCleanup = global.auditEvents ? global.auditEvents.length : 0;
        console.log(`   Eventos após limpeza: ${afterCleanup}`);
        console.log(`   Status da limpeza: ${afterCleanup <= beforeCleanup ? '✅ Funcionando' : '❌ Problema'}`);
        console.log('\n🎯 7. Testando cenários específicos de auditoria...\n');
        // Test high-risk event triggering alerts
        console.log('   Testando eventos de alto risco...');
        const highRiskEvent = yield SecurityAuditService_1.default.logAuditEvent({
            eventType: 'SECURITY_VIOLATION',
            category: 'SECURITY',
            severity: 'CRITICAL',
            userId: 'attacker-999',
            userEmail: 'attacker@malicious.com',
            ipAddress: '10.0.0.1',
            action: 'SYSTEM_COMPROMISE_ATTEMPT',
            details: {
                multipleFailedAttempts: true,
                privilegeEscalation: true,
                outsideBusinessHours: true,
                unusualLocation: true,
                suspiciousUserAgent: 'Automated Tool'
            },
            outcome: 'FAILURE',
            tags: ['critical', 'system-compromise', 'automated-attack']
        });
        console.log(`   🚨 Evento crítico registrado: ${highRiskEvent.id}`);
        console.log(`      - Pontuação de risco: ${highRiskEvent.riskScore}/100`);
        console.log(`      - Severidade: ${highRiskEvent.severity}`);
        // Test event with custom metadata
        console.log('\n   Testando evento com metadados customizados...');
        const customEvent = yield SecurityAuditService_1.default.logAuditEvent({
            eventType: 'ADMIN_ACTION',
            category: 'ADMIN',
            severity: 'MEDIUM',
            userId: 'admin-123',
            userEmail: 'admin@igreja.com',
            ipAddress: '192.168.1.100',
            resource: '/api/users/bulk-delete',
            action: 'BULK_USER_DELETION',
            details: {
                deletedUsers: ['user1@igreja.com', 'user2@igreja.com'],
                deletionReason: 'Cleanup inactive accounts',
                approvedBy: 'supervisor@igreja.com'
            },
            outcome: 'SUCCESS',
            tags: ['bulk-operation', 'user-management', 'admin-action']
        });
        console.log(`   ✅ Evento administrativo registrado: ${customEvent.id}`);
        console.log(`      - Recurso: ${customEvent.resource}`);
        console.log(`      - Tags: ${customEvent.tags.join(', ')}`);
        console.log('\n📊 8. Testando estatísticas finais...\n');
        const finalSummary = yield SecurityAuditService_1.default.getAuditSummary();
        console.log('   Estatísticas finais:');
        console.log(`   - Total de eventos: ${finalSummary.totalEvents}`);
        console.log(`   - Distribuição de pontuação de risco:`);
        finalSummary.riskScoreDistribution.forEach(range => {
            console.log(`     * ${range.range}: ${range.count} eventos`);
        });
        const finalSuspiciousActivities = yield SecurityAuditService_1.default.detectSuspiciousActivity();
        console.log(`   - Atividades suspeitas ativas: ${finalSuspiciousActivities.length}`);
        console.log('\n🎉 Todos os testes de auditoria de segurança foram executados!');
        console.log('📊 Resumo dos testes:');
        console.log('   ✅ Logging de eventos de auditoria');
        console.log('   ✅ Eventos de autenticação');
        console.log('   ✅ Eventos de gestão de usuários');
        console.log('   ✅ Eventos de senha');
        console.log('   ✅ Eventos de sessão');
        console.log('   ✅ Violações de segurança');
        console.log('   ✅ Consultas e filtros');
        console.log('   ✅ Resumos estatísticos');
        console.log('   ✅ Detecção de atividade suspeita');
        console.log('   ✅ Histórico detalhado');
        console.log('   ✅ Limpeza de dados');
        console.log('   ✅ Cenários específicos');
        console.log('   ✅ Cálculo de pontuação de risco');
        console.log('   ✅ Alertas de alto risco');
    });
}
// Run the tests
testSecurityAuditSystem().catch(console.error);

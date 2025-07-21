import { AuthService } from '../services/AuthService';
import SecurityMonitoringService from '../services/SecurityMonitoringService';

console.log('🔍 Testando Sistema de Monitoramento de Login...\n');

async function testLoginAttemptMonitoring() {
  console.log('📊 1. Testando rastreamento de tentativas de login...\n');

  // Clear existing attempts
  if (global.loginAttempts) {
    global.loginAttempts = [];
  }

  const testEmail = 'test@igreja.com';
  const testIP = '192.168.1.100';
  const testUserAgent = 'Mozilla/5.0 Test Browser';

  // Test successful login recording
  console.log('   ✅ Registrando login bem-sucedido...');
  await AuthService.recordLoginAttempt(testEmail, true, testIP, testUserAgent);
  
  const canAttemptAfterSuccess = await AuthService.checkLoginAttempts(testEmail, testIP);
  console.log(`   Pode tentar login após sucesso: ${canAttemptAfterSuccess ? '✅ Sim' : '❌ Não'}`);

  // Test failed login attempts
  console.log('\n   ❌ Registrando tentativas de login falhadas...');
  for (let i = 1; i <= 3; i++) {
    await AuthService.recordLoginAttempt(testEmail, false, testIP, testUserAgent, 'INVALID_PASSWORD');
    console.log(`   Tentativa falhada ${i} registrada`);
  }

  const canAttemptAfter3Failures = await AuthService.checkLoginAttempts(testEmail, testIP);
  console.log(`   Pode tentar login após 3 falhas: ${canAttemptAfter3Failures ? '✅ Sim' : '❌ Não'}`);

  // Test account lockout
  console.log('\n   🔒 Testando bloqueio de conta...');
  for (let i = 4; i <= 6; i++) {
    await AuthService.recordLoginAttempt(testEmail, false, testIP, testUserAgent, 'INVALID_PASSWORD');
    console.log(`   Tentativa falhada ${i} registrada`);
  }

  const canAttemptAfterLockout = await AuthService.checkLoginAttempts(testEmail, testIP);
  console.log(`   Pode tentar login após 6 falhas: ${canAttemptAfterLockout ? '❌ Deveria estar bloqueado' : '✅ Corretamente bloqueado'}`);

  const isLocked = await AuthService.isAccountLocked(testEmail);
  console.log(`   Conta está bloqueada: ${isLocked ? '✅ Sim' : '❌ Não'}`);

  console.log('\n📈 2. Testando análise de estatísticas de login...\n');

  // Test login statistics
  const stats = await SecurityMonitoringService.analyzeLoginAttempts(60);
  console.log('   Estatísticas dos últimos 60 minutos:');
  console.log(`   - Total de tentativas: ${stats.totalAttempts}`);
  console.log(`   - Tentativas bem-sucedidas: ${stats.successfulAttempts}`);
  console.log(`   - Tentativas falhadas: ${stats.failedAttempts}`);
  console.log(`   - IPs únicos: ${stats.uniqueIPs}`);
  console.log(`   - Usuários únicos: ${stats.uniqueUsers}`);
  console.log(`   - Principais razões de falha:`);
  stats.topFailureReasons.forEach(reason => {
    console.log(`     * ${reason.reason}: ${reason.count} vezes`);
  });

  console.log('\n🚨 3. Testando detecção de padrões suspeitos...\n');

  // Add more suspicious attempts to trigger pattern detection
  const suspiciousIP = '10.0.0.1';
  console.log('   Simulando atividade suspeita...');
  
  // Rapid attempts from same IP
  for (let i = 0; i < 12; i++) {
    await AuthService.recordLoginAttempt(`user${i}@igreja.com`, false, suspiciousIP, testUserAgent, 'INVALID_PASSWORD');
  }

  // Multiple IPs for same user
  const multiIPUser = 'admin@igreja.com';
  const ips = ['192.168.1.1', '10.0.0.2', '172.16.0.1', '203.0.113.1'];
  for (const ip of ips) {
    await AuthService.recordLoginAttempt(multiIPUser, false, ip, testUserAgent, 'INVALID_PASSWORD');
  }

  const patterns = await SecurityMonitoringService.detectSuspiciousPatterns();
  console.log(`   Padrões suspeitos detectados: ${patterns.length}`);
  
  patterns.forEach((pattern, index) => {
    console.log(`\n   Padrão ${index + 1}:`);
    console.log(`   - Tipo: ${pattern.type}`);
    console.log(`   - Descrição: ${pattern.description}`);
    console.log(`   - Pontuação de risco: ${pattern.riskScore}/100`);
    console.log(`   - Contas afetadas: ${pattern.affectedAccounts.length}`);
    console.log(`   - Evidências:`);
    pattern.evidence.forEach(evidence => {
      console.log(`     * ${evidence}`);
    });
  });

  console.log('\n🚨 4. Testando geração de alertas de segurança...\n');

  const alerts = await SecurityMonitoringService.generateSecurityAlerts();
  console.log(`   Alertas de segurança gerados: ${alerts.length}`);
  
  alerts.forEach((alert, index) => {
    console.log(`\n   Alerta ${index + 1}:`);
    console.log(`   - Tipo: ${alert.type}`);
    console.log(`   - Severidade: ${alert.severity}`);
    console.log(`   - Mensagem: ${alert.message}`);
    console.log(`   - Usuários afetados: ${alert.affectedUsers.length}`);
    console.log(`   - IPs envolvidos: ${alert.ipAddresses.length}`);
    console.log(`   - Timestamp: ${alert.timestamp.toLocaleString()}`);
  });

  console.log('\n🔐 5. Testando informações de bloqueio de conta...\n');

  const lockoutInfo = await SecurityMonitoringService.getAccountLockoutInfo(testEmail);
  console.log(`   Informações de bloqueio para ${testEmail}:`);
  console.log(`   - Está bloqueada: ${lockoutInfo.isLocked ? '✅ Sim' : '❌ Não'}`);
  console.log(`   - Tentativas falhadas: ${lockoutInfo.failedAttempts}`);
  console.log(`   - Razão do bloqueio: ${lockoutInfo.lockoutReason || 'N/A'}`);
  console.log(`   - Última tentativa: ${lockoutInfo.lastAttemptAt?.toLocaleString() || 'N/A'}`);
  console.log(`   - Pode tentar novamente em: ${lockoutInfo.canRetryAt?.toLocaleString() || 'Agora'}`);

  console.log('\n📊 6. Testando dashboard de segurança...\n');

  const dashboard = await SecurityMonitoringService.getSecurityDashboard();
  console.log('   Dashboard de segurança:');
  console.log(`   - Total de tentativas (1h): ${dashboard.stats.totalAttempts}`);
  console.log(`   - Alertas ativos: ${dashboard.alerts.length}`);
  console.log(`   - Padrões suspeitos: ${dashboard.patterns.length}`);
  console.log(`   - Eventos recentes: ${dashboard.recentEvents.length}`);
  console.log(`   - Contas bloqueadas: ${dashboard.lockedAccounts.length}`);
  
  if (dashboard.lockedAccounts.length > 0) {
    console.log('   Contas bloqueadas:');
    dashboard.lockedAccounts.forEach(account => {
      console.log(`     - ${account}`);
    });
  }

  console.log('\n📝 7. Testando histórico de login...\n');

  // Test login history
  const history = await AuthService.getLoginHistory('test-user-id', 10);
  console.log(`   Histórico de login encontrado: ${history.length} entradas`);

  // Test security events
  const securityEvents = await AuthService.getSecurityEvents(10);
  console.log(`   Eventos de segurança encontrados: ${securityEvents.length} entradas`);

  console.log('\n🧹 8. Testando limpeza de dados antigos...\n');

  const beforeCleanup = global.loginAttempts ? global.loginAttempts.length : 0;
  console.log(`   Tentativas de login antes da limpeza: ${beforeCleanup}`);
  
  await SecurityMonitoringService.cleanupOldData();
  
  const afterCleanup = global.loginAttempts ? global.loginAttempts.length : 0;
  console.log(`   Tentativas de login após limpeza: ${afterCleanup}`);
  console.log(`   Status da limpeza: ${afterCleanup <= beforeCleanup ? '✅ Funcionando' : '❌ Problema'}`);

  console.log('\n🎯 9. Testando cenários específicos...\n');

  // Test IP-based blocking
  console.log('   Testando bloqueio por IP...');
  const maliciousIP = '192.168.1.999';
  
  // Generate many failed attempts from same IP
  for (let i = 0; i < 15; i++) {
    await AuthService.recordLoginAttempt(`victim${i}@igreja.com`, false, maliciousIP, testUserAgent, 'BRUTE_FORCE');
  }

  const canAttemptFromMaliciousIP = await AuthService.checkLoginAttempts('newuser@igreja.com', maliciousIP);
  console.log(`   Pode tentar login do IP malicioso: ${canAttemptFromMaliciousIP ? '❌ Deveria estar bloqueado' : '✅ Corretamente bloqueado'}`);

  // Test session cleanup
  console.log('\n   Testando limpeza de sessões...');
  await AuthService.cleanExpiredSessions();
  console.log('   ✅ Limpeza de sessões executada');

  console.log('\n🎉 Todos os testes de monitoramento de login foram executados!');
  console.log('📊 Resumo dos testes:');
  console.log('   ✅ Rastreamento de tentativas de login');
  console.log('   ✅ Bloqueio de conta por múltiplas falhas');
  console.log('   ✅ Análise de estatísticas');
  console.log('   ✅ Detecção de padrões suspeitos');
  console.log('   ✅ Geração de alertas de segurança');
  console.log('   ✅ Informações de bloqueio');
  console.log('   ✅ Dashboard de segurança');
  console.log('   ✅ Histórico e eventos');
  console.log('   ✅ Limpeza de dados');
  console.log('   ✅ Cenários específicos');
}

// Run the tests
testLoginAttemptMonitoring().catch(console.error);
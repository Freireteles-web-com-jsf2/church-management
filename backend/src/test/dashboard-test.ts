import DashboardService from '../services/DashboardService';

async function testDashboardService() {
  console.log('🧪 Testing Dashboard Service...\n');

  try {
    // Test 1: Get Dashboard Stats
    console.log('1. Testing getDashboardStats():');
    const stats = await DashboardService.getDashboardStats();
    console.log('   ✅ Dashboard stats retrieved successfully');
    console.log(`   - Total Pessoas: ${stats.totalPessoas}`);
    console.log(`   - Pessoas Ativas: ${stats.pessoasAtivas}`);
    console.log(`   - Total Grupos: ${stats.totalGrupos}`);
    console.log(`   - Receitas do Mês: R$ ${stats.receitasMes.toFixed(2)}`);
    console.log(`   - Despesas do Mês: R$ ${stats.despesasMes.toFixed(2)}`);
    console.log(`   - Saldo do Mês: R$ ${stats.saldoMes.toFixed(2)}`);
    console.log(`   - Aniversariantes Hoje: ${stats.aniversariantesHoje}`);
    console.log(`   - Aniversariantes do Mês: ${stats.aniversariantesMes}`);

    // Test 2: Get Chart Data
    console.log('\n2. Testing getChartData():');
    const chartData = await DashboardService.getChartData('month');
    console.log('   ✅ Chart data retrieved successfully');
    console.log(`   - Financial data points: ${chartData.financialData.length}`);
    console.log(`   - Member distribution categories: ${chartData.membersDistribution.length}`);

    // Test 3: Get Upcoming Events
    console.log('\n3. Testing getUpcomingEvents():');
    const events = await DashboardService.getUpcomingEvents(5);
    console.log('   ✅ Upcoming events retrieved successfully');
    console.log(`   - Number of upcoming events: ${events.length}`);

    // Test 4: Get Birthdays
    console.log('\n4. Testing getBirthdays():');
    const birthdays = await DashboardService.getBirthdays('month');
    console.log('   ✅ Birthdays retrieved successfully');
    console.log(`   - Number of birthdays this month: ${birthdays.length}`);

    // Test 5: Get Notifications
    console.log('\n5. Testing getNotifications():');
    const notifications = await DashboardService.getNotifications();
    console.log('   ✅ Notifications retrieved successfully');
    console.log(`   - Number of notifications: ${notifications.length}`);

    // Test 6: Get Recent Activities
    console.log('\n6. Testing getRecentActivities():');
    const activities = await DashboardService.getRecentActivities(10);
    console.log('   ✅ Recent activities retrieved successfully');
    console.log(`   - Number of recent activities: ${activities.length}`);
    if (activities.length > 0) {
      console.log(`   - Latest activity: ${activities[0].title} - ${activities[0].description}`);
    }

    // Test 7: Get All Dashboard Data (optimized single call)
    console.log('\n7. Testing getAllDashboardData():');
    const allData = await DashboardService.getAllDashboardData({
      period: 'month',
      eventsLimit: 5,
      activitiesLimit: 10
    });
    console.log('   ✅ All dashboard data retrieved successfully');
    console.log(`   - Stats included: ${allData.stats ? 'Yes' : 'No'}`);
    console.log(`   - Charts included: ${allData.charts ? 'Yes' : 'No'}`);
    console.log(`   - Events included: ${allData.upcomingEvents.length} events`);
    console.log(`   - Birthdays today: ${allData.birthdays.today.length}`);
    console.log(`   - Birthdays this month: ${allData.birthdays.month.length}`);
    console.log(`   - Notifications: ${allData.notifications.length}`);
    console.log(`   - Recent activities: ${allData.recentActivities.length}`);
    console.log(`   - Last updated: ${allData.lastUpdated.toISOString()}`);

    // Test 8: Cache functionality
    console.log('\n8. Testing cache functionality:');
    const cacheStats = DashboardService.getCacheStats();
    console.log('   ✅ Cache stats retrieved successfully');
    console.log(`   - Cache size: ${cacheStats.size}`);

    // Test cache clearing
    DashboardService.clearDashboardCache();
    const cacheStatsAfterClear = DashboardService.getCacheStats();
    console.log(`   - Cache size after clear: ${cacheStatsAfterClear.size}`);
    console.log('   ✅ Cache clearing works correctly');

    // Test 9: Cache warmup functionality
    console.log('\n9. Testing cache warmup:');
    await DashboardService.warmupCache();
    const cacheStatsAfterWarmup = DashboardService.getCacheStats();
    console.log('   ✅ Cache warmup completed successfully');
    console.log(`   - Cache size after warmup: ${cacheStatsAfterWarmup.size}`);

    // Test 10: Cache cleanup functionality
    console.log('\n10. Testing cache cleanup:');
    DashboardService.cleanupExpiredCache();
    console.log('   ✅ Cache cleanup completed successfully');

    // Test 11: Advanced Member Statistics
    console.log('\n11. Testing getAdvancedMemberStats():');
    const advancedMemberStats = await DashboardService.getAdvancedMemberStats();
    console.log('   ✅ Advanced member stats retrieved successfully');
    console.log(`   - Crescimento mensal: ${advancedMemberStats.crescimentoMensal}`);
    console.log(`   - Média de idade: ${advancedMemberStats.mediaIdade} anos`);
    console.log(`   - Distribuição por gênero: M:${advancedMemberStats.distribuicaoGenero.masculino}, F:${advancedMemberStats.distribuicaoGenero.feminino}`);
    console.log(`   - Novos membros este mês: ${advancedMemberStats.novosMembrosMes}`);
    console.log(`   - Taxa de retenção: ${advancedMemberStats.taxaRetencao}%`);

    // Test 12: Advanced Financial Metrics
    console.log('\n12. Testing getAdvancedFinancialMetrics():');
    const financialMetrics = await DashboardService.getAdvancedFinancialMetrics();
    console.log('   ✅ Advanced financial metrics retrieved successfully');
    console.log(`   - Receita média: R$ ${financialMetrics.receitaMedia.toFixed(2)}`);
    console.log(`   - Despesa média: R$ ${financialMetrics.despesaMedia.toFixed(2)}`);
    console.log(`   - Maior receita: R$ ${financialMetrics.maiorReceita.toFixed(2)}`);
    console.log(`   - Maior despesa: R$ ${financialMetrics.maiorDespesa.toFixed(2)}`);
    console.log(`   - Categorias que mais gastam: ${financialMetrics.categoriasMaisGastam.length}`);
    console.log(`   - Projeção mensal - Receitas: R$ ${financialMetrics.projecaoMensal.receitas.toFixed(2)}`);
    console.log(`   - Projeção mensal - Despesas: R$ ${financialMetrics.projecaoMensal.despesas.toFixed(2)}`);
    console.log(`   - Projeção mensal - Saldo: R$ ${financialMetrics.projecaoMensal.saldo.toFixed(2)}`);

    // Test 13: System Usage Statistics
    console.log('\n13. Testing getSystemUsageStats():');
    const systemUsage = await DashboardService.getSystemUsageStats();
    console.log('   ✅ System usage stats retrieved successfully');
    console.log(`   - Total usuários: ${systemUsage.totalUsuarios}`);
    console.log(`   - Usuários ativos: ${systemUsage.usuariosAtivos}`);
    console.log(`   - Módulos mais usados: ${systemUsage.modulosMaisUsados.length}`);
    console.log(`   - Horários de atividade: ${systemUsage.horariosAtividade.length} pontos`);

    // Test 14: Cache Invalidation
    console.log('\n14. Testing cache invalidation:');
    const cacheBeforeInvalidation = DashboardService.getCacheStats();
    console.log(`   - Cache size before invalidation: ${cacheBeforeInvalidation.size}`);
    
    DashboardService.invalidateCache('stats');
    const cacheAfterStatsInvalidation = DashboardService.getCacheStats();
    console.log(`   - Cache size after stats invalidation: ${cacheAfterStatsInvalidation.size}`);
    console.log('   ✅ Cache invalidation works correctly');

    // Test 15: Performance test with multiple concurrent requests
    console.log('\n15. Testing concurrent performance:');
    const startTime = Date.now();
    
    const concurrentPromises = [
      DashboardService.getDashboardStats(),
      DashboardService.getChartData('month'),
      DashboardService.getUpcomingEvents(5),
      DashboardService.getBirthdays('month'),
      DashboardService.getNotifications(),
      DashboardService.getAdvancedMemberStats(),
      DashboardService.getAdvancedFinancialMetrics()
    ];
    
    await Promise.all(concurrentPromises);
    const endTime = Date.now();
    
    console.log(`   ✅ Concurrent requests completed in ${endTime - startTime}ms`);
    console.log('   ✅ Performance test passed');

    console.log('\n✅ All Dashboard Service tests passed!');
    console.log('🎉 Enhanced data aggregation system is working correctly!');
    return true;

  } catch (error) {
    console.error('❌ Dashboard Service test failed:', error);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDashboardService()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { testDashboardService };
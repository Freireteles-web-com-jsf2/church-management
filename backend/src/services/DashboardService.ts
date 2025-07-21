import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DashboardStats {
  totalPessoas: number;
  pessoasAtivas: number;
  totalGrupos: number;
  gruposAtivos: number;
  totalEventos: number;
  receitasMes: number;
  despesasMes: number;
  saldoMes: number;
  aniversariantesHoje: number;
  aniversariantesMes: number;
  trends: {
    receitas: TrendData;
    despesas: TrendData;
    saldo: TrendData;
    membros: TrendData;
  };
}

export interface TrendData {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  period: string;
}

export interface FinancialChartData {
  month: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export interface MemberDistributionData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface BirthdayPerson {
  id: string;
  nome: string;
  dataNascimento: Date;
  telefone: string;
  email: string;
  idade: number;
  isToday?: boolean;
}

export interface DashboardNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
  data?: any;
}

export interface RecentActivity {
  id: string;
  type: 'pessoa' | 'grupo' | 'evento' | 'financeiro' | 'patrimonio';
  action: 'created' | 'updated' | 'deleted';
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
  relatedId: string;
}

export interface AllDashboardData {
  stats: DashboardStats;
  charts: {
    financialData: FinancialChartData[];
    membersDistribution: MemberDistributionData[];
  };
  upcomingEvents: any[];
  birthdays: {
    today: BirthdayPerson[];
    month: BirthdayPerson[];
  };
  notifications: DashboardNotification[];
  recentActivities: RecentActivity[];
  lastUpdated: Date;
}

export interface GetAllDashboardDataOptions {
  period?: 'month' | 'quarter' | 'year';
  eventsLimit?: number;
  activitiesLimit?: number;
}

class DashboardService {
  // Cache para otimização de performance
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  private static getCacheKey(key: string, params?: any): string {
    return params ? `${key}_${JSON.stringify(params)}` : key;
  }

  private static getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  private static setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private static clearCache(): void {
    this.cache.clear();
  }

  // Função auxiliar para calcular aniversariantes
  private static async getAniversariantes(startDate: Date, endDate: Date): Promise<BirthdayPerson[]> {
    const cacheKey = this.getCacheKey('birthdays', { startDate, endDate });
    const cached = this.getFromCache<BirthdayPerson[]>(cacheKey);
    if (cached) return cached;

    const pessoas = await prisma.pessoa.findMany({
      select: {
        id: true,
        nome: true,
        dataNascimento: true,
        telefone: true,
        email: true
      }
    });

    const aniversariantes = pessoas.filter(pessoa => {
      const nascimento = new Date(pessoa.dataNascimento);
      const mesNasc = nascimento.getMonth();
      const diaNasc = nascimento.getDate();
      
      const mesInicio = startDate.getMonth();
      const diaInicio = startDate.getDate();
      const mesFim = endDate.getMonth();
      const diaFim = endDate.getDate();

      if (mesInicio === mesFim) {
        return mesNasc === mesInicio && diaNasc >= diaInicio && diaNasc <= diaFim;
      } else {
        return (mesNasc === mesInicio && diaNasc >= diaInicio) || 
               (mesNasc === mesFim && diaNasc <= diaFim) ||
               (mesNasc > mesInicio && mesNasc < mesFim);
      }
    }).map(pessoa => ({
      ...pessoa,
      idade: new Date().getFullYear() - new Date(pessoa.dataNascimento).getFullYear(),
      isToday: this.isToday(new Date(pessoa.dataNascimento))
    }));

    this.setCache(cacheKey, aniversariantes);
    return aniversariantes;
  }

  private static isToday(date: Date): boolean {
    const today = new Date();
    const birthDate = new Date(date);
    return today.getMonth() === birthDate.getMonth() && 
           today.getDate() === birthDate.getDate();
  }

  // Função auxiliar para calcular tendências avançadas
  private static calcularTendencia(valorAtual: number, valorAnterior: number, period: string = 'mês anterior'): TrendData {
    if (valorAnterior === 0) {
      return { 
        direction: valorAtual > 0 ? 'up' : 'stable', 
        percentage: 0, 
        period 
      };
    }
    
    const diferenca = valorAtual - valorAnterior;
    const percentage = Math.abs((diferenca / valorAnterior) * 100);
    
    // Considerar mudanças menores que 5% como estáveis
    const direction = Math.abs(percentage) < 5 ? 'stable' : 
                     diferenca > 0 ? 'up' : 'down';
    
    return {
      direction,
      percentage: Math.round(percentage * 100) / 100,
      period
    };
  }

  // Função para calcular estatísticas avançadas de membros
  private static async calcularEstatisticasMembros(): Promise<{
    crescimentoMensal: number;
    mediaIdade: number;
    distribuicaoGenero: { masculino: number; feminino: number };
    novosMembrosMes: number;
    taxaRetencao: number;
  }> {
    const cacheKey = 'advanced_member_stats';
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    const agora = new Date();
    const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0);
    const seiseMesesAtras = new Date(agora.getFullYear(), agora.getMonth() - 6, 1);

    const [
      totalAtual,
      totalAnterior,
      novosMembrosMes,
      pessoas,
      membrosAtivos
    ] = await Promise.all([
      prisma.pessoa.count(),
      prisma.pessoa.count({
        where: { dataIngresso: { lt: inicioMesAtual } }
      }),
      prisma.pessoa.count({
        where: { 
          dataIngresso: { 
            gte: inicioMesAtual,
            lt: new Date(agora.getFullYear(), agora.getMonth() + 1, 1)
          }
        }
      }),
      prisma.pessoa.findMany({
        select: {
          dataNascimento: true,
          genero: true,
          dataIngresso: true
        }
      }),
      prisma.pessoa.count({
        where: { dataIngresso: { gte: seiseMesesAtras } }
      })
    ]);

    // Calcular crescimento mensal
    const crescimentoMensal = totalAtual - totalAnterior;

    // Calcular média de idade
    const idades = pessoas.map(p => 
      new Date().getFullYear() - new Date(p.dataNascimento).getFullYear()
    );
    const mediaIdade = idades.length > 0 ? 
      Math.round(idades.reduce((sum, idade) => sum + idade, 0) / idades.length) : 0;

    // Distribuição por gênero
    const distribuicaoGenero = pessoas.reduce((acc, pessoa) => {
      const genero = pessoa.genero?.toLowerCase();
      if (genero === 'masculino' || genero === 'm') acc.masculino++;
      else if (genero === 'feminino' || genero === 'f') acc.feminino++;
      return acc;
    }, { masculino: 0, feminino: 0 });

    // Taxa de retenção (membros ativos dos últimos 6 meses)
    const taxaRetencao = totalAtual > 0 ? 
      Math.round((membrosAtivos / totalAtual) * 100) : 0;

    const stats = {
      crescimentoMensal,
      mediaIdade,
      distribuicaoGenero,
      novosMembrosMes,
      taxaRetencao
    };

    this.setCache(cacheKey, stats);
    return stats;
  }

  // Função para calcular métricas financeiras avançadas
  private static async calcularMetricasFinanceiras(): Promise<{
    receitaMedia: number;
    despesaMedia: number;
    maiorReceita: number;
    maiorDespesa: number;
    categoriasMaisGastam: Array<{ categoria: string; total: number }>;
    projecaoMensal: { receitas: number; despesas: number; saldo: number };
  }> {
    const cacheKey = 'advanced_financial_metrics';
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    const agora = new Date();
    const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const ultimosTresMeses = new Date(agora.getFullYear(), agora.getMonth() - 3, 1);

    const [
      receitasMes,
      despesasMes,
      receitasUltimosTresMeses,
      despesasUltimosTresMeses,
      despesasPorCategoria
    ] = await Promise.all([
      // Receitas do mês atual
      prisma.lancamentoFinanceiro.findMany({
        where: {
          tipo: 'Receita',
          data: { gte: inicioMesAtual }
        },
        select: { valor: true }
      }),

      // Despesas do mês atual
      prisma.lancamentoFinanceiro.findMany({
        where: {
          tipo: 'Despesa',
          data: { gte: inicioMesAtual }
        },
        select: { valor: true }
      }),

      // Receitas dos últimos 3 meses
      prisma.lancamentoFinanceiro.aggregate({
        where: {
          tipo: 'Receita',
          data: { gte: ultimosTresMeses }
        },
        _avg: { valor: true },
        _sum: { valor: true }
      }),

      // Despesas dos últimos 3 meses
      prisma.lancamentoFinanceiro.aggregate({
        where: {
          tipo: 'Despesa',
          data: { gte: ultimosTresMeses }
        },
        _avg: { valor: true },
        _sum: { valor: true }
      }),

      // Despesas por categoria
      prisma.lancamentoFinanceiro.groupBy({
        by: ['categoria'],
        where: {
          tipo: 'Despesa',
          data: { gte: ultimosTresMeses }
        },
        _sum: { valor: true },
        orderBy: { _sum: { valor: 'desc' } },
        take: 5
      })
    ]);

    const receitaMedia = receitasUltimosTresMeses._avg.valor || 0;
    const despesaMedia = despesasUltimosTresMeses._avg.valor || 0;
    
    const maiorReceita = receitasMes.length > 0 ? 
      Math.max(...receitasMes.map(r => r.valor)) : 0;
    const maiorDespesa = despesasMes.length > 0 ? 
      Math.max(...despesasMes.map(d => d.valor)) : 0;

    const categoriasMaisGastam = despesasPorCategoria.map(cat => ({
      categoria: cat.categoria,
      total: cat._sum.valor || 0
    }));

    // Projeção baseada na média dos últimos 3 meses
    const diasNoMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate();
    const diasPassados = agora.getDate();
    const fatorProjecao = diasNoMes / diasPassados;

    const receitasAtuais = receitasMes.reduce((sum, r) => sum + r.valor, 0);
    const despesasAtuais = despesasMes.reduce((sum, d) => sum + d.valor, 0);

    const projecaoMensal = {
      receitas: Math.round(receitasAtuais * fatorProjecao),
      despesas: Math.round(despesasAtuais * fatorProjecao),
      saldo: Math.round((receitasAtuais - despesasAtuais) * fatorProjecao)
    };

    const metrics = {
      receitaMedia: Math.round(receitaMedia),
      despesaMedia: Math.round(despesaMedia),
      maiorReceita,
      maiorDespesa,
      categoriasMaisGastam,
      projecaoMensal
    };

    this.setCache(cacheKey, metrics);
    return metrics;
  }

  // Obter estatísticas gerais do dashboard
  static async getDashboardStats(): Promise<DashboardStats> {
    const cacheKey = 'dashboard_stats';
    const cached = this.getFromCache<DashboardStats>(cacheKey);
    if (cached) return cached;

    const agora = new Date();
    const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0);
    const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    const fimHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);

    // Executar todas as consultas em paralelo para melhor performance
    const [
      totalPessoas,
      pessoasAtivas,
      pessoasAnterior,
      totalGrupos,
      gruposAtivos,
      totalEventos,
      receitasMesAtual,
      despesasMesAtual,
      receitasMesAnterior,
      despesasMesAnterior,
      aniversariantesHoje,
      aniversariantesMes
    ] = await Promise.all([
      // Total de pessoas
      prisma.pessoa.count(),
      
      // Pessoas ativas (cadastradas nos últimos 6 meses)
      prisma.pessoa.count({
        where: {
          dataIngresso: {
            gte: new Date(agora.getFullYear(), agora.getMonth() - 6, 1)
          }
        }
      }),

      // Pessoas do mês anterior (para tendência)
      prisma.pessoa.count({
        where: {
          dataIngresso: {
            lt: inicioMesAtual
          }
        }
      }),
      
      // Total de grupos
      prisma.grupo.count(),
      
      // Grupos ativos
      prisma.grupo.count({
        where: {
          status: 'ativo'
        }
      }),
      
      // Total de eventos
      prisma.evento.count(),
      
      // Receitas do mês atual
      prisma.lancamentoFinanceiro.aggregate({
        where: {
          tipo: 'Receita',
          data: { gte: inicioMesAtual }
        },
        _sum: { valor: true }
      }),
      
      // Despesas do mês atual
      prisma.lancamentoFinanceiro.aggregate({
        where: {
          tipo: 'Despesa',
          data: { gte: inicioMesAtual }
        },
        _sum: { valor: true }
      }),
      
      // Receitas do mês anterior
      prisma.lancamentoFinanceiro.aggregate({
        where: {
          tipo: 'Receita',
          data: {
            gte: inicioMesAnterior,
            lte: fimMesAnterior
          }
        },
        _sum: { valor: true }
      }),
      
      // Despesas do mês anterior
      prisma.lancamentoFinanceiro.aggregate({
        where: {
          tipo: 'Despesa',
          data: {
            gte: inicioMesAnterior,
            lte: fimMesAnterior
          }
        },
        _sum: { valor: true }
      }),
      
      // Aniversariantes de hoje
      this.getAniversariantes(inicioHoje, fimHoje),
      
      // Aniversariantes do mês
      this.getAniversariantes(inicioMesAtual, new Date(agora.getFullYear(), agora.getMonth() + 1, 0))
    ]);

    const receitasAtual = receitasMesAtual._sum.valor || 0;
    const despesasAtual = despesasMesAtual._sum.valor || 0;
    const receitasAnterior = receitasMesAnterior._sum.valor || 0;
    const despesasAnterior = despesasMesAnterior._sum.valor || 0;
    const saldoAtual = receitasAtual - despesasAtual;
    const saldoAnterior = receitasAnterior - despesasAnterior;

    // Calcular tendências
    const stats: DashboardStats = {
      totalPessoas,
      pessoasAtivas,
      totalGrupos,
      gruposAtivos,
      totalEventos,
      receitasMes: receitasAtual,
      despesasMes: despesasAtual,
      saldoMes: saldoAtual,
      aniversariantesHoje: aniversariantesHoje.length,
      aniversariantesMes: aniversariantesMes.length,
      
      trends: {
        receitas: this.calcularTendencia(receitasAtual, receitasAnterior),
        despesas: this.calcularTendencia(despesasAtual, despesasAnterior),
        saldo: this.calcularTendencia(saldoAtual, saldoAnterior),
        membros: this.calcularTendencia(totalPessoas, pessoasAnterior)
      }
    };

    this.setCache(cacheKey, stats);
    return stats;
  }

  // Obter dados para gráficos
  static async getChartData(period: 'month' | 'quarter' | 'year' = 'month'): Promise<{
    financialData: FinancialChartData[];
    membersDistribution: MemberDistributionData[];
  }> {
    const cacheKey = this.getCacheKey('chart_data', { period });
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    const agora = new Date();
    let mesesAtras = 6;
    if (period === 'quarter') mesesAtras = 12;
    if (period === 'year') mesesAtras = 24;

    // Dados financeiros por mês
    const financialData: FinancialChartData[] = [];
    const financialPromises = [];

    for (let i = mesesAtras - 1; i >= 0; i--) {
      const mesData = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const proximoMes = new Date(agora.getFullYear(), agora.getMonth() - i + 1, 1);
      
      financialPromises.push(
        Promise.all([
          prisma.lancamentoFinanceiro.aggregate({
            where: {
              tipo: 'Receita',
              data: {
                gte: mesData,
                lt: proximoMes
              }
            },
            _sum: { valor: true }
          }),
          prisma.lancamentoFinanceiro.aggregate({
            where: {
              tipo: 'Despesa',
              data: {
                gte: mesData,
                lt: proximoMes
              }
            },
            _sum: { valor: true }
          })
        ]).then(([receitas, despesas]) => {
          const receitasValor = receitas._sum.valor || 0;
          const despesasValor = despesas._sum.valor || 0;

          return {
            month: mesData.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            receitas: receitasValor,
            despesas: despesasValor,
            saldo: receitasValor - despesasValor
          };
        })
      );
    }

    const [financialResults, pessoas] = await Promise.all([
      Promise.all(financialPromises),
      prisma.pessoa.findMany({
        select: {
          dataNascimento: true
        }
      })
    ]);

    financialData.push(...financialResults);

    // Distribuição de membros por faixa etária
    const distribuicaoIdades = pessoas.reduce((acc, pessoa) => {
      const idade = new Date().getFullYear() - new Date(pessoa.dataNascimento).getFullYear();
      
      let categoria = 'Adultos';
      if (idade < 12) categoria = 'Crianças';
      else if (idade < 18) categoria = 'Adolescentes';
      else if (idade < 30) categoria = 'Jovens';
      else if (idade >= 60) categoria = 'Idosos';
      
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const coresCategoria = {
      'Crianças': '#FF6B6B',
      'Adolescentes': '#4ECDC4',
      'Jovens': '#45B7D1',
      'Adultos': '#96CEB4',
      'Idosos': '#FFEAA7'
    };

    const membersDistribution: MemberDistributionData[] = Object.entries(distribuicaoIdades).map(([categoria, valor]) => ({
      name: categoria,
      value: valor,
      color: coresCategoria[categoria as keyof typeof coresCategoria] || '#95A5A6',
      percentage: Math.round((valor / pessoas.length) * 100)
    }));

    const result = { financialData, membersDistribution };
    this.setCache(cacheKey, result);
    return result;
  }

  // Obter próximos eventos
  static async getUpcomingEvents(limit: number = 5): Promise<any[]> {
    const cacheKey = this.getCacheKey('upcoming_events', { limit });
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    const agora = new Date();
    const eventos = await prisma.evento.findMany({
      where: {
        dataHora: {
          gte: agora
        }
      },
      orderBy: {
        dataHora: 'asc'
      },
      take: limit
    });

    const eventosFormatados = eventos.map(evento => ({
      ...evento,
      isToday: new Date(evento.dataHora).toDateString() === agora.toDateString(),
      timeUntil: Math.ceil((new Date(evento.dataHora).getTime() - agora.getTime()) / (1000 * 60 * 60 * 24))
    }));

    this.setCache(cacheKey, eventosFormatados);
    return eventosFormatados;
  }

  // Obter aniversariantes
  static async getBirthdays(type: 'today' | 'month' = 'month'): Promise<BirthdayPerson[]> {
    const agora = new Date();
    let startDate: Date, endDate: Date;

    if (type === 'today') {
      startDate = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
      endDate = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);
    } else {
      startDate = new Date(agora.getFullYear(), agora.getMonth(), 1);
      endDate = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
    }

    const aniversariantes = await this.getAniversariantes(startDate, endDate);

    // Ordenar por data de aniversário mais próxima
    return aniversariantes.sort((a, b) => {
      const nascA = new Date(a.dataNascimento);
      const nascB = new Date(b.dataNascimento);
      
      // Ajustar para o ano atual
      nascA.setFullYear(agora.getFullYear());
      nascB.setFullYear(agora.getFullYear());
      
      // Se já passou este ano, considerar o próximo ano
      if (nascA < agora) nascA.setFullYear(agora.getFullYear() + 1);
      if (nascB < agora) nascB.setFullYear(agora.getFullYear() + 1);
      
      return nascA.getTime() - nascB.getTime();
    });
  }

  // Obter notificações do dashboard
  static async getNotifications(): Promise<DashboardNotification[]> {
    const cacheKey = 'dashboard_notifications';
    const cached = this.getFromCache<DashboardNotification[]>(cacheKey);
    if (cached) return cached;

    const agora = new Date();
    const notifications: DashboardNotification[] = [];

    // Executar verificações em paralelo
    const [eventosHoje, aniversariantesHoje, dadosFinanceiros] = await Promise.all([
      // Verificar eventos de hoje
      prisma.evento.count({
        where: {
          dataHora: {
            gte: new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()),
            lt: new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1)
          }
        }
      }),

      // Verificar aniversariantes de hoje
      this.getAniversariantes(
        new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()),
        new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59)
      ),

      // Verificar dados financeiros
      Promise.all([
        prisma.lancamentoFinanceiro.aggregate({
          where: {
            tipo: 'Receita',
            data: { gte: new Date(agora.getFullYear(), agora.getMonth(), 1) }
          },
          _sum: { valor: true }
        }),
        prisma.lancamentoFinanceiro.aggregate({
          where: {
            tipo: 'Despesa',
            data: { gte: new Date(agora.getFullYear(), agora.getMonth(), 1) }
          },
          _sum: { valor: true }
        })
      ])
    ]);

    // Processar notificações
    if (eventosHoje > 0) {
      notifications.push({
        id: 'eventos-hoje',
        type: 'info',
        title: 'Eventos Hoje',
        message: `Você tem ${eventosHoje} evento(s) programado(s) para hoje`,
        priority: 'high',
        action: '/agenda'
      });
    }

    if (aniversariantesHoje.length > 0) {
      notifications.push({
        id: 'aniversarios-hoje',
        type: 'success',
        title: 'Aniversários Hoje',
        message: `${aniversariantesHoje.length} pessoa(s) fazem aniversário hoje`,
        priority: 'medium',
        action: '/pessoas',
        data: aniversariantesHoje
      });
    }

    const [receitas, despesas] = dadosFinanceiros;
    const saldo = (receitas._sum.valor || 0) - (despesas._sum.valor || 0);
    if (saldo < 0) {
      notifications.push({
        id: 'saldo-negativo',
        type: 'warning',
        title: 'Saldo Negativo',
        message: `O saldo do mês está negativo: R$ ${saldo.toFixed(2)}`,
        priority: 'high',
        action: '/financeiro'
      });
    }

    // Ordenar por prioridade
    const prioridades = { high: 3, medium: 2, low: 1 };
    notifications.sort((a, b) => prioridades[b.priority as keyof typeof prioridades] - prioridades[a.priority as keyof typeof prioridades]);

    this.setCache(cacheKey, notifications);
    return notifications;
  }

  // Limpar cache (útil para atualizações forçadas)
  static clearDashboardCache(): void {
    this.clearCache();
  }

  // Pré-aquecer o cache com dados essenciais
  static async warmupCache(): Promise<void> {
    try {
      console.log('🔥 Warming up dashboard cache...');
      
      // Executar em paralelo para máxima eficiência
      await Promise.all([
        this.getDashboardStats(),
        this.getChartData('month'),
        this.getUpcomingEvents(5),
        this.getBirthdays('month'),
        this.getNotifications(),
        this.getRecentActivities(10)
      ]);
      
      console.log('✅ Dashboard cache warmed up successfully');
    } catch (error) {
      console.error('❌ Failed to warm up dashboard cache:', error);
    }
  }

  // Verificar saúde do cache e limpar entradas expiradas
  static cleanupExpiredCache(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  // Obter atividades recentes
  static async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    const cacheKey = this.getCacheKey('recent_activities', { limit });
    const cached = this.getFromCache<RecentActivity[]>(cacheKey);
    if (cached) return cached;

    const agora = new Date();
    const umaSemanaAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Buscar atividades recentes de diferentes entidades
    const [pessoas, eventos, lancamentos] = await Promise.all([
      // Pessoas recentes
      prisma.pessoa.findMany({
        where: {
          dataIngresso: { gte: umaSemanaAtras }
        },
        orderBy: { dataIngresso: 'desc' },
        take: Math.ceil(limit / 2),
        select: {
          id: true,
          nome: true,
          dataIngresso: true
        }
      }),

      // Eventos recentes
      prisma.evento.findMany({
        where: {
          dataHora: { gte: umaSemanaAtras }
        },
        orderBy: { dataHora: 'desc' },
        take: Math.ceil(limit / 3),
        select: {
          id: true,
          titulo: true,
          dataHora: true
        }
      }),

      // Lançamentos financeiros recentes
      prisma.lancamentoFinanceiro.findMany({
        where: {
          data: { gte: umaSemanaAtras }
        },
        orderBy: { data: 'desc' },
        take: Math.ceil(limit / 3),
        select: {
          id: true,
          tipo: true,
          valor: true,
          categoria: true,
          data: true
        }
      })
    ]);

    const activities: RecentActivity[] = [];

    // Processar pessoas
    pessoas.forEach(pessoa => {
      activities.push({
        id: `pessoa-${pessoa.id}`,
        type: 'pessoa',
        action: 'created',
        title: 'Nova Pessoa Cadastrada',
        description: `${pessoa.nome} foi cadastrado(a) no sistema`,
        timestamp: pessoa.dataIngresso,
        relatedId: pessoa.id
      });
    });

    // Processar eventos
    eventos.forEach(evento => {
      activities.push({
        id: `evento-${evento.id}`,
        type: 'evento',
        action: 'created',
        title: 'Novo Evento Criado',
        description: `Evento "${evento.titulo}" foi agendado`,
        timestamp: evento.dataHora,
        relatedId: evento.id
      });
    });

    // Processar lançamentos financeiros
    lancamentos.forEach(lancamento => {
      activities.push({
        id: `financeiro-${lancamento.id}`,
        type: 'financeiro',
        action: 'created',
        title: `${lancamento.tipo} Registrada`,
        description: `${lancamento.tipo} de R$ ${lancamento.valor.toFixed(2)} - ${lancamento.categoria}`,
        timestamp: lancamento.data,
        relatedId: lancamento.id
      });
    });

    // Ordenar por timestamp mais recente e limitar
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const limitedActivities = activities.slice(0, limit);

    this.setCache(cacheKey, limitedActivities);
    return limitedActivities;
  }

  // Obter todos os dados do dashboard em uma única requisição (otimizado)
  static async getAllDashboardData(options: GetAllDashboardDataOptions = {}): Promise<AllDashboardData> {
    const {
      period = 'month',
      eventsLimit = 5,
      activitiesLimit = 10
    } = options;

    const cacheKey = this.getCacheKey('all_dashboard_data', options);
    const cached = this.getFromCache<AllDashboardData>(cacheKey);
    if (cached) return cached;

    // Executar todas as consultas em paralelo para máxima performance
    const [
      stats,
      chartData,
      upcomingEvents,
      birthdaysToday,
      birthdaysMonth,
      notifications,
      recentActivities
    ] = await Promise.all([
      this.getDashboardStats(),
      this.getChartData(period),
      this.getUpcomingEvents(eventsLimit),
      this.getBirthdays('today'),
      this.getBirthdays('month'),
      this.getNotifications(),
      this.getRecentActivities(activitiesLimit)
    ]);

    const allData: AllDashboardData = {
      stats,
      charts: chartData,
      upcomingEvents,
      birthdays: {
        today: birthdaysToday,
        month: birthdaysMonth
      },
      notifications,
      recentActivities,
      lastUpdated: new Date()
    };

    this.setCache(cacheKey, allData);
    return allData;
  }

  // Obter estatísticas de performance do cache
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Obter estatísticas avançadas de membros
  static async getAdvancedMemberStats() {
    return await this.calcularEstatisticasMembros();
  }

  // Obter métricas financeiras avançadas
  static async getAdvancedFinancialMetrics() {
    return await this.calcularMetricasFinanceiras();
  }

  // Invalidar cache específico por tipo
  static invalidateCache(type: 'stats' | 'charts' | 'events' | 'birthdays' | 'notifications' | 'activities' | 'all'): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(type)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries for type: ${type}`);
  }

  // Obter estatísticas de uso do sistema
  static async getSystemUsageStats(): Promise<{
    totalUsuarios: number;
    usuariosAtivos: number;
    modulosMaisUsados: Array<{ modulo: string; uso: number }>;
    horariosAtividade: Array<{ hora: number; atividade: number }>;
  }> {
    const cacheKey = 'system_usage_stats';
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    // Para este exemplo, vamos simular dados de uso
    // Em uma implementação real, você teria tabelas de log de atividades
    const stats = {
      totalUsuarios: 25,
      usuariosAtivos: 18,
      modulosMaisUsados: [
        { modulo: 'Pessoas', uso: 45 },
        { modulo: 'Financeiro', uso: 32 },
        { modulo: 'Eventos', uso: 28 },
        { modulo: 'Grupos', uso: 22 },
        { modulo: 'Patrimônio', uso: 15 }
      ],
      horariosAtividade: Array.from({ length: 24 }, (_, hora) => ({
        hora,
        atividade: Math.floor(Math.random() * 20) + (hora >= 8 && hora <= 18 ? 30 : 5)
      }))
    };

    this.setCache(cacheKey, stats);
    return stats;
  }
}

export default DashboardService;
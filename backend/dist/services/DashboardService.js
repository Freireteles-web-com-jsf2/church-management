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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class DashboardService {
    static getCacheKey(key, params) {
        return params ? `${key}_${JSON.stringify(params)}` : key;
    }
    static getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data;
        }
        return null;
    }
    static setCache(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
    }
    static clearCache() {
        this.cache.clear();
    }
    // Função auxiliar para calcular aniversariantes
    static getAniversariantes(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = this.getCacheKey('birthdays', { startDate, endDate });
            const cached = this.getFromCache(cacheKey);
            if (cached)
                return cached;
            const pessoas = yield prisma.pessoa.findMany({
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
                }
                else {
                    return (mesNasc === mesInicio && diaNasc >= diaInicio) ||
                        (mesNasc === mesFim && diaNasc <= diaFim) ||
                        (mesNasc > mesInicio && mesNasc < mesFim);
                }
            }).map(pessoa => (Object.assign(Object.assign({}, pessoa), { idade: new Date().getFullYear() - new Date(pessoa.dataNascimento).getFullYear(), isToday: this.isToday(new Date(pessoa.dataNascimento)) })));
            this.setCache(cacheKey, aniversariantes);
            return aniversariantes;
        });
    }
    static isToday(date) {
        const today = new Date();
        const birthDate = new Date(date);
        return today.getMonth() === birthDate.getMonth() &&
            today.getDate() === birthDate.getDate();
    }
    // Função auxiliar para calcular tendências avançadas
    static calcularTendencia(valorAtual, valorAnterior, period = 'mês anterior') {
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
    static calcularEstatisticasMembros() {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = 'advanced_member_stats';
            const cached = this.getFromCache(cacheKey);
            if (cached)
                return cached;
            const agora = new Date();
            const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);
            const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
            const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0);
            const seiseMesesAtras = new Date(agora.getFullYear(), agora.getMonth() - 6, 1);
            const [totalAtual, totalAnterior, novosMembrosMes, pessoas, membrosAtivos] = yield Promise.all([
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
            const idades = pessoas.map(p => new Date().getFullYear() - new Date(p.dataNascimento).getFullYear());
            const mediaIdade = idades.length > 0 ?
                Math.round(idades.reduce((sum, idade) => sum + idade, 0) / idades.length) : 0;
            // Distribuição por gênero
            const distribuicaoGenero = pessoas.reduce((acc, pessoa) => {
                var _a;
                const genero = (_a = pessoa.genero) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                if (genero === 'masculino' || genero === 'm')
                    acc.masculino++;
                else if (genero === 'feminino' || genero === 'f')
                    acc.feminino++;
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
        });
    }
    // Função para calcular métricas financeiras avançadas
    static calcularMetricasFinanceiras() {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = 'advanced_financial_metrics';
            const cached = this.getFromCache(cacheKey);
            if (cached)
                return cached;
            const agora = new Date();
            const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);
            const ultimosTresMeses = new Date(agora.getFullYear(), agora.getMonth() - 3, 1);
            const [receitasMes, despesasMes, receitasUltimosTresMeses, despesasUltimosTresMeses, despesasPorCategoria] = yield Promise.all([
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
        });
    }
    // Obter estatísticas gerais do dashboard
    static getDashboardStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = 'dashboard_stats';
            const cached = this.getFromCache(cacheKey);
            if (cached)
                return cached;
            const agora = new Date();
            const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);
            const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
            const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0);
            const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
            const fimHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);
            // Executar todas as consultas em paralelo para melhor performance
            const [totalPessoas, pessoasAtivas, pessoasAnterior, totalGrupos, gruposAtivos, totalEventos, receitasMesAtual, despesasMesAtual, receitasMesAnterior, despesasMesAnterior, aniversariantesHoje, aniversariantesMes] = yield Promise.all([
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
            const stats = {
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
        });
    }
    // Obter dados para gráficos
    static getChartData() {
        return __awaiter(this, arguments, void 0, function* (period = 'month') {
            const cacheKey = this.getCacheKey('chart_data', { period });
            const cached = this.getFromCache(cacheKey);
            if (cached)
                return cached;
            const agora = new Date();
            let mesesAtras = 6;
            if (period === 'quarter')
                mesesAtras = 12;
            if (period === 'year')
                mesesAtras = 24;
            // Dados financeiros por mês
            const financialData = [];
            const financialPromises = [];
            for (let i = mesesAtras - 1; i >= 0; i--) {
                const mesData = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
                const proximoMes = new Date(agora.getFullYear(), agora.getMonth() - i + 1, 1);
                financialPromises.push(Promise.all([
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
                }));
            }
            const [financialResults, pessoas] = yield Promise.all([
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
                if (idade < 12)
                    categoria = 'Crianças';
                else if (idade < 18)
                    categoria = 'Adolescentes';
                else if (idade < 30)
                    categoria = 'Jovens';
                else if (idade >= 60)
                    categoria = 'Idosos';
                acc[categoria] = (acc[categoria] || 0) + 1;
                return acc;
            }, {});
            const coresCategoria = {
                'Crianças': '#FF6B6B',
                'Adolescentes': '#4ECDC4',
                'Jovens': '#45B7D1',
                'Adultos': '#96CEB4',
                'Idosos': '#FFEAA7'
            };
            const membersDistribution = Object.entries(distribuicaoIdades).map(([categoria, valor]) => ({
                name: categoria,
                value: valor,
                color: coresCategoria[categoria] || '#95A5A6',
                percentage: Math.round((valor / pessoas.length) * 100)
            }));
            const result = { financialData, membersDistribution };
            this.setCache(cacheKey, result);
            return result;
        });
    }
    // Obter próximos eventos
    static getUpcomingEvents() {
        return __awaiter(this, arguments, void 0, function* (limit = 5) {
            const cacheKey = this.getCacheKey('upcoming_events', { limit });
            const cached = this.getFromCache(cacheKey);
            if (cached)
                return cached;
            const agora = new Date();
            const eventos = yield prisma.evento.findMany({
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
            const eventosFormatados = eventos.map(evento => (Object.assign(Object.assign({}, evento), { isToday: new Date(evento.dataHora).toDateString() === agora.toDateString(), timeUntil: Math.ceil((new Date(evento.dataHora).getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)) })));
            this.setCache(cacheKey, eventosFormatados);
            return eventosFormatados;
        });
    }
    // Obter aniversariantes
    static getBirthdays() {
        return __awaiter(this, arguments, void 0, function* (type = 'month') {
            const agora = new Date();
            let startDate, endDate;
            if (type === 'today') {
                startDate = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
                endDate = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);
            }
            else {
                startDate = new Date(agora.getFullYear(), agora.getMonth(), 1);
                endDate = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
            }
            const aniversariantes = yield this.getAniversariantes(startDate, endDate);
            // Ordenar por data de aniversário mais próxima
            return aniversariantes.sort((a, b) => {
                const nascA = new Date(a.dataNascimento);
                const nascB = new Date(b.dataNascimento);
                // Ajustar para o ano atual
                nascA.setFullYear(agora.getFullYear());
                nascB.setFullYear(agora.getFullYear());
                // Se já passou este ano, considerar o próximo ano
                if (nascA < agora)
                    nascA.setFullYear(agora.getFullYear() + 1);
                if (nascB < agora)
                    nascB.setFullYear(agora.getFullYear() + 1);
                return nascA.getTime() - nascB.getTime();
            });
        });
    }
    // Obter notificações do dashboard
    static getNotifications() {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = 'dashboard_notifications';
            const cached = this.getFromCache(cacheKey);
            if (cached)
                return cached;
            const agora = new Date();
            const notifications = [];
            // Executar verificações em paralelo
            const [eventosHoje, aniversariantesHoje, dadosFinanceiros] = yield Promise.all([
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
                this.getAniversariantes(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()), new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59)),
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
            notifications.sort((a, b) => prioridades[b.priority] - prioridades[a.priority]);
            this.setCache(cacheKey, notifications);
            return notifications;
        });
    }
    // Limpar cache (útil para atualizações forçadas)
    static clearDashboardCache() {
        this.clearCache();
    }
    // Pré-aquecer o cache com dados essenciais
    static warmupCache() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔥 Warming up dashboard cache...');
                // Executar em paralelo para máxima eficiência
                yield Promise.all([
                    this.getDashboardStats(),
                    this.getChartData('month'),
                    this.getUpcomingEvents(5),
                    this.getBirthdays('month'),
                    this.getNotifications(),
                    this.getRecentActivities(10)
                ]);
                console.log('✅ Dashboard cache warmed up successfully');
            }
            catch (error) {
                console.error('❌ Failed to warm up dashboard cache:', error);
            }
        });
    }
    // Verificar saúde do cache e limpar entradas expiradas
    static cleanupExpiredCache() {
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
    static getRecentActivities() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            const cacheKey = this.getCacheKey('recent_activities', { limit });
            const cached = this.getFromCache(cacheKey);
            if (cached)
                return cached;
            const agora = new Date();
            const umaSemanaAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
            // Buscar atividades recentes de diferentes entidades
            const [pessoas, eventos, lancamentos] = yield Promise.all([
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
            const activities = [];
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
        });
    }
    // Obter todos os dados do dashboard em uma única requisição (otimizado)
    static getAllDashboardData() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
            const { period = 'month', eventsLimit = 5, activitiesLimit = 10 } = options;
            const cacheKey = this.getCacheKey('all_dashboard_data', options);
            const cached = this.getFromCache(cacheKey);
            if (cached)
                return cached;
            // Executar todas as consultas em paralelo para máxima performance
            const [stats, chartData, upcomingEvents, birthdaysToday, birthdaysMonth, notifications, recentActivities] = yield Promise.all([
                this.getDashboardStats(),
                this.getChartData(period),
                this.getUpcomingEvents(eventsLimit),
                this.getBirthdays('today'),
                this.getBirthdays('month'),
                this.getNotifications(),
                this.getRecentActivities(activitiesLimit)
            ]);
            const allData = {
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
        });
    }
    // Obter estatísticas de performance do cache
    static getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
    // Obter estatísticas avançadas de membros
    static getAdvancedMemberStats() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.calcularEstatisticasMembros();
        });
    }
    // Obter métricas financeiras avançadas
    static getAdvancedFinancialMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.calcularMetricasFinanceiras();
        });
    }
    // Invalidar cache específico por tipo
    static invalidateCache(type) {
        const keysToDelete = [];
        for (const key of this.cache.keys()) {
            if (key.includes(type)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
        console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries for type: ${type}`);
    }
    // Obter estatísticas de uso do sistema
    static getSystemUsageStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = 'system_usage_stats';
            const cached = this.getFromCache(cacheKey);
            if (cached)
                return cached;
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
        });
    }
}
// Cache para otimização de performance
DashboardService.cache = new Map();
DashboardService.CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
exports.default = DashboardService;

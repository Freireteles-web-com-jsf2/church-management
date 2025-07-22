import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import Layout from '../../components/Layout/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { EmptyState } from '../../components/EmptyState';
import axios from 'axios';

interface DashboardStats {
  totalPessoas: number;
  totalGrupos: number;
  totalEventos: number;
  receitasMes: number;
  despesasMes: number;
  saldoMes: number;
}

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const StatCard = styled.div<{ color?: string }>`
  background: ${theme.colors.white};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  border-left: 4px solid ${({ color }) => color || theme.colors.primary};
  transition: transform ${theme.transitions.normal};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: ${theme.spacing.md};
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primaryDark};
  margin-bottom: ${theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.textLight};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: ${theme.colors.white};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
`;

const ChartTitle = styled.h3`
  color: ${theme.colors.primaryDark};
  margin-bottom: ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.xl};
`;

const WidgetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
`;

const WidgetCard = styled.div`
  background: ${theme.colors.white};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
`;

const WidgetTitle = styled.h4`
  color: ${theme.colors.primaryDark};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.lg};
`;

const AniversariantesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const AniversarianteItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.grayLight};
`;

const AniversarianteAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeight.bold};
`;

const AniversarianteInfo = styled.div`
  flex: 1;
`;

const AniversarianteName = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text};
`;

const AniversarianteDate = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textLight};
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const NotificationItem = styled.div<{ type: 'info' | 'warning' | 'success' }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border-left: 4px solid ${({ type }) => {
    switch (type) {
      case 'warning': return theme.colors.warning;
      case 'success': return theme.colors.success;
      default: return theme.colors.info;
    }
  }};
  background: ${({ type }) => {
    switch (type) {
      case 'warning': return '#FFF8E1';
      case 'success': return '#E8F5E8';
      default: return '#E3F2FD';
    }
  }};
`;

const NotificationText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${theme.colors.textLight};
`;

const ErrorContainer = styled.div`
  background: ${theme.colors.white};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  text-align: center;
  color: ${theme.colors.danger};
`;

const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const getAuthHeaders = () => {
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
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard/stats`, {
        headers: getAuthHeaders()
      });
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
      setError('Erro ao carregar estatísticas do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Dados mockados para os gráficos (em produção, viriam da API)
  // Simular cenários com dados insuficientes baseado nas estatísticas
  const hasFinancialData = stats && (stats.receitasMes > 0 || stats.despesasMes > 0);
  const hasGroupsData = stats && stats.totalGrupos > 0;

  const financeiroData = hasFinancialData ? [
    { mes: 'Jan', receitas: 15000, despesas: 8000 },
    { mes: 'Fev', receitas: 18000, despesas: 9500 },
    { mes: 'Mar', receitas: 22000, despesas: 11000 },
    { mes: 'Abr', receitas: 19000, despesas: 10200 },
    { mes: 'Mai', receitas: 25000, despesas: 12000 },
    { mes: 'Jun', receitas: 28000, despesas: 13500 },
  ] : [];

  const gruposData = hasGroupsData ? [
    { name: 'Jovens', value: 35, color: '#4A90E2' },
    { name: 'Adultos', value: 45, color: '#5DADE2' },
    { name: 'Crianças', value: 25, color: '#85C1E9' },
    { name: 'Idosos', value: 15, color: '#AED6F1' },
  ] : [];

  const aniversariantes = [
    { nome: 'Maria Silva', data: '15/07', iniciais: 'MS' },
    { nome: 'João Santos', data: '18/07', iniciais: 'JS' },
    { nome: 'Ana Costa', data: '22/07', iniciais: 'AC' },
    { nome: 'Pedro Lima', data: '25/07', iniciais: 'PL' },
  ];

  const notificacoes = [
    { tipo: 'info' as const, texto: 'Reunião de líderes agendada para quinta-feira' },
    { tipo: 'warning' as const, texto: 'Vencimento do aluguel em 3 dias' },
    { tipo: 'success' as const, texto: 'Meta de arrecadação do mês atingida!' },
    { tipo: 'info' as const, texto: '5 novos membros cadastrados esta semana' },
  ];

  if (loading) {
    return (
      <Layout>
        <LoadingContainer>
          <div>Carregando estatísticas...</div>
        </LoadingContainer>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorContainer>
          <h3>Erro ao carregar dashboard</h3>
          <p>{error}</p>
          <button onClick={fetchDashboardStats}>Tentar novamente</button>
        </ErrorContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <DashboardContainer>
        {/* Cards de Estatísticas */}
        <StatsGrid>
          <StatCard color={theme.colors.primary}>
            <StatIcon>👥</StatIcon>
            <StatValue>{stats?.totalPessoas || 0}</StatValue>
            <StatLabel>Total de Membros</StatLabel>
          </StatCard>
          
          <StatCard color={theme.colors.info}>
            <StatIcon>🏠</StatIcon>
            <StatValue>{stats?.totalGrupos || 0}</StatValue>
            <StatLabel>Grupos Ativos</StatLabel>
          </StatCard>
          
          <StatCard color={theme.colors.warning}>
            <StatIcon>📅</StatIcon>
            <StatValue>{stats?.totalEventos || 0}</StatValue>
            <StatLabel>Eventos do Mês</StatLabel>
          </StatCard>
          
          <StatCard color={stats && stats.saldoMes >= 0 ? theme.colors.success : theme.colors.danger}>
            <StatIcon>💰</StatIcon>
            <StatValue>
              R$ {stats?.saldoMes ? Math.abs(stats.saldoMes).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
            </StatValue>
            <StatLabel>Saldo do Mês</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Gráficos */}
        <ChartsGrid>
          <ChartCard>
            <ChartTitle>📊 Fluxo Financeiro (Últimos 6 meses)</ChartTitle>
            {financeiroData.length === 0 ? (
              <EmptyState
                icon="💰"
                title="Nenhum dado financeiro disponível"
                description="Adicione lançamentos financeiros para visualizar o gráfico de fluxo de caixa e acompanhar receitas e despesas."
                actionText="Ir para Financeiro"
                actionLink="/financeiro"
              />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financeiroData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']} />
                  <Bar dataKey="receitas" fill={theme.colors.success} name="Receitas" />
                  <Bar dataKey="despesas" fill={theme.colors.danger} name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard>
            <ChartTitle>👥 Distribuição por Grupos</ChartTitle>
            {gruposData.length === 0 ? (
              <EmptyState
                icon="👥"
                title="Nenhum grupo cadastrado"
                description="Crie grupos para organizar os membros da igreja e visualizar a distribuição por faixa etária."
                actionText="Criar Grupo"
                actionLink="/grupos"
              />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gruposData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {gruposData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </ChartsGrid>

        {/* Widgets */}
        <WidgetsGrid>
          <WidgetCard>
            <WidgetTitle>🎂 Aniversariantes do Mês</WidgetTitle>
            <AniversariantesList>
              {aniversariantes.map((aniversariante, index) => (
                <AniversarianteItem key={index}>
                  <AniversarianteAvatar>
                    {aniversariante.iniciais}
                  </AniversarianteAvatar>
                  <AniversarianteInfo>
                    <AniversarianteName>{aniversariante.nome}</AniversarianteName>
                    <AniversarianteDate>{aniversariante.data}</AniversarianteDate>
                  </AniversarianteInfo>
                </AniversarianteItem>
              ))}
            </AniversariantesList>
          </WidgetCard>

          <WidgetCard>
            <WidgetTitle>🔔 Notificações</WidgetTitle>
            <NotificationsList>
              {notificacoes.map((notificacao, index) => (
                <NotificationItem key={index} type={notificacao.tipo}>
                  <NotificationText>{notificacao.texto}</NotificationText>
                </NotificationItem>
              ))}
            </NotificationsList>
          </WidgetCard>
        </WidgetsGrid>
      </DashboardContainer>
    </Layout>
  );
};

export default DashboardStats;
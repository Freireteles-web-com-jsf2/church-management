import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { useDashboardContext } from '../../pages/Dashboard';

const WidgetContainer = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const WidgetTitle = styled.h3`
  color: ${theme.colors.primaryDark};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const StatItem = styled.div`
  background: ${theme.colors.grayLight};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  border-left: 4px solid ${theme.colors.primary};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textLight};
  margin-bottom: ${theme.spacing.xs};
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text};
`;

const StatTrend = styled.div<{ trend: 'up' | 'down' | 'stable' }>`
  font-size: ${theme.typography.fontSize.sm};
  color: ${({ trend }) => {
    switch (trend) {
      case 'up': return theme.colors.success;
      case 'down': return theme.colors.danger;
      default: return theme.colors.textLight;
    }
  }};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  margin-top: ${theme.spacing.xs};
`;

const VisitsList = styled.div`
  margin-top: ${theme.spacing.lg};
`;

const VisitItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.grayLight};
  
  &:last-child {
    border-bottom: none;
  }
`;

const VisitDate = styled.div`
  background: ${theme.colors.primary};
  color: white;
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const VisitDay = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const VisitInfo = styled.div`
  flex: 1;
`;

const VisitTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
`;

const VisitDetails = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textLight};
`;

const ActionButton = styled.button`
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  margin-left: ${theme.spacing.md};
  
  &:hover {
    background: ${theme.colors.primaryDark};
  }
`;

const LinkButton = styled.a`
  display: inline-block;
  background: ${theme.colors.primary};
  color: white;
  text-decoration: none;
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  margin-top: ${theme.spacing.md};
  margin-right: ${theme.spacing.md};
  
  &:hover {
    background: ${theme.colors.primaryDark};
  }
`;

const Badge = styled.span<{ type: 'scheduled' | 'completed' | 'urgent' }>`
  display: inline-block;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: ${theme.typography.fontSize.xs};
  background: ${({ type }) => {
    switch (type) {
      case 'scheduled': return 'rgba(52, 152, 219, 0.1)';
      case 'completed': return 'rgba(46, 204, 113, 0.1)';
      case 'urgent': return 'rgba(231, 76, 60, 0.1)';
    }
  }};
  color: ${({ type }) => {
    switch (type) {
      case 'scheduled': return theme.colors.info;
      case 'completed': return theme.colors.success;
      case 'urgent': return theme.colors.danger;
    }
  }};
  margin-left: ${theme.spacing.xs};
`;

export const PastorWidget: React.FC = () => {
  const { dashboardData, loading } = useDashboardContext();
  
  // Dados mockados para o widget do pastor
  const pastorData = {
    stats: {
      membrosAtivos: { value: 245, trend: 'up' as const, percentage: '+5%' },
      frequenciaMedia: { value: 180, trend: 'stable' as const, percentage: '0%' },
      visitantes: { value: 28, trend: 'up' as const, percentage: '+12%' },
      batismos: { value: 8, trend: 'up' as const, percentage: '+2' }
    },
    proximasVisitas: [
      { id: 1, name: 'Família Oliveira', date: '25/07', time: '15:00', address: 'Rua das Flores, 123', type: 'scheduled' as const },
      { id: 2, name: 'Sr. José Silva', date: '26/07', time: '10:00', address: 'Av. Principal, 456', type: 'urgent' as const },
      { id: 3, name: 'Dona Maria Santos', date: '27/07', time: '16:30', address: 'Rua dos Pássaros, 789', type: 'scheduled' as const },
      { id: 4, name: 'Família Costa', date: '28/07', time: '19:00', address: 'Rua das Palmeiras, 321', type: 'scheduled' as const }
    ],
    visitasRecentes: [
      { id: 5, name: 'Família Pereira', date: '20/07', time: '14:00', address: 'Rua dos Ipês, 567', type: 'completed' as const },
      { id: 6, name: 'Sr. Antônio Gomes', date: '19/07', time: '11:00', address: 'Av. Central, 890', type: 'completed' as const }
    ]
  };
  
  if (loading) {
    return (
      <WidgetContainer>
        <WidgetTitle>🙏 Painel Pastoral (Carregando...)</WidgetTitle>
      </WidgetContainer>
    );
  }
  
  return (
    <WidgetContainer>
      <WidgetTitle>🙏 Painel Pastoral</WidgetTitle>
      
      <h4>Estatísticas da Congregação</h4>
      <StatsGrid>
        <StatItem>
          <StatLabel>Membros Ativos</StatLabel>
          <StatValue>{pastorData.stats.membrosAtivos.value}</StatValue>
          <StatTrend trend={pastorData.stats.membrosAtivos.trend}>
            {pastorData.stats.membrosAtivos.trend === 'up' && '↑'}
            {pastorData.stats.membrosAtivos.trend === 'down' && '↓'}
            {pastorData.stats.membrosAtivos.trend === 'stable' && '→'}
            {pastorData.stats.membrosAtivos.percentage}
          </StatTrend>
        </StatItem>
        
        <StatItem>
          <StatLabel>Frequência Média</StatLabel>
          <StatValue>{pastorData.stats.frequenciaMedia.value}</StatValue>
          <StatTrend trend={pastorData.stats.frequenciaMedia.trend}>
            {pastorData.stats.frequenciaMedia.trend === 'up' && '↑'}
            {pastorData.stats.frequenciaMedia.trend === 'down' && '↓'}
            {pastorData.stats.frequenciaMedia.trend === 'stable' && '→'}
            {pastorData.stats.frequenciaMedia.percentage}
          </StatTrend>
        </StatItem>
        
        <StatItem>
          <StatLabel>Visitantes (Mês)</StatLabel>
          <StatValue>{pastorData.stats.visitantes.value}</StatValue>
          <StatTrend trend={pastorData.stats.visitantes.trend}>
            {pastorData.stats.visitantes.trend === 'up' && '↑'}
            {pastorData.stats.visitantes.trend === 'down' && '↓'}
            {pastorData.stats.visitantes.trend === 'stable' && '→'}
            {pastorData.stats.visitantes.percentage}
          </StatTrend>
        </StatItem>
        
        <StatItem>
          <StatLabel>Batismos (Ano)</StatLabel>
          <StatValue>{pastorData.stats.batismos.value}</StatValue>
          <StatTrend trend={pastorData.stats.batismos.trend}>
            {pastorData.stats.batismos.trend === 'up' && '↑'}
            {pastorData.stats.batismos.trend === 'down' && '↓'}
            {pastorData.stats.batismos.trend === 'stable' && '→'}
            {pastorData.stats.batismos.percentage}
          </StatTrend>
        </StatItem>
      </StatsGrid>
      
      <VisitsList>
        <h4>Próximas Visitas Pastorais</h4>
        {pastorData.proximasVisitas.map(visit => (
          <VisitItem key={visit.id}>
            <VisitDate>
              <VisitDay>{visit.date.split('/')[0]}</VisitDay>
              <div>{visit.date.split('/')[1]}</div>
            </VisitDate>
            <VisitInfo>
              <VisitTitle>
                {visit.name}
                {visit.type === 'urgent' && <Badge type="urgent">Urgente</Badge>}
                {visit.type === 'scheduled' && <Badge type="scheduled">Agendada</Badge>}
              </VisitTitle>
              <VisitDetails>
                {visit.time} • {visit.address}
              </VisitDetails>
            </VisitInfo>
            <ActionButton onClick={() => window.location.href = `/pastoral/visitas/${visit.id}`}>
              Detalhes
            </ActionButton>
          </VisitItem>
        ))}
      </VisitsList>
      
      <VisitsList>
        <h4>Visitas Recentes</h4>
        {pastorData.visitasRecentes.map(visit => (
          <VisitItem key={visit.id}>
            <VisitDate>
              <VisitDay>{visit.date.split('/')[0]}</VisitDay>
              <div>{visit.date.split('/')[1]}</div>
            </VisitDate>
            <VisitInfo>
              <VisitTitle>
                {visit.name}
                <Badge type="completed">Concluída</Badge>
              </VisitTitle>
              <VisitDetails>
                {visit.time} • {visit.address}
              </VisitDetails>
            </VisitInfo>
            <ActionButton onClick={() => window.location.href = `/pastoral/visitas/${visit.id}`}>
              Relatório
            </ActionButton>
          </VisitItem>
        ))}
      </VisitsList>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: theme.spacing.lg }}>
        <LinkButton href="/pastoral/visitas/nova">Agendar Visita</LinkButton>
        <LinkButton href="/pastoral/relatorios">Relatórios Pastorais</LinkButton>
        <LinkButton href="/pessoas/novo">Cadastrar Pessoa</LinkButton>
      </div>
    </WidgetContainer>
  );
};
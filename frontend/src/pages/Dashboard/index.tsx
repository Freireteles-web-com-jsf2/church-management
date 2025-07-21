import React, { useState, createContext, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Layout, Card, CardHeader, CardBody } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useCachedDashboardData } from '../../hooks/useCachedDashboardData';
// Adicionar biblioteca de toast se já não estiver (ex: react-toastify)
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NotificationWidget } from '../../components/NotificationWidget';
import { MembersDistributionChart } from '../../components/MembersDistributionChart';
import { EventsTimelineChart } from '../../components/EventsTimelineChart';
import { EmptyState } from '../../components/EmptyState';
import { InformativeMessage } from '../../components/InformativeMessage';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { QuickActionsWidget } from '../../components/QuickActionsWidget';
import { ActionSuggestions } from '../../components/ActionSuggestions';
import { TreasurerWidget } from '../../components/TreasurerWidget';
import { LeaderWidget } from '../../components/LeaderWidget';
import { MemberInfoWidget } from '../../components/MemberInfoWidget';
import { AdminWidget } from '../../components/AdminWidget';
import { PastorWidget } from '../../components/PastorWidget';
import { VolunteerWidget } from '../../components/VolunteerWidget';
import { UpcomingEventsTable } from '../../components/UpcomingEventsTable';
import { BirthdayTable } from '../../components/BirthdayTable';
import { RecentActivitiesTable } from '../../components/RecentActivitiesTable';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Interface para tipagem dos dados do dashboard
interface DashboardStats {
  pessoasAtivas?: number;
  gruposAtivos?: number;
  receitasMes?: number;
  aniversariantesHoje?: number;
}
interface FinancialChartData {
  month: string;
  receitas: number;
  despesas: number;
  saldo: number;
}
interface MemberDistributionData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}
interface UpcomingEvent {
  id: string | number;
  name: string;
  date: string;
  time?: string;
  location?: string;
}
interface BirthdayPerson {
  id: string | number;
  name: string;
  date: string;
  age?: number;
  contact?: string;
}
interface RecentActivity {
  id: string;
  type: 'pessoa' | 'grupo' | 'evento' | 'financeiro' | 'patrimonio';
  action: 'created' | 'updated' | 'deleted';
  title: string;
  description: string;
  timestamp: string | Date;
  relatedId: string;
}
interface DashboardData {
  stats?: DashboardStats;
  charts?: {
    financialData?: FinancialChartData[];
    membersDistribution?: MemberDistributionData[];
  };
  upcomingEvents?: UpcomingEvent[];
  birthdays?: {
    month?: BirthdayPerson[];
  };
  recentActivities?: RecentActivity[];
}

// Contexto para dados do dashboard
interface DashboardContextType {
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refetch: () => Promise<void>;
}
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);
export const useDashboardContext = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboardContext deve ser usado dentro do DashboardProvider');
  return ctx;
};

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${theme.spacing.lg};
  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
  }
`;

// Wrapper para o Card que aceita onClick
const ClickableCard = ({ onClick, title, children, ...rest }: { 
  onClick: () => void; 
  title?: string; 
  children: React.ReactNode;
  [key: string]: any;
}) => (
  <div 
    onClick={onClick} 
    title={title} 
    style={{ cursor: 'pointer' }}
  >
    <Card {...rest}>{children}</Card>
  </div>
);

const StatCard = styled(ClickableCard)`
  display: flex;
  align-items: center;
  transition: transform ${theme.transitions.normal};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const StatIcon = styled.div<{ bgColor: string }>`
  width: 60px;
  height: 60px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${({ bgColor }) => bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing.lg};
  font-size: 1.5rem;
  color: ${theme.colors.white};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text};
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textLight};
  margin-top: ${theme.spacing.xs};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${theme.spacing.lg};
  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
  }
`;

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.lg};
  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
  }
`;

// Removidos EventTable e Badge pois não estão sendo utilizados

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  // Adicionar seleção de período para o gráfico financeiro
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [drilldownData, setDrilldownData] = useState<FinancialChartData | null>(null);

  // Usar o hook de cache para dados do dashboard
  const { 
    data: dashboardData, 
    loading, 
    error, 
    lastUpdate, 
    refetch,
    isStale 
  } = useCachedDashboardData(period, {
    ttl: 5 * 60 * 1000, // 5 minutos
    persistOffline: true,
    autoRefreshInterval: 60 * 1000 // 1 minuto
  });
  
  // Notificar usuário quando dados são atualizados automaticamente
  useEffect(() => {
    if (lastUpdate && !loading && !isStale) {
      toast.info('Dados do dashboard atualizados automaticamente!', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    }
  }, [lastUpdate, loading, isStale]);

  // Dados para exibição (fallback para [] se não carregado)
  const stats = dashboardData?.stats || {};
  const financialData = dashboardData?.charts?.financialData || [];
  const memberData = dashboardData?.charts?.membersDistribution || [];
  const upcomingEvents = dashboardData?.upcomingEvents || [];
  const birthdayPeople = dashboardData?.birthdays?.month || [];

  // Verificar se há dados significativos para exibir
  const hasAnyData = (
    Object.values(stats).some(value => value !== undefined && value !== null && value !== 0) ||
    financialData.length > 0 ||
    memberData.length > 0 ||
    upcomingEvents.length > 0 ||
    birthdayPeople.length > 0
  );

  // Mapeamento de widgets por role com layouts padrão específicos
  const widgetsByRole: Record<string, Array<'stats' | 'finance' | 'members' | 'events' | 'notifications'>> = {
    // Admin tem acesso a todos os widgets com foco em estatísticas e finanças primeiro
    admin: ['stats', 'finance', 'members', 'events', 'notifications'],
    
    // Pastor tem foco em pessoas e eventos
    pastor: ['stats', 'events', 'members', 'finance', 'notifications'],
    
    // Líder tem foco em membros e eventos
    lider: ['stats', 'members', 'events', 'notifications'],
    
    // Tesoureiro tem foco em finanças
    tesoureiro: ['stats', 'finance', 'notifications'],
    
    // Voluntário tem foco em eventos
    voluntario: ['stats', 'events', 'notifications'],
    
    // Membro comum tem acesso limitado
    membro: ['stats', 'events', 'notifications'],
  };

  // Sistema de fallback para roles não configurados
  const userRole = user?.role || 'membro';
  
  // Função para obter widgets com fallback hierárquico
  const getWidgetsForRole = (role: string): Array<'stats' | 'finance' | 'members' | 'events' | 'notifications'> => {
    // Se a role existir diretamente, use-a
    if (widgetsByRole[role]) {
      return widgetsByRole[role];
    }
    
    // Fallback hierárquico baseado em permissões
    // Ordem de fallback: admin > pastor > lider > tesoureiro > voluntario > membro
    const fallbackOrder = ['membro', 'voluntario', 'tesoureiro', 'lider', 'pastor', 'admin'];
    
    // Encontre a posição da role atual na hierarquia (ou -1 se não existir)
    const roleIndex = fallbackOrder.indexOf(role);
    
    // Se a role não estiver na hierarquia, use 'membro' como fallback padrão
    if (roleIndex === -1) {
      console.log(`Role "${role}" não encontrada, usando configuração padrão de membro`);
      return widgetsByRole['membro'];
    }
    
    // Procure pela primeira role disponível na hierarquia abaixo da atual
    for (let i = roleIndex - 1; i >= 0; i--) {
      const fallbackRole = fallbackOrder[i];
      if (widgetsByRole[fallbackRole]) {
        console.log(`Usando configuração de "${fallbackRole}" como fallback para "${role}"`);
        return widgetsByRole[fallbackRole];
      }
    }
    
    // Se nenhum fallback for encontrado (improvável), use um conjunto mínimo
    return ['stats'];
  };
  
  const widgets = getWidgetsForRole(userRole);

  // Utilitário para persistência da ordem dos widgets
  const WIDGETS_KEY = `dashboard_widgets_order_${user?.id || 'default'}`;
  function getInitialWidgetOrder(defaultOrder: string[]) {
    const saved = localStorage.getItem(WIDGETS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every(w => typeof w === 'string')) {
          return parsed;
        }
      } catch {}
    }
    return defaultOrder;
  }

  const defaultOrder = widgets;
  const [widgetOrder, setWidgetOrder] = useState<string[]>(getInitialWidgetOrder(defaultOrder));

  useEffect(() => {
    localStorage.setItem(WIDGETS_KEY, JSON.stringify(widgetOrder));
  }, [widgetOrder]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newOrder = Array.from(widgetOrder);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    setWidgetOrder(newOrder);
  };

  const handleResetLayout = () => {
    setWidgetOrder(defaultOrder);
    localStorage.removeItem(WIDGETS_KEY);
  };

  // Loading state
  if (loading && !dashboardData) {
    return (
      <ErrorBoundary>
        <Layout>
          <DashboardContainer>
            <InformativeMessage
              type="info"
              icon="⏳"
              title="Carregando dashboard..."
              description="Aguarde enquanto buscamos os dados mais recentes da sua igreja. Isso pode levar alguns segundos."
              showIcon={true}
            />
          </DashboardContainer>
        </Layout>
      </ErrorBoundary>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <ErrorBoundary>
        <Layout>
          <DashboardContainer>
            <InformativeMessage
              type="error"
              icon="❌"
              title="Erro ao carregar dashboard"
              description={`Não foi possível carregar os dados do dashboard. ${error}. Verifique sua conexão com a internet e tente novamente.`}
              actionText="Tentar Novamente"
              onAction={refetch}
              showIcon={true}
            />
          </DashboardContainer>
        </Layout>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardContext.Provider value={{ dashboardData, loading, error, lastUpdate, refetch }}>
        <Layout>
          <DashboardContainer>
            <h1 tabIndex={0}>Bem-vindo, {user?.name || 'usuário'}!</h1>
            <p style={{ fontSize: 12, color: theme.colors.textLight, marginBottom: 8 }}>
              Última atualização: {lastUpdate ? lastUpdate.toLocaleTimeString('pt-BR') : '---'}
              {loading && <span style={{ color: theme.colors.info, marginLeft: 8 }}>🔄 Atualizando...</span>}
            </p>
            {error && (
              <div style={{ marginBottom: theme.spacing.lg }}>
                <InformativeMessage
                  type="warning"
                  icon="⚠️"
                  title="Problema na atualização dos dados"
                  description={`Alguns dados podem estar desatualizados. ${error}. Clique em "Atualizar Agora" para tentar novamente.`}
                  actionText="Atualizar Agora"
                  onAction={refetch}
                  showIcon={true}
                />
              </div>
            )}
            <QuickActionsWidget />
            <ActionSuggestions />
            
            {/* Mensagem quando não há dados significativos */}
            {!loading && !error && !hasAnyData && (
              <div style={{ marginBottom: theme.spacing.lg }}>
                <InformativeMessage
                  type="empty"
                  icon="📊"
                  title="Dashboard vazio"
                  description="Parece que você ainda não tem dados suficientes para exibir no dashboard. Comece cadastrando pessoas, criando grupos ou adicionando lançamentos financeiros para ver estatísticas e gráficos aqui."
                  actionText="Começar Agora"
                  actionLink="/pessoas"
                  showIcon={true}
                />
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 16,
              padding: 12,
              background: theme.colors.grayLight,
              borderRadius: theme.borderRadius.md
            }}>
              <div>
                <h4 style={{ margin: 0, marginBottom: 4 }}>Personalizar Dashboard</h4>
                <p style={{ margin: 0, fontSize: 12, color: theme.colors.textLight }}>
                  Arraste e solte os widgets para reorganizar seu dashboard
                </p>
              </div>
              <div>
                <button 
                  onClick={handleResetLayout} 
                  style={{ 
                    background: theme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: theme.borderRadius.sm,
                    padding: '6px 12px',
                    cursor: 'pointer'
                  }}
                >
                  Resetar layout padrão
                </button>
              </div>
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="dashboard-widgets" direction="vertical">
                {(provided: DroppableProvided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {widgetOrder.map((widget, idx) => (
                      <Draggable key={widget} draggableId={widget} index={idx}>
                        {(dragProvided: DraggableProvided) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            style={{ marginBottom: 24, ...dragProvided.draggableProps.style }}
                          >
                            {widget === 'notifications' && widgets.includes('notifications') && <NotificationWidget />}
                            {widget === 'stats' && widgets.includes('stats') && (
                              <>
                                {/* Widgets específicos por função */}
                                {userRole === 'admin' && <AdminWidget />}
                                {userRole === 'pastor' && <PastorWidget />}
                                {userRole === 'membro' && <MemberInfoWidget />}
                                {userRole === 'voluntario' && <VolunteerWidget />}
                                
                                <StatsGrid>
                                  <StatCard onClick={() => window.location.href = '/pessoas'} title="Clique para ver todos os membros">
                                    <StatIcon bgColor={theme.colors.primary} aria-label="Membros ativos">👥</StatIcon>
                                    <StatContent>
                                      <StatValue>{stats.pessoasAtivas ?? '-'}</StatValue>
                                      <StatLabel>Membros ativos</StatLabel>
                                    </StatContent>
                                  </StatCard>
                                  <StatCard onClick={() => window.location.href = '/grupos'} title="Clique para ver todos os grupos">
                                    <StatIcon bgColor={theme.colors.info} aria-label="Grupos ativos">👨‍👩‍👧‍👦</StatIcon>
                                    <StatContent>
                                      <StatValue>{stats.gruposAtivos ?? '-'}</StatValue>
                                      <StatLabel>Grupos ativos</StatLabel>
                                    </StatContent>
                                  </StatCard>
                                  <StatCard onClick={() => window.location.href = '/financeiro'} title="Clique para ver movimentação financeira">
                                    <StatIcon bgColor={theme.colors.success} aria-label="Receitas do mês">💰</StatIcon>
                                    <StatContent>
                                      <StatValue>R$ {stats.receitasMes?.toLocaleString('pt-BR') ?? '-'}</StatValue>
                                      <StatLabel>Receitas do mês</StatLabel>
                                    </StatContent>
                                  </StatCard>
                                  <StatCard onClick={() => window.location.href = '/pessoas?filter=birthdays'} title="Clique para ver aniversariantes">
                                    <StatIcon bgColor={theme.colors.warning} aria-label="Aniversariantes hoje">🎂</StatIcon>
                                    <StatContent>
                                      <StatValue>{stats.aniversariantesHoje ?? '-'}</StatValue>
                                      <StatLabel>Aniversariantes hoje</StatLabel>
                                    </StatContent>
                                  </StatCard>
                                </StatsGrid>
                              </>
                            )}
                            {widget === 'finance' && widgets.includes('finance') && (
                              <>
                                {/* Widget especializado para tesoureiro */}
                                {userRole === 'tesoureiro' && <TreasurerWidget />}
                                
                                <ChartsGrid>
                                  <Card>
                                    <CardHeader>
                                      <h3>Movimentação Financeira</h3>
                                      <select value={period} onChange={e => setPeriod(e.target.value as any)} style={{ marginLeft: 16 }}>
                                        <option value="month">Mensal</option>
                                        <option value="quarter">Trimestral</option>
                                        <option value="year">Anual</option>
                                      </select>
                                    </CardHeader>
                                    <CardBody>
                                      {financialData.length === 0 ? (
                                        <EmptyState
                                          icon="💰"
                                          title="Nenhum dado financeiro disponível"
                                          description="Adicione lançamentos de receitas e despesas para acompanhar o fluxo financeiro da igreja e tomar decisões baseadas em dados."
                                          actionText="Ir para Financeiro"
                                          actionLink="/financeiro"
                                        />
                                      ) : (
                                        <ResponsiveContainer width="100%" height={300}>
                                          <BarChart data={financialData} onClick={data => setDrilldownData(data.activePayload?.[0]?.payload)}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => `R$ ${value}`} />
                                            <Legend />
                                            <Bar dataKey="receitas" name="Receitas" fill={theme.colors.primary} />
                                            <Bar dataKey="despesas" name="Despesas" fill={theme.colors.danger} />
                                          </BarChart>
                                        </ResponsiveContainer>
                                      )}
                                      {drilldownData && (
                                        <div style={{ marginTop: 16, background: theme.colors.grayLight, padding: 16, borderRadius: 8 }}>
                                          <b>Detalhes de {drilldownData.month}:</b><br />
                                          Receitas: R$ {drilldownData.receitas?.toLocaleString('pt-BR')}<br />
                                          Despesas: R$ {drilldownData.despesas?.toLocaleString('pt-BR')}<br />
                                          Saldo: R$ {drilldownData.saldo?.toLocaleString('pt-BR')}<br />
                                          <button onClick={() => setDrilldownData(null)} style={{ marginTop: 8 }}>Fechar</button>
                                        </div>
                                      )}
                                    </CardBody>
                                  </Card>
                                </ChartsGrid>
                              </>
                            )}
                            {widget === 'members' && widgets.includes('members') && (
                              <>
                                {/* Widget especializado para líderes */}
                                {(userRole === 'lider' || userRole === 'pastor') && <LeaderWidget />}
                                
                                <ChartsGrid>
                                  <Card>
                                    <CardHeader>
                                      <h3>
                                        <a href="/pessoas" style={{ textDecoration: 'none', color: 'inherit' }}>
                                          Distribuição de Membros
                                        </a>
                                      </h3>
                                    </CardHeader>
                                    <CardBody>
                                      <MembersDistributionChart data={memberData} />
                                    </CardBody>
                                  </Card>
                                </ChartsGrid>
                              </>
                            )}
                            {widget === 'events' && widgets.includes('events') && (
                              <ChartsGrid>
                                <Card>
                                  <CardHeader>
                                    <h3>
                                      <a href="/agenda" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        Timeline de Eventos
                                      </a>
                                    </h3>
                                  </CardHeader>
                                  <CardBody>
                                    <EventsTimelineChart events={upcomingEvents} />
                                  </CardBody>
                                </Card>
                              </ChartsGrid>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            {/* Tabelas */}
            <TableGrid>
              <Card>
                <CardHeader>
                  <h3>
                    <a href="/agenda" style={{ textDecoration: 'none', color: 'inherit' }}>
                      Próximos Eventos
                    </a>
                  </h3>
                </CardHeader>
                <CardBody>
                  <UpcomingEventsTable events={upcomingEvents} />
                </CardBody>
              </Card>
              <Card>
                <CardHeader>
                  <h3>
                    <a href="/pessoas?filter=birthdays" style={{ textDecoration: 'none', color: 'inherit' }}>
                      Aniversariantes do Mês
                    </a>
                  </h3>
                </CardHeader>
                <CardBody>
                  <BirthdayTable people={birthdayPeople} />
                </CardBody>
              </Card>
            </TableGrid>
            <Card>
              <CardHeader>
                <h3>Atividades Recentes</h3>
              </CardHeader>
              <CardBody>
                <RecentActivitiesTable activities={dashboardData?.recentActivities || []} />
              </CardBody>
            </Card>
          </DashboardContainer>
        </Layout>
      </DashboardContext.Provider>
    </ErrorBoundary>
  );
};

export default DashboardPage;
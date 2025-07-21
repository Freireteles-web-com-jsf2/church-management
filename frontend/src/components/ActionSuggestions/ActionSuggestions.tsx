import React, { useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardContext } from '../../pages/Dashboard';

interface ActionSuggestion {
  id: string;
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  actionText: string;
  actionLink?: string;
  onAction?: () => void;
  category: 'data' | 'management' | 'engagement' | 'finance';
}

const SuggestionsContainer = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.lg};
`;

const SuggestionsTitle = styled.h3`
  color: ${theme.colors.primaryDark};
  margin-bottom: ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.xl};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const SuggestionsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.md};
`;

const SuggestionCard = styled.div<{ priority: string }>`
  background: ${theme.colors.grayLight};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  border-left: 4px solid ${({ priority }) => {
    switch (priority) {
      case 'high': return theme.colors.danger;
      case 'medium': return theme.colors.warning;
      default: return theme.colors.info;
    }
  }};
  transition: transform ${theme.transitions.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.sm};
  }
`;

const SuggestionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.sm};
`;

const SuggestionIcon = styled.div`
  font-size: 1.5rem;
  margin-top: 2px;
`;

const SuggestionContent = styled.div`
  flex: 1;
`;

const SuggestionTitle = styled.h4`
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const SuggestionDescription = styled.p`
  color: ${theme.colors.textLight};
  font-size: ${theme.typography.fontSize.sm};
  line-height: 1.4;
  margin-bottom: ${theme.spacing.md};
`;

const SuggestionAction = styled.button`
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color ${theme.transitions.normal};

  &:hover {
    background: ${theme.colors.primaryDark};
  }

  &:focus {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }
`;

const SuggestionLink = styled.a`
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color ${theme.transitions.normal};
  text-decoration: none;
  display: inline-block;

  &:hover {
    background: ${theme.colors.primaryDark};
  }

  &:focus {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }
`;

const PriorityBadge = styled.span<{ priority: string }>`
  background: ${({ priority }) => {
    switch (priority) {
      case 'high': return theme.colors.danger;
      case 'medium': return theme.colors.warning;
      default: return theme.colors.info;
    }
  }};
  color: ${theme.colors.white};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.bold};
  padding: 2px 6px;
  border-radius: ${theme.borderRadius.sm};
  text-transform: uppercase;
  margin-left: ${theme.spacing.sm};
`;

export const ActionSuggestions: React.FC = () => {
  const { user } = useAuth();
  const { dashboardData, loading } = useDashboardContext();

  const suggestions = useMemo((): ActionSuggestion[] => {
    if (loading || !dashboardData) return [];

    const suggestions: ActionSuggestion[] = [];
    const stats = dashboardData.stats || {};
    const financialData = dashboardData.charts?.financialData || [];
    // const memberData = dashboardData.charts?.membersDistribution || []; // Removido pois não está sendo usado
    const upcomingEvents = dashboardData.upcomingEvents || [];
    const birthdayPeople = dashboardData.birthdays?.month || [];

    // Sugestões baseadas em dados insuficientes
    if (!stats.pessoasAtivas || stats.pessoasAtivas === 0) {
      suggestions.push({
        id: 'add-members',
        title: 'Cadastrar Primeiros Membros',
        description: 'Comece cadastrando os membros da sua igreja para acompanhar o crescimento da comunidade.',
        icon: '👥',
        priority: 'high',
        actionText: 'Cadastrar Membros',
        actionLink: '/pessoas',
        category: 'data'
      });
    }

    if (!stats.gruposAtivos || stats.gruposAtivos === 0) {
      suggestions.push({
        id: 'create-groups',
        title: 'Criar Grupos de Ministério',
        description: 'Organize os membros em grupos para facilitar o acompanhamento e fortalecer relacionamentos.',
        icon: '🏠',
        priority: 'high',
        actionText: 'Criar Grupo',
        actionLink: '/grupos',
        category: 'management'
      });
    }

    if (financialData.length === 0) {
      suggestions.push({
        id: 'add-financial-data',
        title: 'Registrar Movimentação Financeira',
        description: 'Adicione lançamentos de receitas e despesas para acompanhar a saúde financeira da igreja.',
        icon: '💰',
        priority: 'high',
        actionText: 'Adicionar Lançamento',
        actionLink: '/financeiro',
        category: 'finance'
      });
    }

    if (upcomingEvents.length === 0) {
      suggestions.push({
        id: 'create-events',
        title: 'Agendar Próximos Eventos',
        description: 'Mantenha a comunidade informada criando eventos para cultos, reuniões e atividades especiais.',
        icon: '📅',
        priority: 'medium',
        actionText: 'Criar Evento',
        actionLink: '/agenda',
        category: 'engagement'
      });
    }

    // Sugestões baseadas no role do usuário
    const userRole = user?.role || 'membro';

    if (userRole === 'admin' || userRole === 'pastor') {
      if (stats.pessoasAtivas && stats.pessoasAtivas > 0 && stats.gruposAtivos === 0) {
        suggestions.push({
          id: 'organize-members',
          title: 'Organizar Membros em Grupos',
          description: 'Você tem membros cadastrados. Que tal organizá-los em grupos de ministério ou células?',
          icon: '🎯',
          priority: 'medium',
          actionText: 'Criar Grupos',
          actionLink: '/grupos',
          category: 'management'
        });
      }

      if (birthdayPeople.length > 0) {
        suggestions.push({
          id: 'birthday-outreach',
          title: 'Parabenizar Aniversariantes',
          description: 'Há aniversariantes este mês. Considere entrar em contato para fortalecer relacionamentos.',
          icon: '🎂',
          priority: 'low',
          actionText: 'Ver Aniversariantes',
          actionLink: '/pessoas?filter=birthdays',
          category: 'engagement'
        });
      }
    }

    if (userRole === 'tesoureiro' || userRole === 'admin') {
      if (stats.receitasMes && stats.receitasMes < 1000) { // Assumindo um valor mínimo esperado
        suggestions.push({
          id: 'financial-review',
          title: 'Revisar Orçamento',
          description: 'As despesas estão superiores às receitas este mês. Considere revisar o orçamento.',
          icon: '⚠️',
          priority: 'high',
          actionText: 'Ver Relatório',
          actionLink: '/financeiro/relatorios',
          category: 'finance'
        });
      }
    }

    if (userRole === 'lider' || userRole === 'pastor') {
      if (stats.pessoasAtivas && stats.pessoasAtivas > 10 && upcomingEvents.length === 0) {
        suggestions.push({
          id: 'plan-activities',
          title: 'Planejar Atividades',
          description: 'Com uma comunidade ativa, considere planejar eventos para manter o engajamento.',
          icon: '🎪',
          priority: 'medium',
          actionText: 'Planejar Evento',
          actionLink: '/agenda',
          category: 'engagement'
        });
      }
    }

    // Sugestões gerais de melhoria
    if (suggestions.length === 0) {
      suggestions.push({
        id: 'explore-features',
        title: 'Explorar Funcionalidades',
        description: 'Seu dashboard está bem configurado! Explore outras funcionalidades do sistema.',
        icon: '🚀',
        priority: 'low',
        actionText: 'Explorar',
        actionLink: '/ajuda',
        category: 'management'
      });
    }

    // Ordenar por prioridade
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [dashboardData, loading, user]);

  if (loading || suggestions.length === 0) {
    return null;
  }

  return (
    <SuggestionsContainer>
      <SuggestionsTitle>
        💡 Sugestões para Você
      </SuggestionsTitle>
      <SuggestionsList>
        {suggestions.map((suggestion) => (
          <SuggestionCard key={suggestion.id} priority={suggestion.priority}>
            <SuggestionHeader>
              <SuggestionIcon>{suggestion.icon}</SuggestionIcon>
              <SuggestionContent>
                <SuggestionTitle>
                  {suggestion.title}
                  <PriorityBadge priority={suggestion.priority}>
                    {suggestion.priority === 'high' ? 'Urgente' : 
                     suggestion.priority === 'medium' ? 'Importante' : 'Sugestão'}
                  </PriorityBadge>
                </SuggestionTitle>
                <SuggestionDescription>
                  {suggestion.description}
                </SuggestionDescription>
                {suggestion.actionLink ? (
                  <SuggestionLink href={suggestion.actionLink}>
                    {suggestion.actionText}
                  </SuggestionLink>
                ) : suggestion.onAction ? (
                  <SuggestionAction onClick={suggestion.onAction}>
                    {suggestion.actionText}
                  </SuggestionAction>
                ) : null}
              </SuggestionContent>
            </SuggestionHeader>
          </SuggestionCard>
        ))}
      </SuggestionsList>
    </SuggestionsContainer>
  );
};
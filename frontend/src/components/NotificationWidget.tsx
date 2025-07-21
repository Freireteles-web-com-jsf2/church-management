import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useDashboardContext } from '../pages/Dashboard';
import { theme } from '../styles/theme';
import { InformativeMessage } from './InformativeMessage';

const WidgetContainer = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.lg};
  min-width: 320px;
`;

const NotificationList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NotificationItem = styled.li<{ priority: string; read: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.grayLight};
  opacity: ${({ read }) => (read ? 0.5 : 1)};
  background: ${({ read }) => (read ? theme.colors.grayLight : 'transparent')};
  position: relative;

  &:last-child {
    border-bottom: none;
  }
`;

const Icon = styled.span<{ type: string }>`
  font-size: 1.5rem;
  margin-top: 2px;
  ${({ type }) => {
    switch (type) {
      case 'success': return `color: ${theme.colors.success};`;
      case 'warning': return `color: ${theme.colors.warning};`;
      case 'error': return `color: ${theme.colors.danger};`;
      case 'info':
      default: return `color: ${theme.colors.info};`;
    }
  }}
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: 2px;
`;

const Message = styled.div`
  font-size: ${theme.typography.fontSize.sm};
`;

const MarkReadButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.info};
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: ${theme.spacing.md};
  opacity: 0.7;
  &:hover { opacity: 1; text-decoration: underline; }
`;

// Definir tipos para as notificações
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
}

const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
const typeIcon: Record<string, string> = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };

export const NotificationWidget: React.FC = () => {
  const { loading } = useDashboardContext();
  // Dados mockados para notificações (em produção, viriam da API)
  const notifications: Notification[] = [
    { id: '1', type: 'info', priority: 'medium', title: 'Reunião de líderes', message: 'Reunião de líderes agendada para quinta-feira' },
    { id: '2', type: 'warning', priority: 'high', title: 'Vencimento do aluguel', message: 'Vencimento do aluguel em 3 dias' },
    { id: '3', type: 'success', priority: 'medium', title: 'Meta atingida', message: 'Meta de arrecadação do mês atingida!' },
    { id: '4', type: 'info', priority: 'low', title: 'Novos membros', message: '5 novos membros cadastrados esta semana' },
  ];
  const [readIds, setReadIds] = useState<string[]>([]);

  // Ordenar por prioridade
  const sorted = useMemo(() =>
    [...notifications].sort((a, b) =>
      (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    ), [notifications]
  );

  const handleMarkRead = (id: string) => {
    setReadIds(ids => [...ids, id]);
  };

  if (loading) {
    return (
      <WidgetContainer>
        <InformativeMessage
          type="info"
          icon="🔔"
          title="Carregando notificações..."
          description="Buscando suas notificações mais recentes."
          showIcon={true}
        />
      </WidgetContainer>
    );
  }

  if (!notifications.length) {
    return (
      <WidgetContainer>
        <InformativeMessage
          type="empty"
          icon="🔕"
          title="Nenhuma notificação"
          description="Você está em dia! Não há notificações pendentes no momento."
          showIcon={true}
        />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer>
      <h3 style={{ marginBottom: theme.spacing.md }}>Notificações</h3>
      <NotificationList>
        {sorted.map(n => (
          <NotificationItem key={n.id} priority={n.priority} read={readIds.includes(n.id)}>
            <Icon type={n.type}>{typeIcon[n.type] || 'ℹ️'}</Icon>
            <Content>
              <Title>{n.title}</Title>
              <Message>{n.message}</Message>
            </Content>
            {!readIds.includes(n.id) && (
              <MarkReadButton onClick={() => handleMarkRead(n.id)} title="Marcar como lido">Marcar como lido</MarkReadButton>
            )}
          </NotificationItem>
        ))}
      </NotificationList>
    </WidgetContainer>
  );
}; 
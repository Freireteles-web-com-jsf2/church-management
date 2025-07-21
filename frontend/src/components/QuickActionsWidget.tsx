import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../styles/theme';

const WidgetContainer = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.lg};
  margin-bottom: 24px;
`;

const ActionsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const ActionButton = styled.button`
  background: ${theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: ${theme.colors.info}; }
`;

const actionsByRole: Record<string, Array<{ label: string; onClick: () => void }>> = {
  admin: [
    { label: 'Novo Usuário', onClick: () => window.location.href = '/usuarios/novo' },
    { label: 'Novo Grupo', onClick: () => window.location.href = '/grupos/novo' },
    { label: 'Novo Evento', onClick: () => window.location.href = '/agenda/novo' },
    { label: 'Lançamento Financeiro', onClick: () => window.location.href = '/financeiro/novo' },
  ],
  tesoureiro: [
    { label: 'Lançamento Financeiro', onClick: () => window.location.href = '/financeiro/novo' },
    { label: 'Relatório Financeiro', onClick: () => window.location.href = '/financeiro/relatorios' },
  ],
  lider: [
    { label: 'Novo Grupo', onClick: () => window.location.href = '/grupos/novo' },
    { label: 'Novo Evento', onClick: () => window.location.href = '/agenda/novo' },
  ],
  membro: [
    { label: 'Próximos Eventos', onClick: () => window.location.href = '/agenda' },
    { label: 'Meus Grupos', onClick: () => window.location.href = '/grupos' },
  ],
  voluntario: [
    { label: 'Próximos Eventos', onClick: () => window.location.href = '/agenda' },
  ],
  pastor: [
    { label: 'Novo Relatório', onClick: () => window.location.href = '/relatorios/novo' },
    { label: 'Novo Evento', onClick: () => window.location.href = '/agenda/novo' },
  ],
};

export const QuickActionsWidget: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'membro';
  const actions = actionsByRole[role] || actionsByRole['membro'];

  return (
    <WidgetContainer>
      <h3 style={{ marginBottom: theme.spacing.md }}>Ações Rápidas</h3>
      <ActionsGrid>
        {actions.map((action, idx) => (
          <ActionButton key={idx} onClick={action.onClick}>{action.label}</ActionButton>
        ))}
      </ActionsGrid>
    </WidgetContainer>
  );
}; 
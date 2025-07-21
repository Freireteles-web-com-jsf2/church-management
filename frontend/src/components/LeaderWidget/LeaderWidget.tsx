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

const GroupsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const GroupCard = styled.div`
  background: ${theme.colors.grayLight};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  border-left: 4px solid ${theme.colors.primary};
  cursor: pointer;
  transition: transform ${theme.transitions.normal};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.sm};
  }
`;

const GroupName = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: ${theme.spacing.xs};
`;

const GroupStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textLight};
`;

const MembersList = styled.div`
  margin-top: ${theme.spacing.lg};
`;

const MembersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: ${theme.spacing.sm};
    text-align: left;
    border-bottom: 1px solid ${theme.colors.grayLight};
  }
  
  th {
    font-weight: ${theme.typography.fontWeight.medium};
    color: ${theme.colors.textLight};
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

const ActionButton = styled.button`
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  
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
  
  &:hover {
    background: ${theme.colors.primaryDark};
  }
`;

const Badge = styled.span<{ type: 'active' | 'inactive' | 'new' }>`
  display: inline-block;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: ${theme.typography.fontSize.xs};
  background: ${({ type }) => {
    switch (type) {
      case 'active': return 'rgba(46, 204, 113, 0.1)';
      case 'inactive': return 'rgba(231, 76, 60, 0.1)';
      case 'new': return 'rgba(52, 152, 219, 0.1)';
    }
  }};
  color: ${({ type }) => {
    switch (type) {
      case 'active': return theme.colors.success;
      case 'inactive': return theme.colors.danger;
      case 'new': return theme.colors.info;
    }
  }};
  margin-left: ${theme.spacing.xs};
`;

export const LeaderWidget: React.FC = () => {
  const { dashboardData, loading } = useDashboardContext();
  
  // Dados mockados para o widget do líder
  const leaderData = {
    groups: [
      { id: 1, name: 'Grupo de Jovens', members: 15, meetings: 4, lastMeeting: '15/07/2025' },
      { id: 2, name: 'Grupo de Casais', members: 12, meetings: 2, lastMeeting: '10/07/2025' },
      { id: 3, name: 'Grupo de Estudos', members: 8, meetings: 3, lastMeeting: '18/07/2025' },
    ],
    recentMembers: [
      { id: 1, name: 'Ana Silva', joinDate: '01/07/2025', status: 'new' as const, group: 'Grupo de Jovens' },
      { id: 2, name: 'Carlos Santos', joinDate: '05/07/2025', status: 'new' as const, group: 'Grupo de Estudos' },
      { id: 3, name: 'Mariana Costa', joinDate: '10/06/2025', status: 'active' as const, group: 'Grupo de Casais' },
      { id: 4, name: 'Roberto Lima', joinDate: '15/05/2025', status: 'inactive' as const, group: 'Grupo de Jovens' },
    ]
  };
  
  if (loading) {
    return (
      <WidgetContainer>
        <WidgetTitle>👥 Resumo de Liderança (Carregando...)</WidgetTitle>
      </WidgetContainer>
    );
  }
  
  return (
    <WidgetContainer>
      <WidgetTitle>👥 Resumo de Liderança</WidgetTitle>
      
      <h4>Seus Grupos</h4>
      <GroupsGrid>
        {leaderData.groups.map(group => (
          <GroupCard key={group.id} onClick={() => window.location.href = `/grupos/${group.id}`}>
            <GroupName>{group.name}</GroupName>
            <GroupStats>
              <span>{group.members} membros</span>
              <span>{group.meetings} reuniões/mês</span>
            </GroupStats>
            <div style={{ fontSize: theme.typography.fontSize.xs, marginTop: theme.spacing.xs }}>
              Última reunião: {group.lastMeeting}
            </div>
          </GroupCard>
        ))}
      </GroupsGrid>
      
      <MembersList>
        <h4>Membros Recentes</h4>
        <MembersTable>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Data de Entrada</th>
              <th>Grupo</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {leaderData.recentMembers.map(member => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.joinDate}</td>
                <td>{member.group}</td>
                <td>
                  {member.status === 'new' && <Badge type="new">Novo</Badge>}
                  {member.status === 'active' && <Badge type="active">Ativo</Badge>}
                  {member.status === 'inactive' && <Badge type="inactive">Inativo</Badge>}
                </td>
                <td>
                  <ActionButton onClick={() => window.location.href = `/pessoas/${member.id}`}>
                    Ver Perfil
                  </ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </MembersTable>
      </MembersList>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: theme.spacing.lg }}>
        <LinkButton href="/grupos/novo">Criar Novo Grupo</LinkButton>
        <LinkButton href="/pessoas/novo">Adicionar Membro</LinkButton>
      </div>
    </WidgetContainer>
  );
};
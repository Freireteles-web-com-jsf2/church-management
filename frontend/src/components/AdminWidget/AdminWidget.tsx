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

const SystemStatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const StatusItem = styled.div<{ status: 'good' | 'warning' | 'critical' }>`
  background: ${({ status }) => {
    switch (status) {
      case 'good': return 'rgba(46, 204, 113, 0.1)';
      case 'warning': return 'rgba(241, 196, 15, 0.1)';
      case 'critical': return 'rgba(231, 76, 60, 0.1)';
    }
  }};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border-left: 4px solid ${({ status }) => {
    switch (status) {
      case 'good': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'critical': return theme.colors.danger;
    }
  }};
`;

const ItemLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textLight};
  margin-bottom: ${theme.spacing.xs};
`;

const ItemValue = styled.div<{ status: 'good' | 'warning' | 'critical' }>`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${({ status }) => {
    switch (status) {
      case 'good': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'critical': return theme.colors.danger;
    }
  }};
`;

const UsersList = styled.div`
  margin-top: ${theme.spacing.lg};
`;

const UsersTable = styled.table`
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
  margin-right: ${theme.spacing.md};
  
  &:hover {
    background: ${theme.colors.primaryDark};
  }
`;

const Badge = styled.span<{ type: 'admin' | 'pastor' | 'lider' | 'tesoureiro' | 'voluntario' | 'membro' }>`
  display: inline-block;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: ${theme.typography.fontSize.xs};
  background: ${({ type }) => {
    switch (type) {
      case 'admin': return 'rgba(155, 89, 182, 0.1)';
      case 'pastor': return 'rgba(52, 152, 219, 0.1)';
      case 'lider': return 'rgba(46, 204, 113, 0.1)';
      case 'tesoureiro': return 'rgba(241, 196, 15, 0.1)';
      case 'voluntario': return 'rgba(230, 126, 34, 0.1)';
      case 'membro': return 'rgba(189, 195, 199, 0.1)';
    }
  }};
  color: ${({ type }) => {
    switch (type) {
      case 'admin': return '#9b59b6';
      case 'pastor': return theme.colors.info;
      case 'lider': return theme.colors.success;
      case 'tesoureiro': return theme.colors.warning;
      case 'voluntario': return '#e67e22';
      case 'membro': return '#7f8c8d';
    }
  }};
  margin-left: ${theme.spacing.xs};
`;

export const AdminWidget: React.FC = () => {
  const { dashboardData, loading } = useDashboardContext();
  
  // Dados mockados para o widget do administrador
  const adminData = {
    systemStatus: {
      database: { status: 'good' as const, value: '98%' },
      storage: { status: 'warning' as const, value: '75%' },
      backups: { status: 'good' as const, value: 'Atualizado' },
      updates: { status: 'critical' as const, value: '2 pendentes' }
    },
    recentUsers: [
      { id: 1, name: 'João Silva', email: 'joao@igreja.org', role: 'pastor' as const, lastLogin: '21/07/2025 09:45' },
      { id: 2, name: 'Maria Santos', email: 'maria@igreja.org', role: 'tesoureiro' as const, lastLogin: '20/07/2025 14:30' },
      { id: 3, name: 'Pedro Costa', email: 'pedro@igreja.org', role: 'lider' as const, lastLogin: '19/07/2025 18:15' },
      { id: 4, name: 'Ana Oliveira', email: 'ana@igreja.org', role: 'voluntario' as const, lastLogin: '18/07/2025 10:20' },
    ]
  };
  
  if (loading) {
    return (
      <WidgetContainer>
        <WidgetTitle>⚙️ Painel Administrativo (Carregando...)</WidgetTitle>
      </WidgetContainer>
    );
  }
  
  return (
    <WidgetContainer>
      <WidgetTitle>⚙️ Painel Administrativo</WidgetTitle>
      
      <h4>Status do Sistema</h4>
      <SystemStatusGrid>
        <StatusItem status={adminData.systemStatus.database.status}>
          <ItemLabel>Banco de Dados</ItemLabel>
          <ItemValue status={adminData.systemStatus.database.status}>
            {adminData.systemStatus.database.value}
          </ItemValue>
        </StatusItem>
        
        <StatusItem status={adminData.systemStatus.storage.status}>
          <ItemLabel>Armazenamento</ItemLabel>
          <ItemValue status={adminData.systemStatus.storage.status}>
            {adminData.systemStatus.storage.value}
          </ItemValue>
        </StatusItem>
        
        <StatusItem status={adminData.systemStatus.backups.status}>
          <ItemLabel>Backups</ItemLabel>
          <ItemValue status={adminData.systemStatus.backups.status}>
            {adminData.systemStatus.backups.value}
          </ItemValue>
        </StatusItem>
        
        <StatusItem status={adminData.systemStatus.updates.status}>
          <ItemLabel>Atualizações</ItemLabel>
          <ItemValue status={adminData.systemStatus.updates.status}>
            {adminData.systemStatus.updates.value}
          </ItemValue>
        </StatusItem>
      </SystemStatusGrid>
      
      <UsersList>
        <h4>Usuários Recentes</h4>
        <UsersTable>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Função</th>
              <th>Último Acesso</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {adminData.recentUsers.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <Badge type={user.role}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge>
                </td>
                <td>{user.lastLogin}</td>
                <td>
                  <ActionButton onClick={() => window.location.href = `/admin/usuarios/${user.id}`}>
                    Editar
                  </ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </UsersTable>
      </UsersList>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: theme.spacing.lg }}>
        <LinkButton href="/admin/usuarios/novo">Criar Usuário</LinkButton>
        <LinkButton href="/admin/backup">Fazer Backup</LinkButton>
        <LinkButton href="/admin/configuracoes">Configurações</LinkButton>
        <LinkButton href="/admin/logs">Logs do Sistema</LinkButton>
      </div>
    </WidgetContainer>
  );
};
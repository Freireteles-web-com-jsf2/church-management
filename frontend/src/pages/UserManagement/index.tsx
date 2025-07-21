import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { useLocalAuth } from '../../contexts/LocalAuthContext';
import Layout from '../../components/Layout/Layout';
import { Table, Pagination } from '../../components/Table';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal, ConfirmModal } from '../../components/Modal';
import { Alert } from '../../components/Alert';
import UserForm from './UserForm';
import userManagementService from '../../services/userManagement';
import type { UserWithDetails, UserFilters, UserRole } from '../../services/userManagement';

const Container = styled.div`
  padding: ${theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  color: ${theme.colors.primaryDark};
  margin: 0;
  flex: 1;
`;

const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: center;
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    width: 100%;
  }
`;

const Filters = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.grayLight};
  border-radius: ${theme.borderRadius.md};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  min-width: 200px;
  
  @media (max-width: ${theme.breakpoints.md}) {
    min-width: auto;
  }
`;

const FilterLabel = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text};
`;

const Select = styled.select`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.gray};
  border-radius: ${theme.borderRadius.sm};
  background-color: ${theme.colors.white};
  font-size: ${theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primaryLight};
  }
`;

const RoleBadge = styled.span<{ role: UserRole }>`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  color: white;
  background-color: ${({ role }) => userManagementService.getRoleColor(role)};
`;

const StatusBadge = styled.span<{ isActive: boolean }>`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  color: white;
  background-color: ${({ isActive }) => isActive ? theme.colors.success : theme.colors.danger};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
`;

const BulkActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: center;
  margin-bottom: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.primaryVeryLight};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.primaryLight};
`;

const UserManagement: React.FC = () => {
  const { user: currentUser } = useLocalAuth();
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Filters
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    funcao: undefined,
    isActive: undefined,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  
  // Modals
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithDetails | null>(null);
  
  // Bulk operations
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userManagementService.listUsers({
        ...filters,
        page: currentPage,
        limit: itemsPerPage
      });
      
      setUsers(response.users);
      setTotalUsers(response.pagination.total);
      setTotalPages(Math.ceil(response.pagination.total / itemsPerPage));
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, itemsPerPage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle filter changes
  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle user actions
  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: UserWithDetails) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = (user: UserWithDetails) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await userManagementService.deleteUser(userToDelete.id);
      setSuccess('Usuário excluído com sucesso');
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir usuário');
    }
  };

  const handleToggleUserStatus = async (user: UserWithDetails) => {
    try {
      if (user.isActive) {
        await userManagementService.deactivateUser(user.id);
        setSuccess('Usuário desativado com sucesso');
      } else {
        await userManagementService.activateUser(user.id);
        setSuccess('Usuário ativado com sucesso');
      }
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar status do usuário');
    }
  };

  const handleResetPassword = async (user: UserWithDetails) => {
    try {
      const newPassword = await userManagementService.resetUserPassword(user.id);
      setSuccess(`Nova senha para ${user.name}: ${newPassword}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha');
    }
  };

  // Bulk operations
  const handleSelectUser = (userId: string, selected: boolean) => {
    if (selected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkActivate = async () => {
    try {
      await userManagementService.bulkActivateUsers(selectedUsers);
      setSuccess('Usuários ativados com sucesso');
      setSelectedUsers([]);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Erro ao ativar usuários');
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      await userManagementService.bulkDeactivateUsers(selectedUsers);
      setSuccess('Usuários desativados com sucesso');
      setSelectedUsers([]);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Erro ao desativar usuários');
    }
  };

  // Table columns
  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={selectedUsers.length === users.length && users.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      accessor: (user: UserWithDetails) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.id)}
          onChange={(e) => handleSelectUser(user.id, e.target.checked)}
        />
      ),
      width: '50px'
    },
    {
      header: 'Nome',
      accessor: 'name' as keyof UserWithDetails,
      sortable: true
    },
    {
      header: 'Email',
      accessor: 'email' as keyof UserWithDetails,
      sortable: true
    },
    {
      header: 'Função',
      accessor: (user: UserWithDetails) => (
        <RoleBadge role={user.role}>
          {userManagementService.getRoleDisplayName(user.role)}
        </RoleBadge>
      )
    },
    {
      header: 'Status',
      accessor: (user: UserWithDetails) => (
        <StatusBadge isActive={user.isActive}>
          {user.isActive ? 'Ativo' : 'Inativo'}
        </StatusBadge>
      )
    },
    {
      header: 'Grupo',
      accessor: (user: UserWithDetails) => user.grupo?.nome || '-'
    },
    {
      header: 'Ações',
      accessor: (user: UserWithDetails) => (
        <ActionButtons>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditUser(user)}
          >
            Editar
          </Button>
          <Button
            variant={user.isActive ? 'warning' : 'success'}
            size="sm"
            onClick={() => handleToggleUserStatus(user)}
          >
            {user.isActive ? 'Desativar' : 'Ativar'}
          </Button>
          {user.role === 'admin' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleResetPassword(user)}
            >
              Reset Senha
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteUser(user)}
            disabled={user.id === currentUser?.id}
          >
            Excluir
          </Button>
        </ActionButtons>
      ),
      width: '300px'
    }
  ];

  // Show bulk actions when users are selected
  useEffect(() => {
    setShowBulkActions(selectedUsers.length > 0);
  }, [selectedUsers]);

  return (
    <Layout>
      <Container>
        <Header>
          <Title>Gerenciamento de Usuários</Title>
          <Actions>
            <Button variant="primary" onClick={handleCreateUser}>
              Novo Usuário
            </Button>
          </Actions>
        </Header>

        {error && (
          <Alert
            variant="danger"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {success && (
          <Alert
            variant="success"
            message={success}
            onClose={() => setSuccess(null)}
          />
        )}

        <Filters>
          <FilterGroup>
            <FilterLabel>Buscar</FilterLabel>
            <Input
              type="text"
              placeholder="Nome ou email..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Função</FilterLabel>
            <Select
              value={filters.funcao || ''}
              onChange={(e) => handleFilterChange('funcao', e.target.value || undefined)}
            >
              <option value="">Todas</option>
              {userManagementService.getAllRoles().map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </Select>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <Select
              value={filters.isActive === undefined ? '' : filters.isActive.toString()}
              onChange={(e) => handleFilterChange('isActive', 
                e.target.value === '' ? undefined : e.target.value === 'true'
              )}
            >
              <option value="">Todos</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </Select>
          </FilterGroup>
        </Filters>

        {showBulkActions && (
          <BulkActions>
            <span>{selectedUsers.length} usuário(s) selecionado(s)</span>
            <Button
              variant="success"
              size="sm"
              onClick={handleBulkActivate}
            >
              Ativar Selecionados
            </Button>
            <Button
              variant="warning"
              size="sm"
              onClick={handleBulkDeactivate}
            >
              Desativar Selecionados
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedUsers([])}
            >
              Limpar Seleção
            </Button>
          </BulkActions>
        )}

        <Table
          columns={columns}
          data={users}
          keyExtractor={(user) => user.id}
          isLoading={loading}
          emptyMessage="Nenhum usuário encontrado"
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalUsers}
          itemsPerPage={itemsPerPage}
          showItemsPerPageSelect
          itemsPerPageOptions={[10, 25, 50, 100]}
          onItemsPerPageChange={setItemsPerPage}
        />

        {/* User Form Modal */}
        <Modal
          isOpen={showUserForm}
          onClose={() => setShowUserForm(false)}
          title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
          size="lg"
        >
          <UserForm
            user={editingUser}
            onSave={() => {
              setShowUserForm(false);
              loadUsers();
              setSuccess(editingUser ? 'Usuário atualizado com sucesso' : 'Usuário criado com sucesso');
            }}
            onCancel={() => setShowUserForm(false)}
          />
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDeleteUser}
          title="Confirmar Exclusão"
          message={
            <div>
              <p>Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>?</p>
              <p>Esta ação não pode ser desfeita.</p>
            </div>
          }
          confirmText="Excluir"
          confirmVariant="danger"
        />
      </Container>
    </Layout>
  );
};

export default UserManagement;
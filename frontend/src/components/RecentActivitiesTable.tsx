import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { EmptyState } from './EmptyState';

interface Activity {
  id: string | number;
  type: 'create' | 'update' | 'delete' | 'login' | 'other';
  description: string;
  timestamp: string;
  user: {
    id: string | number;
    name: string;
    avatar?: string;
  };
  module: 'membros' | 'financeiro' | 'eventos' | 'grupos' | 'configuracoes' | 'outros';
  entityId?: string | number;
  entityType?: string;
  entityName?: string;
}

interface Props {
  activities: Activity[];
  onViewDetails?: (activityId: string | number) => void;
  onViewEntity?: (entityId: string | number, entityType: string) => void;
  maxItems?: number;
}

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-bottom: 1px solid ${theme.colors.gray};
  }
  th {
    text-align: left;
    font-weight: ${theme.typography.fontWeight.medium};
    color: ${theme.colors.textLight};
    cursor: pointer;
    position: relative;
    
    &:hover {
      background-color: ${theme.colors.grayLight};
    }
    
    &::after {
      content: '';
      position: absolute;
      right: 8px;
      opacity: 0.5;
    }
    
    &.sort-asc::after {
      content: '↑';
    }
    
    &.sort-desc::after {
      content: '↓';
    }
  }
  tr:last-child td {
    border-bottom: none;
  }
  
  tr:hover {
    background-color: ${theme.colors.grayLight};
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'primary' ? theme.colors.primary : 'transparent'};
  color: ${props => props.variant === 'primary' ? 'white' : theme.colors.primary};
  border: 1px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.sm};
  padding: 4px 8px;
  font-size: 0.85em;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? theme.colors.primaryDark : theme.colors.grayLight};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const ActivityTypeIndicator = styled.span<{ type: string }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${props => 
    props.type === 'create' ? theme.colors.success :
    props.type === 'update' ? theme.colors.info :
    props.type === 'delete' ? theme.colors.danger :
    props.type === 'login' ? theme.colors.primary :
    theme.colors.gray
  };
`;

const ModuleBadge = styled.span<{ module: string }>`
  background: ${props => 
    props.module === 'membros' ? theme.colors.primary :
    props.module === 'financeiro' ? theme.colors.success :
    props.module === 'eventos' ? theme.colors.warning :
    props.module === 'grupos' ? theme.colors.info :
    props.module === 'configuracoes' ? theme.colors.grayDark :
    theme.colors.gray
  };
  color: white;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 0.85em;
  margin-left: 8px;
`;

const UserAvatar = styled.div<{ src?: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${theme.colors.gray};
  background-image: ${props => props.src ? `url(${props.src})` : 'none'};
  background-size: cover;
  background-position: center;
  margin-right: 8px;
  display: inline-block;
  vertical-align: middle;
  
  &::after {
    content: ${props => props.src ? '""' : '"👤"'};
    display: ${props => props.src ? 'none' : 'flex'};
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 14px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const EntityLink = styled.a`
  color: ${theme.colors.primary};
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${theme.spacing.md};
  gap: ${theme.spacing.sm};
`;

const PaginationButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? theme.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : theme.colors.text};
  border: 1px solid ${props => props.active ? theme.colors.primary : theme.colors.gray};
  border-radius: ${theme.borderRadius.sm};
  padding: 4px 10px;
  font-size: 0.85em;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? theme.colors.primaryDark : theme.colors.grayLight};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RelativeTime = styled.span`
  color: ${theme.colors.textLight};
  font-size: 0.85em;
`;

export const RecentActivitiesTable: React.FC<Props> = React.memo(({ 
  activities,
  onViewDetails = (id: string | number) => console.log(`View details for activity ${id}`),
  onViewEntity = (entityId: string | number, entityType: string) => 
    window.location.href = `/${entityType.toLowerCase()}/${entityId}`,
  maxItems = 10
}) => {
  const [sortField, setSortField] = useState<'timestamp' | 'type' | 'module'>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = maxItems;

  const handleSort = (field: 'timestamp' | 'type' | 'module') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredActivities = useMemo(() => {
    // First filter
    let result = activities;
    
    if (filter !== 'all') {
      if (filter.startsWith('type:')) {
        const typeFilter = filter.replace('type:', '');
        result = result.filter(activity => activity.type === typeFilter);
      } else if (filter.startsWith('module:')) {
        const moduleFilter = filter.replace('module:', '');
        result = result.filter(activity => activity.module === moduleFilter);
      }
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(activity => 
        activity.description.toLowerCase().includes(term) || 
        activity.user.name.toLowerCase().includes(term) ||
        (activity.entityName && activity.entityName.toLowerCase().includes(term))
      );
    }
    
    // Then sort
    return [...result].sort((a, b) => {
      if (sortField === 'timestamp') {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return sortDirection === 'asc' 
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      } else if (sortField === 'type') {
        return sortDirection === 'asc' 
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      } else {
        return sortDirection === 'asc' 
          ? a.module.localeCompare(b.module)
          : b.module.localeCompare(a.module);
      }
    });
  }, [activities, sortField, sortDirection, filter, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredActivities.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredActivities, currentPage, itemsPerPage]);

  // Format relative time
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - activityTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'agora mesmo';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
    } else {
      return activityTime.toLocaleDateString('pt-BR');
    }
  };

  // Get activity type label
  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'create': return 'Criação';
      case 'update': return 'Atualização';
      case 'delete': return 'Exclusão';
      case 'login': return 'Login';
      default: return 'Outro';
    }
  };

  // Get module label
  const getModuleLabel = (module: string) => {
    switch (module) {
      case 'membros': return 'Membros';
      case 'financeiro': return 'Financeiro';
      case 'eventos': return 'Eventos';
      case 'grupos': return 'Grupos';
      case 'configuracoes': return 'Configurações';
      default: return 'Outros';
    }
  };

  if (!activities.length) {
    return (
      <EmptyState
        icon="📋"
        title="Nenhuma atividade recente"
        description="As atividades realizadas no sistema serão registradas e exibidas aqui."
        actionText="Ir para o Dashboard"
        actionLink="/dashboard"
      />
    );
  }
  
  return (
    <>
      <FilterBar>
        <FilterGroup>
          <label htmlFor="activity-filter">Filtrar:</label>
          <select 
            id="activity-filter"
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            aria-label="Filtrar atividades por tipo"
          >
            <option value="all">Todas as atividades</option>
            <optgroup label="Por tipo">
              <option value="type:create">Criações</option>
              <option value="type:update">Atualizações</option>
              <option value="type:delete">Exclusões</option>
              <option value="type:login">Logins</option>
              <option value="type:other">Outros</option>
            </optgroup>
            <optgroup label="Por módulo">
              <option value="module:membros">Membros</option>
              <option value="module:financeiro">Financeiro</option>
              <option value="module:eventos">Eventos</option>
              <option value="module:grupos">Grupos</option>
              <option value="module:configuracoes">Configurações</option>
              <option value="module:outros">Outros</option>
            </optgroup>
          </select>
        </FilterGroup>
        
        <FilterGroup>
          <label htmlFor="activity-search">Buscar:</label>
          <input
            id="activity-search"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Descrição, usuário..."
            aria-label="Buscar atividades por descrição ou usuário"
          />
        </FilterGroup>
      </FilterBar>
      
      <TableWrapper>
        <Table role="table" tabIndex={0} aria-label="Tabela de atividades recentes">
          <thead>
            <tr>
              <th 
                scope="col"
                onClick={() => handleSort('type')}
                className={sortField === 'type' ? `sort-${sortDirection}` : ''}
                aria-sort={sortField === 'type' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Tipo
              </th>
              <th scope="col">Descrição</th>
              <th scope="col">Usuário</th>
              <th 
                scope="col"
                onClick={() => handleSort('module')}
                className={sortField === 'module' ? `sort-${sortDirection}` : ''}
                aria-sort={sortField === 'module' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Módulo
              </th>
              <th 
                scope="col"
                onClick={() => handleSort('timestamp')}
                className={sortField === 'timestamp' ? `sort-${sortDirection}` : ''}
                aria-sort={sortField === 'timestamp' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Data/Hora
              </th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedActivities.map(activity => (
              <tr key={activity.id}>
                <td>
                  <ActivityTypeIndicator type={activity.type} />
                  {getActivityTypeLabel(activity.type)}
                </td>
                <td>
                  {activity.description}
                  {activity.entityId && activity.entityType && activity.entityName && (
                    <>
                      {' - '}
                      <EntityLink 
                        onClick={() => onViewEntity(activity.entityId!, activity.entityType!)}
                        aria-label={`Ver detalhes de ${activity.entityName}`}
                      >
                        {activity.entityName}
                      </EntityLink>
                    </>
                  )}
                </td>
                <td>
                  <UserInfo>
                    <UserAvatar src={activity.user.avatar} />
                    {activity.user.name}
                  </UserInfo>
                </td>
                <td>
                  <ModuleBadge module={activity.module}>
                    {getModuleLabel(activity.module)}
                  </ModuleBadge>
                </td>
                <td>
                  <RelativeTime title={new Date(activity.timestamp).toLocaleString('pt-BR')}>
                    {getRelativeTime(activity.timestamp)}
                  </RelativeTime>
                </td>
                <td>
                  <ActionButtonGroup>
                    <ActionButton 
                      onClick={() => onViewDetails(activity.id)}
                      aria-label={`Ver detalhes da atividade ${activity.id}`}
                    >
                      Detalhes
                    </ActionButton>
                  </ActionButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
      
      {totalPages > 1 && (
        <PaginationContainer>
          <PaginationButton 
            onClick={() => setCurrentPage(1)} 
            disabled={currentPage === 1}
            aria-label="Ir para a primeira página"
          >
            &laquo;
          </PaginationButton>
          <PaginationButton 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
            disabled={currentPage === 1}
            aria-label="Ir para a página anterior"
          >
            &lsaquo;
          </PaginationButton>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <PaginationButton 
                key={pageNum}
                active={currentPage === pageNum}
                onClick={() => setCurrentPage(pageNum)}
                aria-label={`Ir para a página ${pageNum}`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </PaginationButton>
            );
          })}
          
          <PaginationButton 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
            disabled={currentPage === totalPages}
            aria-label="Ir para a próxima página"
          >
            &rsaquo;
          </PaginationButton>
          <PaginationButton 
            onClick={() => setCurrentPage(totalPages)} 
            disabled={currentPage === totalPages}
            aria-label="Ir para a última página"
          >
            &raquo;
          </PaginationButton>
        </PaginationContainer>
      )}
    </>
  );
});
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { EmptyState } from './EmptyState';

interface Event {
  id: string | number;
  name: string;
  date: string;
  time?: string;
  location?: string;
  isToday?: boolean;
  isImportant?: boolean;
  type?: 'culto' | 'reuniao' | 'evento' | 'outro';
}

interface Props {
  events: Event[];
  onViewEvent?: (eventId: string | number) => void;
  onEditEvent?: (eventId: string | number) => void;
  canEdit?: boolean;
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
  
  tr.important-event {
    background-color: rgba(243, 156, 18, 0.15); /* Versão clara do warning */
  }
  
  tr.today-event {
    background-color: rgba(46, 204, 113, 0.15); /* Versão clara do success */
  }
`;

const Badge = styled.span<{ variant?: 'success' | 'warning' | 'info' }>`
  background: ${props => 
    props.variant === 'warning' ? theme.colors.warning :
    props.variant === 'info' ? theme.colors.info :
    theme.colors.success
  };
  color: #fff;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 0.85em;
  margin-left: 8px;
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

const EventTypeIndicator = styled.span<{ type: string }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${props => 
    props.type === 'culto' ? theme.colors.primary :
    props.type === 'reuniao' ? theme.colors.info :
    props.type === 'evento' ? theme.colors.warning :
    theme.colors.gray
  };
`;

export const UpcomingEventsTable: React.FC<Props> = React.memo(({ 
  events, 
  onViewEvent = (id: string | number) => window.location.href = `/agenda/${id}`,
  onEditEvent = (id: string | number) => window.location.href = `/agenda/edit/${id}`,
  canEdit = false
}) => {
  const [sortField, setSortField] = useState<'name' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field: 'name' | 'date') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedEvents = useMemo(() => {
    // First filter
    let result = events;
    
    if (filter !== 'all') {
      result = result.filter(event => event.type === filter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(event => 
        event.name.toLowerCase().includes(term) || 
        (event.location && event.location.toLowerCase().includes(term))
      );
    }
    
    // Then sort
    return [...result].sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        // Convert date strings to Date objects for comparison
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return sortDirection === 'asc' 
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
    });
  }, [events, sortField, sortDirection, filter, searchTerm]);

  if (!events.length) {
    return (
      <EmptyState
        icon="📅"
        title="Nenhum evento futuro cadastrado"
        description="Crie eventos para manter a comunidade informada sobre cultos, reuniões e atividades especiais da igreja."
        actionText="Criar Evento"
        actionLink="/agenda"
      />
    );
  }
  
  return (
    <>
      <FilterBar>
        <FilterGroup>
          <label htmlFor="event-filter">Filtrar:</label>
          <select 
            id="event-filter"
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            aria-label="Filtrar eventos por tipo"
          >
            <option value="all">Todos</option>
            <option value="culto">Cultos</option>
            <option value="reuniao">Reuniões</option>
            <option value="evento">Eventos</option>
            <option value="outro">Outros</option>
          </select>
        </FilterGroup>
        
        <FilterGroup>
          <label htmlFor="event-search">Buscar:</label>
          <input
            id="event-search"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Nome ou local..."
            aria-label="Buscar eventos por nome ou local"
          />
        </FilterGroup>
      </FilterBar>
      
      <TableWrapper>
        <Table role="table" tabIndex={0} aria-label="Tabela de próximos eventos">
          <thead>
            <tr>
              <th 
                scope="col" 
                onClick={() => handleSort('name')}
                className={sortField === 'name' ? `sort-${sortDirection}` : ''}
                aria-sort={sortField === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Evento
              </th>
              <th 
                scope="col"
                onClick={() => handleSort('date')}
                className={sortField === 'date' ? `sort-${sortDirection}` : ''}
                aria-sort={sortField === 'date' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Data
              </th>
              <th scope="col">Horário</th>
              <th scope="col">Local</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedEvents.map(event => (
              <tr 
                key={event.id} 
                className={
                  event.isToday && event.isImportant ? 'today-event important-event' :
                  event.isToday ? 'today-event' :
                  event.isImportant ? 'important-event' : ''
                }
              >
                <td>
                  <EventTypeIndicator type={event.type || 'outro'} />
                  {event.name}
                  {event.isImportant && <Badge variant="warning">Importante</Badge>}
                </td>
                <td>
                  {event.date}
                  {event.isToday && <Badge variant="success">Hoje</Badge>}
                </td>
                <td>{event.time}</td>
                <td>{event.location}</td>
                <td>
                  <ActionButtonGroup>
                    <ActionButton 
                      onClick={() => onViewEvent(event.id)}
                      aria-label={`Visualizar detalhes do evento ${event.name}`}
                    >
                      Visualizar
                    </ActionButton>
                    {canEdit && (
                      <ActionButton 
                        variant="primary"
                        onClick={() => onEditEvent(event.id)}
                        aria-label={`Editar evento ${event.name}`}
                      >
                        Editar
                      </ActionButton>
                    )}
                  </ActionButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    </>
  );
}); 
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { EmptyState } from './EmptyState';

interface BirthdayPerson {
  id: string | number;
  name: string;
  date: string;
  age?: number;
  contact?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
}

interface Props {
  people: BirthdayPerson[];
  onSendMessage?: (personId: string | number) => void;
  onViewProfile?: (personId: string | number) => void;
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
  
  tr.today-birthday {
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

const ProfileImage = styled.div<{ src?: string }>`
  width: 32px;
  height: 32px;
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
    font-size: 16px;
  }
`;

const NameWithImage = styled.div`
  display: flex;
  align-items: center;
`;

const PeriodSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
`;

const PeriodButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? theme.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : theme.colors.text};
  border: 1px solid ${props => props.active ? theme.colors.primary : theme.colors.gray};
  border-radius: ${theme.borderRadius.sm};
  padding: 4px 8px;
  font-size: 0.85em;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? theme.colors.primaryDark : theme.colors.grayLight};
  }
`;

export const BirthdayTable: React.FC<Props> = React.memo(({ 
  people,
  onSendMessage = (id: string | number) => window.location.href = `/mensagens/novo?para=${id}`,
  onViewProfile = (id: string | number) => window.location.href = `/pessoas/${id}`
}) => {
  const [sortField, setSortField] = useState<'name' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month');

  const today = new Date();
  const todayStr = today.toLocaleDateString('pt-BR');
  
  // Calculate date range for week filter
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);
  
  const handleSort = (field: 'name' | 'date') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedPeople = useMemo(() => {
    // First filter by period
    let result = [...people];
    
    if (period === 'today') {
      result = result.filter(person => person.date === todayStr);
    } else if (period === 'week') {
      result = result.filter(person => {
        // Convert date string (DD/MM/YYYY) to Date object
        const parts = person.date.split('/');
        if (parts.length !== 3) return false;
        
        const personDate = new Date();
        personDate.setDate(parseInt(parts[0]));
        personDate.setMonth(parseInt(parts[1]) - 1);
        
        // Only compare day and month, not year
        const personDay = personDate.getDate();
        const personMonth = personDate.getMonth();
        
        // Check if date is within the next 7 days
        for (let i = 0; i <= 7; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() + i);
          
          if (personDay === checkDate.getDate() && personMonth === checkDate.getMonth()) {
            return true;
          }
        }
        
        return false;
      });
    }
    
    // Then filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(person => 
        person.name.toLowerCase().includes(term) || 
        (person.contact && person.contact.toLowerCase().includes(term))
      );
    }
    
    // Then sort
    return result.sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        // Extract day and month for comparison (ignoring year)
        const [dayA, monthA] = a.date.split('/');
        const [dayB, monthB] = b.date.split('/');
        
        // Create date objects with the current year
        const dateA = new Date(today.getFullYear(), parseInt(monthA) - 1, parseInt(dayA));
        const dateB = new Date(today.getFullYear(), parseInt(monthB) - 1, parseInt(dayB));
        
        // If the date has already passed this year, add a year for sorting purposes
        if (dateA < today && dateA.getMonth() < today.getMonth()) {
          dateA.setFullYear(dateA.getFullYear() + 1);
        }
        if (dateB < today && dateB.getMonth() < today.getMonth()) {
          dateB.setFullYear(dateB.getFullYear() + 1);
        }
        
        return sortDirection === 'asc' 
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
    });
  }, [people, sortField, sortDirection, searchTerm, period, todayStr]);

  if (!people.length) {
    return (
      <EmptyState
        icon="🎂"
        title="Nenhum aniversariante encontrado"
        description="Cadastre pessoas com suas datas de nascimento para acompanhar aniversários e fortalecer relacionamentos na comunidade."
        actionText="Cadastrar Pessoa"
        actionLink="/pessoas"
      />
    );
  }
  
  return (
    <>
      <FilterBar>
        <FilterGroup>
          <label htmlFor="birthday-search">Buscar:</label>
          <input
            id="birthday-search"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Nome ou contato..."
            aria-label="Buscar aniversariantes por nome ou contato"
          />
        </FilterGroup>
        
        <PeriodSelector>
          <PeriodButton 
            active={period === 'today'} 
            onClick={() => setPeriod('today')}
            aria-pressed={period === 'today'}
          >
            Hoje
          </PeriodButton>
          <PeriodButton 
            active={period === 'week'} 
            onClick={() => setPeriod('week')}
            aria-pressed={period === 'week'}
          >
            Próximos 7 dias
          </PeriodButton>
          <PeriodButton 
            active={period === 'month'} 
            onClick={() => setPeriod('month')}
            aria-pressed={period === 'month'}
          >
            Este mês
          </PeriodButton>
        </PeriodSelector>
      </FilterBar>
      
      <TableWrapper>
        <Table role="table" tabIndex={0} aria-label="Tabela de aniversariantes">
          <thead>
            <tr>
              <th 
                scope="col" 
                onClick={() => handleSort('name')}
                className={sortField === 'name' ? `sort-${sortDirection}` : ''}
                aria-sort={sortField === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Nome
              </th>
              <th 
                scope="col"
                onClick={() => handleSort('date')}
                className={sortField === 'date' ? `sort-${sortDirection}` : ''}
                aria-sort={sortField === 'date' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                Data
              </th>
              <th scope="col">Idade</th>
              <th scope="col">Contato</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedPeople.map(person => (
              <tr 
                key={person.id} 
                className={person.date === todayStr ? 'today-birthday' : ''}
              >
                <td>
                  <NameWithImage>
                    <ProfileImage src={person.profileImage} />
                    {person.name}
                  </NameWithImage>
                </td>
                <td>
                  {person.date}
                  {person.date === todayStr && <Badge variant="success">Hoje</Badge>}
                </td>
                <td>{person.age ? `${person.age} anos` : '-'}</td>
                <td>
                  {person.contact || (person.phone || person.email) ? (
                    <div>
                      {person.contact || ''}
                      {!person.contact && person.phone && <div>{person.phone}</div>}
                      {!person.contact && person.email && <div>{person.email}</div>}
                    </div>
                  ) : '-'}
                </td>
                <td>
                  <ActionButtonGroup>
                    <ActionButton 
                      onClick={() => onViewProfile(person.id)}
                      aria-label={`Ver perfil de ${person.name}`}
                    >
                      Ver Perfil
                    </ActionButton>
                    <ActionButton 
                      variant="primary"
                      onClick={() => onSendMessage(person.id)}
                      aria-label={`Enviar mensagem para ${person.name}`}
                    >
                      Enviar Mensagem
                    </ActionButton>
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
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Layout, Button, Card, CardHeader, CardBody, Table, Pagination } from '../../components';

const PessoasContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const PessoasHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.sm};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
`;

const FilterLabel = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.textLight};
`;

const FilterSelect = styled.select`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border: 1px solid ${theme.colors.gray};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.sm};
`;

const SearchInput = styled.input`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border: 1px solid ${theme.colors.gray};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.sm};
  flex: 1;
  min-width: 250px;
`;

const StatusBadge = styled.span<{ status: 'ativo' | 'inativo' }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  background-color: ${({ status }) => 
    status === 'ativo' 
      ? 'rgba(46, 204, 113, 0.1)' 
      : 'rgba(231, 76, 60, 0.1)'
  };
  color: ${({ status }) => 
    status === 'ativo' 
      ? theme.colors.success 
      : theme.colors.danger
  };
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  margin: 0 ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  
  &:hover {
    background-color: ${theme.colors.primaryVeryLight};
  }
`;

const Pessoas: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    grupo: '',
    funcao: ''
  });
  
  // Dados de exemplo
  const pessoas = [
    { id: 1, nome: 'João Silva', email: 'joao.silva@exemplo.com', telefone: '(11) 98765-4321', funcao: 'Pastor', grupo: 'Louvor', status: 'ativo' as const },
    { id: 2, nome: 'Maria Oliveira', email: 'maria.oliveira@exemplo.com', telefone: '(11) 91234-5678', funcao: 'Líder', grupo: 'Jovens', status: 'ativo' as const },
    { id: 3, nome: 'Pedro Santos', email: 'pedro.santos@exemplo.com', telefone: '(11) 99876-5432', funcao: 'Membro', grupo: 'Adultos', status: 'ativo' as const },
    { id: 4, nome: 'Ana Costa', email: 'ana.costa@exemplo.com', telefone: '(11) 98765-1234', funcao: 'Voluntário', grupo: 'Louvor', status: 'inativo' as const },
    { id: 5, nome: 'Lucas Ferreira', email: 'lucas.ferreira@exemplo.com', telefone: '(11) 91234-9876', funcao: 'Membro', grupo: 'Jovens', status: 'ativo' as const },
  ];
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset para a primeira página ao filtrar
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset para a primeira página ao pesquisar
  };
  
  // Filtrar pessoas
  const filteredPessoas = pessoas.filter(pessoa => {
    const matchesSearch = searchTerm === '' || 
      pessoa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pessoa.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pessoa.telefone.includes(searchTerm);
    
    const matchesStatus = filters.status === '' || pessoa.status === filters.status;
    const matchesGrupo = filters.grupo === '' || pessoa.grupo === filters.grupo;
    const matchesFuncao = filters.funcao === '' || pessoa.funcao === filters.funcao;
    
    return matchesSearch && matchesStatus && matchesGrupo && matchesFuncao;
  });
  
  // Configuração da tabela
  const columns = [
    { 
      header: 'Nome', 
      accessor: (pessoa: typeof pessoas[0]) => (
        <div>
          <div style={{ fontWeight: 500 }}>{pessoa.nome}</div>
          <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textLight }}>{pessoa.email}</div>
        </div>
      )
    },
    { header: 'Telefone', accessor: 'telefone' },
    { header: 'Função', accessor: 'funcao' },
    { header: 'Grupo', accessor: 'grupo' },
    { 
      header: 'Status', 
      accessor: (pessoa: typeof pessoas[0]) => (
        <StatusBadge status={pessoa.status}>
          {pessoa.status === 'ativo' ? 'Ativo' : 'Inativo'}
        </StatusBadge>
      )
    },
    { 
      header: 'Ações', 
      accessor: (pessoa: typeof pessoas[0]) => (
        <div>
          <Link to={`/pessoas/${pessoa.id}`}>
            <ActionButton title="Editar">
              ✏️
            </ActionButton>
          </Link>
          <ActionButton title="Excluir" onClick={() => alert(`Excluir pessoa ${pessoa.id}`)}>
            🗑️
          </ActionButton>
          <ActionButton title="Visualizar" onClick={() => alert(`Visualizar pessoa ${pessoa.id}`)}>
            👁️
          </ActionButton>
        </div>
      )
    },
  ];
  
  return (
    <Layout>
      <PessoasContainer>
        <PessoasHeader>
          <h1>Pessoas</h1>
          <Link to="/pessoas/novo">
            <Button>
              <span>Adicionar Pessoa</span>
            </Button>
          </Link>
        </PessoasHeader>
        
        <FilterContainer>
          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <FilterSelect 
              name="status" 
              value={filters.status} 
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Grupo</FilterLabel>
            <FilterSelect 
              name="grupo" 
              value={filters.grupo} 
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="Jovens">Jovens</option>
              <option value="Adultos">Adultos</option>
              <option value="Louvor">Louvor</option>
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Função</FilterLabel>
            <FilterSelect 
              name="funcao" 
              value={filters.funcao} 
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>
              <option value="Pastor">Pastor</option>
              <option value="Líder">Líder</option>
              <option value="Membro">Membro</option>
              <option value="Voluntário">Voluntário</option>
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Buscar</FilterLabel>
            <SearchInput 
              type="text" 
              placeholder="Nome, email ou telefone..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </FilterGroup>
        </FilterContainer>
        
        <Card>
          <CardBody>
            <Table
              columns={columns}
              data={filteredPessoas}
              keyExtractor={(item) => item.id.toString()}
              emptyMessage="Nenhuma pessoa encontrada"
            />
            
            <div style={{ marginTop: theme.spacing.lg }}>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredPessoas.length / 10)}
                onPageChange={setCurrentPage}
                totalItems={filteredPessoas.length}
                itemsPerPage={10}
              />
            </div>
          </CardBody>
        </Card>
      </PessoasContainer>
    </Layout>
  );
};

export default Pessoas;
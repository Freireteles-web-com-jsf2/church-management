import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecentActivitiesTable } from '../RecentActivitiesTable';

describe('RecentActivitiesTable', () => {
  const mockActivities = [
    { 
      id: '1', 
      type: 'create', 
      description: 'Criou um novo membro', 
      timestamp: '2024-07-21T10:30:00Z',
      user: {
        id: '101',
        name: 'João Silva',
        avatar: '/avatars/joao.jpg'
      },
      module: 'membros',
      entityId: '201',
      entityType: 'membros',
      entityName: 'Maria Santos'
    },
    { 
      id: '2', 
      type: 'update', 
      description: 'Atualizou informações financeiras', 
      timestamp: '2024-07-21T09:15:00Z',
      user: {
        id: '102',
        name: 'Ana Oliveira',
      },
      module: 'financeiro',
      entityId: '202',
      entityType: 'lancamentos',
      entityName: 'Dízimo Julho'
    },
    { 
      id: '3', 
      type: 'login', 
      description: 'Realizou login no sistema', 
      timestamp: '2024-07-20T18:45:00Z',
      user: {
        id: '103',
        name: 'Carlos Pereira',
        avatar: '/avatars/carlos.jpg'
      },
      module: 'outros'
    },
  ] as any[];

  it('renderiza tabela com atividades', () => {
    render(<RecentActivitiesTable activities={mockActivities} />);
    expect(screen.getByText('Criou um novo membro')).toBeInTheDocument();
    expect(screen.getByText('Atualizou informações financeiras')).toBeInTheDocument();
    expect(screen.getByText('Realizou login no sistema')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Ana Oliveira')).toBeInTheDocument();
    expect(screen.getByText('Carlos Pereira')).toBeInTheDocument();
  });

  it('exibe estado vazio quando não há atividades', () => {
    render(<RecentActivitiesTable activities={[]} />);
    expect(screen.getByText(/Nenhuma atividade recente/i)).toBeInTheDocument();
    expect(screen.getByText(/As atividades realizadas no sistema serão registradas e exibidas aqui./i)).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument();
  });

  it('renderiza cabeçalhos da tabela', () => {
    render(<RecentActivitiesTable activities={mockActivities} />);
    expect(screen.getByText('Tipo')).toBeInTheDocument();
    expect(screen.getByText('Descrição')).toBeInTheDocument();
    expect(screen.getByText('Usuário')).toBeInTheDocument();
    expect(screen.getByText('Módulo')).toBeInTheDocument();
    expect(screen.getByText('Data/Hora')).toBeInTheDocument();
    expect(screen.getByText('Ações')).toBeInTheDocument();
  });

  it('renderiza filtros e campo de busca', () => {
    render(<RecentActivitiesTable activities={mockActivities} />);
    expect(screen.getByLabelText('Filtrar:')).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar:')).toBeInTheDocument();
    expect(screen.getByText('Todas as atividades')).toBeInTheDocument();
    expect(screen.getByText('Criações')).toBeInTheDocument();
    expect(screen.getByText('Atualizações')).toBeInTheDocument();
  });

  it('filtra atividades por tipo', () => {
    render(<RecentActivitiesTable activities={mockActivities} />);
    
    // Inicialmente todas as atividades são mostradas
    expect(screen.getByText('Criou um novo membro')).toBeInTheDocument();
    expect(screen.getByText('Atualizou informações financeiras')).toBeInTheDocument();
    expect(screen.getByText('Realizou login no sistema')).toBeInTheDocument();
    
    // Filtrar por criações
    fireEvent.change(screen.getByLabelText('Filtrar atividades por tipo'), { target: { value: 'type:create' } });
    expect(screen.getByText('Criou um novo membro')).toBeInTheDocument();
    expect(screen.queryByText('Atualizou informações financeiras')).not.toBeInTheDocument();
    expect(screen.queryByText('Realizou login no sistema')).not.toBeInTheDocument();
    
    // Filtrar por módulo financeiro
    fireEvent.change(screen.getByLabelText('Filtrar atividades por tipo'), { target: { value: 'module:financeiro' } });
    expect(screen.queryByText('Criou um novo membro')).not.toBeInTheDocument();
    expect(screen.getByText('Atualizou informações financeiras')).toBeInTheDocument();
    expect(screen.queryByText('Realizou login no sistema')).not.toBeInTheDocument();
  });

  it('busca atividades por texto', () => {
    render(<RecentActivitiesTable activities={mockActivities} />);
    
    // Buscar por "membro"
    fireEvent.change(screen.getByLabelText('Buscar atividades por descrição ou usuário'), { target: { value: 'membro' } });
    expect(screen.getByText('Criou um novo membro')).toBeInTheDocument();
    expect(screen.queryByText('Atualizou informações financeiras')).not.toBeInTheDocument();
    expect(screen.queryByText('Realizou login no sistema')).not.toBeInTheDocument();
    
    // Buscar por "João"
    fireEvent.change(screen.getByLabelText('Buscar atividades por descrição ou usuário'), { target: { value: 'João' } });
    expect(screen.getByText('Criou um novo membro')).toBeInTheDocument();
    expect(screen.queryByText('Atualizou informações financeiras')).not.toBeInTheDocument();
    expect(screen.queryByText('Realizou login no sistema')).not.toBeInTheDocument();
  });

  it('ordena atividades por timestamp', () => {
    render(<RecentActivitiesTable activities={mockActivities} />);
    
    // Por padrão, as atividades são ordenadas por timestamp em ordem decrescente
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Criou um novo membro');
    expect(rows[2]).toHaveTextContent('Atualizou informações financeiras');
    expect(rows[3]).toHaveTextContent('Realizou login no sistema');
    
    // Clicar no cabeçalho "Data/Hora" para inverter a ordem
    fireEvent.click(screen.getByText('Data/Hora'));
    
    // Agora as atividades devem estar em ordem crescente
    const rowsReversed = screen.getAllByRole('row');
    expect(rowsReversed[1]).toHaveTextContent('Realizou login no sistema');
    expect(rowsReversed[2]).toHaveTextContent('Atualizou informações financeiras');
    expect(rowsReversed[3]).toHaveTextContent('Criou um novo membro');
  });

  it('renderiza botões de ação', () => {
    render(<RecentActivitiesTable activities={mockActivities} />);
    
    // Verificar se os botões de detalhes estão presentes
    expect(screen.getAllByText('Detalhes').length).toBe(3);
  });
});
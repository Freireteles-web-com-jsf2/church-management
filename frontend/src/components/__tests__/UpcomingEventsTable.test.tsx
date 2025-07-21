import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UpcomingEventsTable } from '../UpcomingEventsTable';

describe('UpcomingEventsTable', () => {
  const mockEvents = [
    { 
      id: '1', 
      name: 'Culto Domingo', 
      date: '21/07/2024', 
      time: '19:00', 
      location: 'Igreja Principal',
      type: 'culto'
    },
    { 
      id: '2', 
      name: 'Reunião de Líderes', 
      date: '22/07/2024', 
      time: '20:00', 
      location: 'Sala de Reuniões', 
      isToday: true,
      type: 'reuniao'
    },
    { 
      id: '3', 
      name: 'Evento Especial', 
      date: '25/07/2024', 
      time: '15:00', 
      location: 'Auditório', 
      isImportant: true,
      type: 'evento'
    },
  ];

  it('renderiza tabela com eventos', () => {
    render(<UpcomingEventsTable events={mockEvents} />);
    expect(screen.getByText('Culto Domingo')).toBeInTheDocument();
    expect(screen.getByText('Reunião de Líderes')).toBeInTheDocument();
    expect(screen.getByText('Igreja Principal')).toBeInTheDocument();
    expect(screen.getByText('Hoje')).toBeInTheDocument();
    expect(screen.getByText('Evento Especial')).toBeInTheDocument();
    expect(screen.getByText('Importante')).toBeInTheDocument();
  });

  it('exibe estado vazio quando não há eventos', () => {
    render(<UpcomingEventsTable events={[]} />);
    expect(screen.getByText(/Nenhum evento futuro cadastrado/i)).toBeInTheDocument();
    expect(screen.getByText(/Criar Evento/i)).toBeInTheDocument();
    expect(screen.getByText('📅')).toBeInTheDocument();
  });

  it('renderiza cabeçalhos da tabela', () => {
    render(<UpcomingEventsTable events={mockEvents} />);
    expect(screen.getByText('Evento')).toBeInTheDocument();
    expect(screen.getByText('Data')).toBeInTheDocument();
    expect(screen.getByText('Horário')).toBeInTheDocument();
    expect(screen.getByText('Local')).toBeInTheDocument();
    expect(screen.getByText('Ações')).toBeInTheDocument();
  });

  it('renderiza filtros e campo de busca', () => {
    render(<UpcomingEventsTable events={mockEvents} />);
    expect(screen.getByLabelText('Filtrar:')).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar:')).toBeInTheDocument();
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Cultos')).toBeInTheDocument();
    expect(screen.getByText('Reuniões')).toBeInTheDocument();
  });

  it('filtra eventos por tipo', () => {
    render(<UpcomingEventsTable events={mockEvents} />);
    
    // Inicialmente todos os eventos são mostrados
    expect(screen.getByText('Culto Domingo')).toBeInTheDocument();
    expect(screen.getByText('Reunião de Líderes')).toBeInTheDocument();
    expect(screen.getByText('Evento Especial')).toBeInTheDocument();
    
    // Filtrar por cultos
    fireEvent.change(screen.getByLabelText('Filtrar eventos por tipo'), { target: { value: 'culto' } });
    expect(screen.getByText('Culto Domingo')).toBeInTheDocument();
    expect(screen.queryByText('Reunião de Líderes')).not.toBeInTheDocument();
    expect(screen.queryByText('Evento Especial')).not.toBeInTheDocument();
    
    // Filtrar por eventos
    fireEvent.change(screen.getByLabelText('Filtrar eventos por tipo'), { target: { value: 'evento' } });
    expect(screen.queryByText('Culto Domingo')).not.toBeInTheDocument();
    expect(screen.queryByText('Reunião de Líderes')).not.toBeInTheDocument();
    expect(screen.getByText('Evento Especial')).toBeInTheDocument();
  });

  it('busca eventos por texto', () => {
    render(<UpcomingEventsTable events={mockEvents} />);
    
    // Buscar por "Domingo"
    fireEvent.change(screen.getByLabelText('Buscar eventos por nome ou local'), { target: { value: 'Domingo' } });
    expect(screen.getByText('Culto Domingo')).toBeInTheDocument();
    expect(screen.queryByText('Reunião de Líderes')).not.toBeInTheDocument();
    expect(screen.queryByText('Evento Especial')).not.toBeInTheDocument();
    
    // Buscar por "Sala"
    fireEvent.change(screen.getByLabelText('Buscar eventos por nome ou local'), { target: { value: 'Sala' } });
    expect(screen.queryByText('Culto Domingo')).not.toBeInTheDocument();
    expect(screen.getByText('Reunião de Líderes')).toBeInTheDocument();
    expect(screen.queryByText('Evento Especial')).not.toBeInTheDocument();
  });

  it('ordena eventos por nome', () => {
    render(<UpcomingEventsTable events={mockEvents} />);
    
    // Clicar no cabeçalho "Evento" para ordenar por nome
    fireEvent.click(screen.getByText('Evento'));
    
    // Verificar ordem alfabética (Culto, Evento, Reunião)
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Culto Domingo');
    expect(rows[2]).toHaveTextContent('Evento Especial');
    expect(rows[3]).toHaveTextContent('Reunião de Líderes');
    
    // Clicar novamente para inverter a ordem
    fireEvent.click(screen.getByText('Evento'));
    
    // Verificar ordem alfabética inversa (Reunião, Evento, Culto)
    const rowsReversed = screen.getAllByRole('row');
    expect(rowsReversed[1]).toHaveTextContent('Reunião de Líderes');
    expect(rowsReversed[2]).toHaveTextContent('Evento Especial');
    expect(rowsReversed[3]).toHaveTextContent('Culto Domingo');
  });

  it('renderiza botões de ação', () => {
    render(<UpcomingEventsTable events={mockEvents} canEdit={true} />);
    
    // Verificar se os botões de ação estão presentes
    expect(screen.getAllByText('Visualizar').length).toBe(3);
    expect(screen.getAllByText('Editar').length).toBe(3);
  });

  it('não renderiza botão de editar quando canEdit é false', () => {
    render(<UpcomingEventsTable events={mockEvents} canEdit={false} />);
    
    // Verificar se os botões de visualizar estão presentes mas os de editar não
    expect(screen.getAllByText('Visualizar').length).toBe(3);
    expect(screen.queryByText('Editar')).not.toBeInTheDocument();
  });
});
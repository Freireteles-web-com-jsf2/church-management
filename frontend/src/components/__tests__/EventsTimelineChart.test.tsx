import React from 'react';
import { render, screen } from '@testing-library/react';
import { EventsTimelineChart } from '../EventsTimelineChart';
import type { TimelineEvent } from '../EventsTimelineChart';

describe('EventsTimelineChart', () => {
  const mockEvents: TimelineEvent[] = [
    { id: '1', name: 'Culto Domingo', date: '2024-07-21', important: false },
    { id: '2', name: 'Reunião Especial', date: '2024-07-22', important: true },
    { id: '3', name: 'Estudo Bíblico', date: '2024-07-23', important: false },
  ];

  it('renderiza gráfico com eventos', () => {
    render(<EventsTimelineChart events={mockEvents} />);
    expect(screen.getByText('◀')).toBeInTheDocument();
    expect(screen.getByText('▶')).toBeInTheDocument();
  });

  it('exibe estado vazio quando não há eventos', () => {
    render(<EventsTimelineChart events={[]} />);
    expect(screen.getByText(/Nenhum evento futuro cadastrado/i)).toBeInTheDocument();
    expect(screen.getByText(/Criar Evento/i)).toBeInTheDocument();
    expect(screen.getByText('📅')).toBeInTheDocument();
  });

  it('exibe legenda de eventos importantes e comuns', () => {
    render(<EventsTimelineChart events={mockEvents} />);
    expect(screen.getByText('Evento importante')).toBeInTheDocument();
    expect(screen.getByText('Evento comum')).toBeInTheDocument();
  });

  it('renderiza controles de navegação', () => {
    render(<EventsTimelineChart events={mockEvents} />);
    const prevButton = screen.getByText('◀');
    const nextButton = screen.getByText('▶');
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });
});
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

const TasksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const TaskCard = styled.div<{ priority: 'high' | 'medium' | 'low' }>`
  background: ${theme.colors.grayLight};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  border-left: 4px solid ${({ priority }) => {
    switch (priority) {
      case 'high': return theme.colors.danger;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
    }
  }};
  cursor: pointer;
  transition: transform ${theme.transitions.normal};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.sm};
  }
`;

const TaskTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: ${theme.spacing.xs};
`;

const TaskDetails = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textLight};
`;

const EventsList = styled.div`
  margin-top: ${theme.spacing.lg};
`;

const EventItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.grayLight};
  
  &:last-child {
    border-bottom: none;
  }
`;

const EventDate = styled.div`
  background: ${theme.colors.primary};
  color: white;
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const EventDay = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const EventInfo = styled.div`
  flex: 1;
`;

const EventTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
`;

const EventDetails = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textLight};
`;

const ActionButton = styled.button`
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  margin-left: ${theme.spacing.md};
  
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

const Badge = styled.span<{ type: 'assigned' | 'completed' | 'pending' }>`
  display: inline-block;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: ${theme.typography.fontSize.xs};
  background: ${({ type }) => {
    switch (type) {
      case 'assigned': return 'rgba(52, 152, 219, 0.1)';
      case 'completed': return 'rgba(46, 204, 113, 0.1)';
      case 'pending': return 'rgba(241, 196, 15, 0.1)';
    }
  }};
  color: ${({ type }) => {
    switch (type) {
      case 'assigned': return theme.colors.info;
      case 'completed': return theme.colors.success;
      case 'pending': return theme.colors.warning;
    }
  }};
  margin-left: ${theme.spacing.xs};
`;

export const VolunteerWidget: React.FC = () => {
  const { dashboardData, loading } = useDashboardContext();
  
  // Dados mockados para o widget do voluntário
  const volunteerData = {
    tasks: [
      { 
        id: 1, 
        title: 'Preparar Decoração', 
        event: 'Culto de Jovens', 
        dueDate: '24/07/2025', 
        priority: 'high' as const,
        status: 'assigned' as const
      },
      { 
        id: 2, 
        title: 'Organizar Recepção', 
        event: 'Culto de Domingo', 
        dueDate: '25/07/2025', 
        priority: 'medium' as const,
        status: 'pending' as const
      },
      { 
        id: 3, 
        title: 'Preparar Lanche', 
        event: 'Encontro de Casais', 
        dueDate: '30/07/2025', 
        priority: 'low' as const,
        status: 'assigned' as const
      }
    ],
    eventsResponsible: [
      { 
        id: 1, 
        title: 'Culto de Jovens', 
        date: '25/07', 
        time: '19:00', 
        location: 'Salão Principal',
        role: 'Decoração e Recepção'
      },
      { 
        id: 2, 
        title: 'Culto de Domingo', 
        date: '26/07', 
        time: '10:00', 
        location: 'Templo Principal',
        role: 'Recepção'
      },
      { 
        id: 3, 
        title: 'Encontro de Casais', 
        date: '30/07', 
        time: '20:00', 
        location: 'Salão de Festas',
        role: 'Preparação de Lanche'
      }
    ],
    completedTasks: [
      { 
        id: 4, 
        title: 'Organizar Materiais', 
        event: 'Escola Dominical', 
        completedDate: '19/07/2025', 
        status: 'completed' as const
      },
      { 
        id: 5, 
        title: 'Preparar Apresentação', 
        event: 'Reunião de Líderes', 
        completedDate: '18/07/2025', 
        status: 'completed' as const
      }
    ]
  };
  
  if (loading) {
    return (
      <WidgetContainer>
        <WidgetTitle>🤝 Painel do Voluntário (Carregando...)</WidgetTitle>
      </WidgetContainer>
    );
  }
  
  return (
    <WidgetContainer>
      <WidgetTitle>🤝 Painel do Voluntário</WidgetTitle>
      
      <h4>Suas Tarefas</h4>
      <TasksGrid>
        {volunteerData.tasks.map(task => (
          <TaskCard 
            key={task.id} 
            priority={task.priority}
            onClick={() => window.location.href = `/tarefas/${task.id}`}
          >
            <TaskTitle>
              {task.title}
              {task.status === 'assigned' && <Badge type="assigned">Atribuída</Badge>}
              {task.status === 'pending' && <Badge type="pending">Pendente</Badge>}
            </TaskTitle>
            <TaskDetails>
              <div>Evento: {task.event}</div>
              <div>Prazo: {task.dueDate}</div>
              <div>Prioridade: {
                task.priority === 'high' ? 'Alta' : 
                task.priority === 'medium' ? 'Média' : 'Baixa'
              }</div>
            </TaskDetails>
          </TaskCard>
        ))}
      </TasksGrid>
      
      <EventsList>
        <h4>Eventos em que Você é Responsável</h4>
        {volunteerData.eventsResponsible.map(event => (
          <EventItem key={event.id}>
            <EventDate>
              <EventDay>{event.date.split('/')[0]}</EventDay>
              <div>{event.date.split('/')[1]}</div>
            </EventDate>
            <EventInfo>
              <EventTitle>{event.title}</EventTitle>
              <EventDetails>
                {event.time} • {event.location}
              </EventDetails>
              <EventDetails>
                <strong>Sua função:</strong> {event.role}
              </EventDetails>
            </EventInfo>
            <ActionButton onClick={() => window.location.href = `/agenda/eventos/${event.id}`}>
              Detalhes
            </ActionButton>
          </EventItem>
        ))}
      </EventsList>
      
      <EventsList>
        <h4>Tarefas Concluídas Recentemente</h4>
        {volunteerData.completedTasks.map(task => (
          <EventItem key={task.id}>
            <EventInfo>
              <EventTitle>
                {task.title}
                <Badge type="completed">Concluída</Badge>
              </EventTitle>
              <EventDetails>
                Evento: {task.event} • Concluída em: {task.completedDate}
              </EventDetails>
            </EventInfo>
          </EventItem>
        ))}
      </EventsList>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: theme.spacing.lg }}>
        <LinkButton href="/tarefas">Ver Todas as Tarefas</LinkButton>
        <LinkButton href="/agenda">Ver Agenda Completa</LinkButton>
      </div>
    </WidgetContainer>
  );
};
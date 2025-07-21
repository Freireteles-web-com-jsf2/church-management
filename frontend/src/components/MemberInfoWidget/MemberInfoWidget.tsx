import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

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

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const InfoCard = styled.div`
  background: ${theme.colors.grayLight};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  border-left: 4px solid ${theme.colors.primary};
`;

const InfoTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: ${theme.spacing.xs};
`;

const InfoContent = styled.div`
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

const LinkButton = styled.a`
  display: inline-block;
  background: ${theme.colors.primary};
  color: white;
  text-decoration: none;
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  margin-top: ${theme.spacing.md};
  
  &:hover {
    background: ${theme.colors.primaryDark};
  }
`;

export const MemberInfoWidget: React.FC = () => {
  const { user } = useAuth();
  
  // Dados mockados para o widget do membro
  const memberInfo = {
    groups: [
      { id: 1, name: 'Grupo de Jovens', leader: 'Carlos Silva', meetingDay: 'Sextas, 19h' },
      { id: 2, name: 'Grupo de Música', leader: 'Ana Costa', meetingDay: 'Quartas, 20h' }
    ],
    upcomingEvents: [
      { id: 1, title: 'Culto de Jovens', date: '25/07', time: '19:00', location: 'Salão Principal' },
      { id: 2, title: 'Ensaio do Coral', date: '27/07', time: '18:30', location: 'Sala de Música' },
      { id: 3, title: 'Encontro de Casais', date: '30/07', time: '20:00', location: 'Salão de Festas' }
    ],
    contributions: {
      lastContribution: '15/07/2025',
      amount: 'R$ 100,00',
      status: 'Em dia'
    }
  };
  
  return (
    <WidgetContainer>
      <WidgetTitle>👋 Olá, {user?.name || 'Membro'}!</WidgetTitle>
      
      <InfoGrid>
        <InfoCard>
          <InfoTitle>Seus Grupos</InfoTitle>
          <InfoContent>
            {memberInfo.groups.map(group => (
              <div key={group.id} style={{ marginBottom: theme.spacing.xs }}>
                <div><strong>{group.name}</strong></div>
                <div>Líder: {group.leader}</div>
                <div>Reuniões: {group.meetingDay}</div>
              </div>
            ))}
          </InfoContent>
          <LinkButton href="/grupos" style={{ marginTop: theme.spacing.sm }}>Ver Todos os Grupos</LinkButton>
        </InfoCard>
        
        <InfoCard>
          <InfoTitle>Suas Contribuições</InfoTitle>
          <InfoContent>
            <div>Última contribuição: {memberInfo.contributions.lastContribution}</div>
            <div>Valor: {memberInfo.contributions.amount}</div>
            <div>Status: {memberInfo.contributions.status}</div>
          </InfoContent>
          <LinkButton href="/contribuicoes" style={{ marginTop: theme.spacing.sm }}>Fazer Contribuição</LinkButton>
        </InfoCard>
      </InfoGrid>
      
      <EventsList>
        <h4>Próximos Eventos</h4>
        {memberInfo.upcomingEvents.map(event => (
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
            </EventInfo>
          </EventItem>
        ))}
        <LinkButton href="/agenda" style={{ marginTop: theme.spacing.md }}>Ver Todos os Eventos</LinkButton>
      </EventsList>
    </WidgetContainer>
  );
};
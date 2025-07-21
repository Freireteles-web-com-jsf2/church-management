import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { Layout, Card, CardHeader, CardBody } from '../components';
import { EmptyState } from '../components/EmptyState';
import { MembersDistributionChart } from '../components/MembersDistributionChart';
import { EventsTimelineChart } from '../components/EventsTimelineChart';
import { UpcomingEventsTable } from '../components/UpcomingEventsTable';
import { BirthdayTable } from '../components/BirthdayTable';
import { RecentActivitiesTable } from '../components/RecentActivitiesTable';

const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${theme.spacing.lg};
`;

const EmptyStateDemo: React.FC = () => {
  return (
    <Layout>
      <DemoContainer>
        <h1>Demo: Tratamento de Dados Insuficientes</h1>
        <p>Esta página demonstra como os componentes lidam com dados insuficientes ou vazios.</p>
        
        <DemoGrid>
          <Card>
            <CardHeader>
              <h3>EmptyState Component</h3>
            </CardHeader>
            <CardBody>
              <EmptyState
                icon="🎯"
                title="Componente EmptyState"
                description="Este é um exemplo do componente EmptyState com ação personalizada."
                actionText="Ação de Exemplo"
                onAction={() => alert('Ação executada!')}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3>Gráfico de Distribuição de Membros (Vazio)</h3>
            </CardHeader>
            <CardBody>
              <MembersDistributionChart data={[]} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3>Timeline de Eventos (Vazio)</h3>
            </CardHeader>
            <CardBody>
              <EventsTimelineChart events={[]} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3>Tabela de Próximos Eventos (Vazio)</h3>
            </CardHeader>
            <CardBody>
              <UpcomingEventsTable events={[]} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3>Tabela de Aniversariantes (Vazio)</h3>
            </CardHeader>
            <CardBody>
              <BirthdayTable people={[]} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3>Tabela de Atividades Recentes (Vazio)</h3>
            </CardHeader>
            <CardBody>
              <RecentActivitiesTable activities={[]} />
            </CardBody>
          </Card>
        </DemoGrid>
      </DemoContainer>
    </Layout>
  );
};

export default EmptyStateDemo;
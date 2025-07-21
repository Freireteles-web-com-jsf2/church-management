import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Layout, Button } from '../../components';

const AgendaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const AgendaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Agenda: React.FC = () => {
  return (
    <Layout>
      <AgendaContainer>
        <AgendaHeader>
          <h1>Agenda</h1>
          <Link to="/agenda/novo">
            <Button>
              <span>Novo Evento</span>
            </Button>
          </Link>
        </AgendaHeader>
        
        <p>Página em construção. Aqui será implementada a agenda de eventos.</p>
      </AgendaContainer>
    </Layout>
  );
};

export default Agenda;
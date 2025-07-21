import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Layout, Button } from '../../components';

const EventoFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const EventoFormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EventoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const isEditing = !!id;
  
  return (
    <Layout>
      <EventoFormContainer>
        <EventoFormHeader>
          <h1>{isEditing ? 'Editar Evento' : 'Novo Evento'}</h1>
          <Button variant="outline" onClick={() => navigate('/agenda')}>
            Voltar
          </Button>
        </EventoFormHeader>
        
        <p>Formulário em construção. Aqui será implementado o formulário de cadastro/edição de eventos.</p>
      </EventoFormContainer>
    </Layout>
  );
};

export default EventoForm;
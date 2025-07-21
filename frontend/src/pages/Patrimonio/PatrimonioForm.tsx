import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Layout, Button } from '../../components';

const PatrimonioFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const PatrimonioFormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PatrimonioForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const isEditing = !!id;
  
  return (
    <Layout>
      <PatrimonioFormContainer>
        <PatrimonioFormHeader>
          <h1>{isEditing ? 'Editar Item' : 'Novo Item'}</h1>
          <Button variant="outline" onClick={() => navigate('/patrimonio')}>
            Voltar
          </Button>
        </PatrimonioFormHeader>
        
        <p>Formulário em construção. Aqui será implementado o formulário de cadastro/edição de itens do patrimônio.</p>
      </PatrimonioFormContainer>
    </Layout>
  );
};

export default PatrimonioForm;
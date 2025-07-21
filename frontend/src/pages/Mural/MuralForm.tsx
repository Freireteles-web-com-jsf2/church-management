import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Layout, Button } from '../../components';

const MuralFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const MuralFormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MuralForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const isEditing = !!id;
  
  return (
    <Layout>
      <MuralFormContainer>
        <MuralFormHeader>
          <h1>{isEditing ? 'Editar Publicação' : 'Nova Publicação'}</h1>
          <Button variant="outline" onClick={() => navigate('/mural')}>
            Voltar
          </Button>
        </MuralFormHeader>
        
        <p>Formulário em construção. Aqui será implementado o formulário de cadastro/edição de publicações no mural.</p>
      </MuralFormContainer>
    </Layout>
  );
};

export default MuralForm;
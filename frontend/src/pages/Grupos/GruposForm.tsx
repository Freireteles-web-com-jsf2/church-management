import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Layout, Button } from '../../components';

const GruposFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const GruposFormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GruposForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const isEditing = !!id;
  
  return (
    <Layout>
      <GruposFormContainer>
        <GruposFormHeader>
          <h1>{isEditing ? 'Editar Grupo' : 'Novo Grupo'}</h1>
          <Button variant="outline" onClick={() => navigate('/grupos')}>
            Voltar
          </Button>
        </GruposFormHeader>
        
        <p>Formulário em construção. Aqui será implementado o formulário de cadastro/edição de grupos/células.</p>
      </GruposFormContainer>
    </Layout>
  );
};

export default GruposForm;
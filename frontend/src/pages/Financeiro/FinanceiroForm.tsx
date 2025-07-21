import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Layout, Button } from '../../components';

const FinanceiroFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const FinanceiroFormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FinanceiroForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const isEditing = !!id;
  
  return (
    <Layout>
      <FinanceiroFormContainer>
        <FinanceiroFormHeader>
          <h1>{isEditing ? 'Editar Transação' : 'Nova Transação'}</h1>
          <Button variant="outline" onClick={() => navigate('/financeiro')}>
            Voltar
          </Button>
        </FinanceiroFormHeader>
        
        <p>Formulário em construção. Aqui será implementado o formulário de cadastro/edição de transações financeiras.</p>
      </FinanceiroFormContainer>
    </Layout>
  );
};

export default FinanceiroForm;
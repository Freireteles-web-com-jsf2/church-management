import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Layout, Button } from '../../components';

const PatrimonioContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const PatrimonioHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Patrimonio: React.FC = () => {
  return (
    <Layout>
      <PatrimonioContainer>
        <PatrimonioHeader>
          <h1>Patrimônio</h1>
          <Link to="/patrimonio/novo">
            <Button>
              <span>Adicionar Item</span>
            </Button>
          </Link>
        </PatrimonioHeader>
        
        <p>Página em construção. Aqui será implementada a gestão de patrimônio.</p>
      </PatrimonioContainer>
    </Layout>
  );
};

export default Patrimonio;
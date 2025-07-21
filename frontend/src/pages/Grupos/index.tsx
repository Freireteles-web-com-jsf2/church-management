import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Layout, Button } from '../../components';

const GruposContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const GruposHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Grupos: React.FC = () => {
  return (
    <Layout>
      <GruposContainer>
        <GruposHeader>
          <h1>Grupos/Células</h1>
          <Link to="/grupos/novo">
            <Button>
              <span>Adicionar Grupo</span>
            </Button>
          </Link>
        </GruposHeader>
        
        <p>Página em construção. Aqui será implementada a listagem de grupos/células.</p>
      </GruposContainer>
    </Layout>
  );
};

export default Grupos;
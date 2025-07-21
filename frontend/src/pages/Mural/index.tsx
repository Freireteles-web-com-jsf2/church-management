import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Layout, Button } from '../../components';

const MuralContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const MuralHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Mural: React.FC = () => {
  return (
    <Layout>
      <MuralContainer>
        <MuralHeader>
          <h1>Mural</h1>
          <Link to="/mural/novo">
            <Button>
              <span>Nova Publicação</span>
            </Button>
          </Link>
        </MuralHeader>
        
        <p>Página em construção. Aqui será implementado o mural de avisos e comunicados.</p>
      </MuralContainer>
    </Layout>
  );
};

export default Mural;
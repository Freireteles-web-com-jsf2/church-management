import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Layout, Button } from '../../components';

const FinanceiroContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const FinanceiroHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Financeiro: React.FC = () => {
  return (
    <Layout>
      <FinanceiroContainer>
        <FinanceiroHeader>
          <h1>Financeiro</h1>
          <Link to="/financeiro/novo">
            <Button>
              <span>Nova Transação</span>
            </Button>
          </Link>
        </FinanceiroHeader>
        
        <p>Página em construção. Aqui será implementada a gestão financeira.</p>
      </FinanceiroContainer>
    </Layout>
  );
};

export default Financeiro;
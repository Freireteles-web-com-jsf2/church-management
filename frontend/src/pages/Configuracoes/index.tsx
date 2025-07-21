import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { Layout } from '../../components';

const ConfiguracoesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const ConfiguracoesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Configuracoes: React.FC = () => {
  return (
    <Layout>
      <ConfiguracoesContainer>
        <ConfiguracoesHeader>
          <h1>Configurações</h1>
        </ConfiguracoesHeader>
        
        <p>Página em construção. Aqui serão implementadas as configurações do sistema.</p>
      </ConfiguracoesContainer>
    </Layout>
  );
};

export default Configuracoes;
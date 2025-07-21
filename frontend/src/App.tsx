import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import LocalRoutes from './routes/localRoutes';
import { useToast } from './context/ToastContext';

const App: React.FC = () => {
  const { showToast } = useToast();
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <LocalRoutes />
      <button onClick={() => showToast('Login realizado com sucesso!', 'success')}>Exemplo Sucesso</button>
      <button onClick={() => showToast('Erro ao autenticar usuário.', 'error')}>Exemplo Erro</button>
    </ThemeProvider>
  );
};

export default App;
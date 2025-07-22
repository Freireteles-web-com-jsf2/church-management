import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { useCachedDashboardData } from '../useCachedDashboardData';

jest.mock('axios', () => ({
  get: jest.fn((url) => {
    if (url.includes('/api/dashboard/all')) {
      return Promise.resolve({ data: { stats: { pessoasAtivas: 10 } } });
    }
    return Promise.resolve({ data: {} });
  })
}));

function TestComponent() {
  const { data, loading, error } = useCachedDashboardData('month', { ttl: 1000, persistOffline: false });
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  return <div>Ativos: {data?.stats?.pessoasAtivas}</div>;
}

describe('useCachedDashboardData', () => {
  it('deve retornar dados do cache e buscar da API', async () => {
    render(<TestComponent />);
    expect(screen.getByText(/Carregando/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Ativos: 10/)).toBeInTheDocument());
  });
}); 
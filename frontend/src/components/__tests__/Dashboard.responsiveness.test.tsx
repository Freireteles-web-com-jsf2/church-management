import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../../pages/Dashboard';
import { AuthContext } from '../../contexts/AuthContext';

jest.mock('axios', () => ({
  get: jest.fn((url) => {
    if (url.includes('/api/dashboard/all')) {
      return Promise.resolve({ data: {
        stats: { pessoasAtivas: 10, gruposAtivos: 2, receitasMes: 1000, aniversariantesHoje: 1 },
        charts: { financialData: [{ month: 'Jul', receitas: 1000, despesas: 500, saldo: 500 }] },
        upcomingEvents: [{ id: 1, name: 'Evento Teste', date: '2025-07-22' }],
        birthdays: { month: [{ id: 1, name: 'João', date: '22/07' }] },
        recentActivities: [{ id: '1', type: 'evento', action: 'created', title: 'Evento Teste', description: 'Criado', timestamp: '2025-07-22', relatedId: '1' }]
      }});
    }
    return Promise.resolve({ data: {} });
  })
}));

type Role = 'admin' | 'pastor' | 'lider' | 'tesoureiro' | 'voluntario' | 'membro';
function renderWithRole(role: Role) {
  return render(
    <AuthContext.Provider value={{
      user: { name: 'Teste', role, id: '1', email: 'teste@teste.com' },
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
      login: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      register: jest.fn()
    }}>
      <DashboardPage />
    </AuthContext.Provider>
  );
}

describe('DashboardPage responsividade', () => {
  beforeEach(() => {
    // Resetar largura da janela antes de cada teste
    window.innerWidth = 1024;
    window.dispatchEvent(new Event('resize'));
  });

  it('renderiza versão desktop por padrão', async () => {
    renderWithRole('admin');
    expect(await screen.findByText(/Membros ativos/)).toBeInTheDocument();
    // Deve exibir mais de um widget
    expect(screen.getByText(/Grupos ativos/)).toBeInTheDocument();
  });

  it('renderiza versão mobile quando largura <= 768', async () => {
    window.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));
    renderWithRole('admin');
    expect(await screen.findByText(/Membros ativos/)).toBeInTheDocument();
    // Deve exibir apenas widgets essenciais (ex: eventos)
    expect(screen.getByText(/Evento Teste/)).toBeInTheDocument();
  });
}); 
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MembersDistributionChart } from '../MembersDistributionChart';
import type { MemberDistributionData } from '../MembersDistributionChart';

describe('MembersDistributionChart', () => {
  const mockData: MemberDistributionData[] = [
    { name: 'Adultos', value: 10, color: '#000', percentage: 50 },
    { name: 'Jovens', value: 10, color: '#111', percentage: 50 },
  ];

  it('renderiza sem erros e exibe categorias', () => {
    render(<MembersDistributionChart data={mockData} />);
    expect(screen.getByText('Adultos (10 membros, 50%)')).toBeInTheDocument();
    expect(screen.getByText('Jovens (10 membros, 50%)')).toBeInTheDocument();
  });

  it('exibe mensagem de vazio se não houver dados', () => {
    render(<MembersDistributionChart data={[]} />);
    expect(screen.getByText(/Nenhum dado de membros disponível/i)).toBeInTheDocument();
    expect(screen.getByText(/Cadastrar Membro/i)).toBeInTheDocument();
    expect(screen.getByText('👥')).toBeInTheDocument();
  });
}); 
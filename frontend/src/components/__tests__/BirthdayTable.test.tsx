import React from 'react';
import { render, screen } from '@testing-library/react';
import { BirthdayTable } from '../BirthdayTable';

describe('BirthdayTable', () => {
  const mockPeople = [
    { id: '1', name: 'João Silva', date: '15/07/2024', age: 30, contact: 'joao@email.com' },
    { id: '2', name: 'Maria Santos', date: new Date().toLocaleDateString('pt-BR'), age: 25, contact: 'maria@email.com' },
  ];

  it('renderiza tabela com aniversariantes', () => {
    render(<BirthdayTable people={mockPeople} />);
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.getByText('30 anos')).toBeInTheDocument();
    expect(screen.getByText('25 anos')).toBeInTheDocument();
  });

  it('exibe estado vazio quando não há aniversariantes', () => {
    render(<BirthdayTable people={[]} />);
    expect(screen.getByText(/Nenhum aniversariante encontrado/i)).toBeInTheDocument();
    expect(screen.getByText(/Cadastrar Pessoa/i)).toBeInTheDocument();
    expect(screen.getByText('🎂')).toBeInTheDocument();
  });

  it('marca aniversariante de hoje com badge', () => {
    render(<BirthdayTable people={mockPeople} />);
    expect(screen.getByText('Hoje')).toBeInTheDocument();
  });

  it('renderiza cabeçalhos da tabela', () => {
    render(<BirthdayTable people={mockPeople} />);
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('Data')).toBeInTheDocument();
    expect(screen.getByText('Idade')).toBeInTheDocument();
    expect(screen.getByText('Contato')).toBeInTheDocument();
  });
});
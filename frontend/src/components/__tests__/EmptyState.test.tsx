import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  const defaultProps = {
    title: 'Nenhum dado encontrado',
    description: 'Não há dados para exibir no momento.',
  };

  it('renderiza título e descrição', () => {
    render(<EmptyState {...defaultProps} />);
    expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
    expect(screen.getByText('Não há dados para exibir no momento.')).toBeInTheDocument();
  });

  it('renderiza ícone personalizado', () => {
    render(<EmptyState {...defaultProps} icon="🎉" />);
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  it('renderiza ícone padrão quando não especificado', () => {
    render(<EmptyState {...defaultProps} />);
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  it('renderiza botão de ação com callback', () => {
    const mockAction = jest.fn();
    render(
      <EmptyState 
        {...defaultProps} 
        actionText="Criar Novo" 
        onAction={mockAction} 
      />
    );
    
    const button = screen.getByText('Criar Novo');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('renderiza link de ação', () => {
    render(
      <EmptyState 
        {...defaultProps} 
        actionText="Ir para Página" 
        actionLink="/pagina" 
      />
    );
    
    const link = screen.getByText('Ir para Página');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/pagina');
  });

  it('não renderiza ação quando não especificada', () => {
    render(<EmptyState {...defaultProps} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('aplica className personalizada', () => {
    const { container } = render(
      <EmptyState {...defaultProps} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('prioriza link sobre callback quando ambos são fornecidos', () => {
    const mockAction = jest.fn();
    render(
      <EmptyState 
        {...defaultProps} 
        actionText="Ação" 
        onAction={mockAction}
        actionLink="/link"
      />
    );
    
    const element = screen.getByText('Ação');
    expect(element.tagName.toLowerCase()).toBe('a');
    expect(element).toHaveAttribute('href', '/link');
  });
});
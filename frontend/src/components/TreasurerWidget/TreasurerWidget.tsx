import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { useDashboardContext } from '../../pages/Dashboard';

const WidgetContainer = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const WidgetTitle = styled.h3`
  color: ${theme.colors.primaryDark};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const FinancialSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const SummaryItem = styled.div<{ type: 'positive' | 'negative' | 'neutral' }>`
  background: ${({ type }) => {
    switch (type) {
      case 'positive': return 'rgba(46, 204, 113, 0.1)';
      case 'negative': return 'rgba(231, 76, 60, 0.1)';
      default: return 'rgba(52, 152, 219, 0.1)';
    }
  }};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border-left: 4px solid ${({ type }) => {
    switch (type) {
      case 'positive': return theme.colors.success;
      case 'negative': return theme.colors.danger;
      default: return theme.colors.info;
    }
  }};
`;

const ItemLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textLight};
  margin-bottom: ${theme.spacing.xs};
`;

const ItemValue = styled.div<{ type: 'positive' | 'negative' | 'neutral' }>`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${({ type }) => {
    switch (type) {
      case 'positive': return theme.colors.success;
      case 'negative': return theme.colors.danger;
      default: return theme.colors.text;
    }
  }};
`;

const PendingPayments = styled.div`
  margin-top: ${theme.spacing.lg};
`;

const PaymentsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const PaymentItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.grayLight};
  
  &:last-child {
    border-bottom: none;
  }
`;

const PaymentInfo = styled.div`
  flex: 1;
`;

const PaymentTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
`;

const PaymentDetails = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textLight};
`;

const PaymentAmount = styled.div<{ overdue: boolean }>`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${({ overdue }) => overdue ? theme.colors.danger : theme.colors.text};
`;

const ActionButton = styled.button`
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  margin-left: ${theme.spacing.md};
  
  &:hover {
    background: ${theme.colors.primaryDark};
  }
`;

const LinkButton = styled.a`
  display: inline-block;
  background: ${theme.colors.primary};
  color: white;
  text-decoration: none;
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  margin-top: ${theme.spacing.md};
  
  &:hover {
    background: ${theme.colors.primaryDark};
  }
`;

export const TreasurerWidget: React.FC = () => {
  const { dashboardData, loading } = useDashboardContext();
  
  // Dados mockados para o widget do tesoureiro
  const financialSummary = {
    receitas: 28500,
    despesas: 15200,
    saldo: 13300,
    pendingPayments: [
      { id: 1, title: 'Aluguel', amount: 3500, dueDate: '2025-07-25', overdue: false },
      { id: 2, title: 'Conta de Luz', amount: 850, dueDate: '2025-07-18', overdue: true },
      { id: 3, title: 'Salário Funcionários', amount: 4200, dueDate: '2025-07-30', overdue: false },
    ]
  };
  
  if (loading) {
    return (
      <WidgetContainer>
        <WidgetTitle>💰 Resumo Financeiro (Carregando...)</WidgetTitle>
      </WidgetContainer>
    );
  }
  
  return (
    <WidgetContainer>
      <WidgetTitle>💰 Resumo Financeiro do Mês</WidgetTitle>
      
      <FinancialSummary>
        <SummaryItem type="positive">
          <ItemLabel>Receitas</ItemLabel>
          <ItemValue type="positive">R$ {financialSummary.receitas.toLocaleString('pt-BR')}</ItemValue>
        </SummaryItem>
        
        <SummaryItem type="negative">
          <ItemLabel>Despesas</ItemLabel>
          <ItemValue type="negative">R$ {financialSummary.despesas.toLocaleString('pt-BR')}</ItemValue>
        </SummaryItem>
        
        <SummaryItem type={financialSummary.saldo >= 0 ? 'positive' : 'negative'}>
          <ItemLabel>Saldo</ItemLabel>
          <ItemValue type={financialSummary.saldo >= 0 ? 'positive' : 'negative'}>
            R$ {financialSummary.saldo.toLocaleString('pt-BR')}
          </ItemValue>
        </SummaryItem>
      </FinancialSummary>
      
      <PendingPayments>
        <h4>Pagamentos Pendentes</h4>
        <PaymentsList>
          {financialSummary.pendingPayments.map(payment => (
            <PaymentItem key={payment.id}>
              <PaymentInfo>
                <PaymentTitle>{payment.title}</PaymentTitle>
                <PaymentDetails>Vencimento: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}</PaymentDetails>
              </PaymentInfo>
              <PaymentAmount overdue={payment.overdue}>
                R$ {payment.amount.toLocaleString('pt-BR')}
              </PaymentAmount>
              <ActionButton onClick={() => window.location.href = `/financeiro/pagamento/${payment.id}`}>
                Pagar
              </ActionButton>
            </PaymentItem>
          ))}
        </PaymentsList>
      </PendingPayments>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: theme.spacing.lg }}>
        <LinkButton href="/financeiro/novo">Novo Lançamento</LinkButton>
        <LinkButton href="/financeiro/relatorios">Ver Relatórios</LinkButton>
      </div>
    </WidgetContainer>
  );
};
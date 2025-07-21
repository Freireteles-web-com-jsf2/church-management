export interface LancamentoFinanceiro {
  id: string;
  tipo: 'Receita' | 'Despesa';
  valor: number;
  data: Date;
  categoria: string;
  pessoaFornecedor: string;
  formaPagamento: string;
  observacoes?: string;
  anexoUrl?: string;
} 
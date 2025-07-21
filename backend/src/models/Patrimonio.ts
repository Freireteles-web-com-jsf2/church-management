export interface Patrimonio {
  id: string;
  nome: string;
  categoria: string;
  localizacao: string;
  valorEstimado: number;
  dataAquisicao: Date;
  situacao: 'Novo' | 'Usado' | 'Danificado';
  anotacoes?: string;
  anexoUrl?: string;
} 
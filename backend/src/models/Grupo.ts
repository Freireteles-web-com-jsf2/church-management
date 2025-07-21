export interface Grupo {
  id: string;
  nome: string;
  categoria: string;
  endereco: string;
  lideres: string[];
  dataHoraReuniao: Date;
  status: 'ativo' | 'inativo';
  observacoes?: string;
} 
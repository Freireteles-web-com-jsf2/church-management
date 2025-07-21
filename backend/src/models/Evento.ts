export interface Evento {
  id: string;
  titulo: string;
  dataHora: Date;
  recorrencia: 'Nenhuma' | 'Semanal' | 'Mensal' | 'Anual';
  notificacoesAtivadas: boolean;
  descricao?: string;
} 
export interface MensagemMural {
  id: string;
  titulo: string;
  mensagem: string;
  visibilidade: 'todos' | 'grupos';
  gruposEspecificos?: string[];
} 
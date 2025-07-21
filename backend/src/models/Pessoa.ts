export interface Pessoa {
  id: string;
  nome: string;
  dataNascimento: Date;
  genero: 'Masculino' | 'Feminino' | 'Outro';
  estadoCivil: string;
  email: string;
  telefone: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  funcao: string;
  grupoId?: string;
  fotoUrl?: string;
  dataIngresso: Date;
  batizado: boolean;
  camposPersonalizados?: Record<string, any>;
} 
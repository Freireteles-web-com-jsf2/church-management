// Traduções de mensagens de erro para português do Brasil

export const errorTranslations: Record<string, string> = {
  // Erros do Supabase
  'infinite recursion detected in policy for relation "users"': 'Erro de configuração detectado nas políticas de segurança. Entre em contato com o administrador do sistema.',
  'infinite recursion detected in policy': 'Erro de configuração detectado nas políticas de segurança. Entre em contato com o administrador do sistema.',
  'relation "public.users" does not exist': 'Tabela de usuários não encontrada. Verifique a configuração do banco de dados.',
  'permission denied for relation users': 'Permissão negada para acessar dados de usuários.',
  'permission denied': 'Permissão negada. Você não tem autorização para esta ação.',
  'duplicate key value violates unique constraint': 'Este registro já existe no sistema.',
  'invalid input syntax': 'Formato de dados inválido.',
  'connection refused': 'Não foi possível conectar ao servidor.',
  'network error': 'Erro de conexão de rede.',
  'JWT expired': 'Sua sessão expirou. Faça login novamente.',
  'Invalid JWT': 'Sessão inválida. Faça login novamente.',
  'Row Level Security': 'Erro de segurança de dados. Entre em contato com o administrador.',
  'could not find the function': 'Função não encontrada no banco de dados. Verifique a configuração.',
  'syntax error': 'Erro de sintaxe nos dados enviados.',
  
  // Erros de autenticação
  'Invalid login credentials': 'Credenciais de login inválidas. Verifique seu email e senha.',
  'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
  'User not found': 'Usuário não encontrado.',
  'Invalid email': 'Email inválido.',
  'Password too short': 'Senha muito curta. Use pelo menos 6 caracteres.',
  'Passwords do not match': 'As senhas não coincidem.',
  'Email already registered': 'Este email já está cadastrado no sistema.',
  'Weak password': 'Senha muito fraca. Use uma combinação de letras, números e símbolos.',
  'Session expired': 'Sessão expirada. Faça login novamente.',
  'Access denied': 'Acesso negado.',
  'Unauthorized': 'Não autorizado.',
  
  // Erros de validação
  'Required field': 'Campo obrigatório.',
  'Invalid format': 'Formato inválido.',
  'Field too long': 'Campo muito longo.',
  'Field too short': 'Campo muito curto.',
  'Invalid phone number': 'Número de telefone inválido.',
  'Invalid date': 'Data inválida.',
  
  // Erros de rede
  'Network request failed': 'Falha na requisição de rede. Verifique sua conexão.',
  'Server error': 'Erro interno do servidor. Tente novamente mais tarde.',
  'Service unavailable': 'Serviço temporariamente indisponível.',
  'Request timeout': 'Tempo limite da requisição excedido.',
  
  // Erros gerais
  'Something went wrong': 'Algo deu errado. Tente novamente.',
  'Unexpected error': 'Erro inesperado. Entre em contato com o suporte.',
  'Operation failed': 'Operação falhou. Tente novamente.',
  'Data not found': 'Dados não encontrados.',
  'Invalid request': 'Requisição inválida.',
  
  // Mensagens de sucesso
  'Registration successful': 'Cadastro realizado com sucesso!',
  'Login successful': 'Login realizado com sucesso!',
  'Password reset sent': 'Instruções para redefinir senha enviadas por email.',
  'Password updated': 'Senha atualizada com sucesso!',
  'Profile updated': 'Perfil atualizado com sucesso!',
  'Data saved': 'Dados salvos com sucesso!',
  
  // Mensagens específicas do sistema
  'User registration pending approval': 'Cadastro realizado com sucesso! Aguarde a aprovação do administrador para acessar o sistema.',
  'Account approved': 'Sua conta foi aprovada! Você já pode fazer login.',
  'Account suspended': 'Sua conta foi suspensa. Entre em contato com o administrador.',
  'Role updated': 'Função do usuário atualizada com sucesso.',
  'Permission denied for this action': 'Você não tem permissão para realizar esta ação.',
};

// Função para traduzir mensagens de erro
export const translateError = (error: string | Error): string => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Procurar por traduções exatas
  if (errorTranslations[errorMessage]) {
    return errorTranslations[errorMessage];
  }
  
  // Procurar por traduções parciais (contém a palavra-chave)
  for (const [key, translation] of Object.entries(errorTranslations)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return translation;
    }
  }
  
  // Se não encontrar tradução, retornar mensagem genérica em português
  return 'Ocorreu um erro. Tente novamente ou entre em contato com o suporte.';
};

// Função para traduzir mensagens de sucesso
export const translateSuccess = (message: string): string => {
  return errorTranslations[message] || message;
};
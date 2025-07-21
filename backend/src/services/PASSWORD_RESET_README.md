# Sistema de Recuperação de Senha

## Visão Geral

O Sistema de Recuperação de Senha permite que os usuários redefinam suas senhas quando as esquecem. O sistema é projetado para ser seguro, fácil de usar e resistente a ataques.

## Fluxo de Recuperação de Senha

1. O usuário solicita a recuperação de senha fornecendo seu email
2. O sistema verifica se o email existe no banco de dados
3. Se o email existir, o sistema gera um token seguro de recuperação
4. O sistema envia um email com um link contendo o token
5. O usuário clica no link e é direcionado para a página de redefinição de senha
6. O sistema valida o token
7. O usuário define uma nova senha
8. O sistema valida a força da senha
9. O sistema atualiza a senha do usuário
10. O sistema envia um email de confirmação

## Componentes Principais

### 1. PasswordResetService

Responsável por gerenciar tokens de recuperação de senha:

- **createResetToken**: Cria um token de recuperação para um email
- **validateResetToken**: Verifica se um token é válido
- **resetPassword**: Redefine a senha usando um token válido
- **cleanupExpiredTokens**: Remove tokens expirados ou usados

### 2. EmailService

Responsável por enviar emails relacionados à recuperação de senha:

- **sendPasswordResetEmail**: Envia email com link de recuperação
- **sendPasswordChangedEmail**: Envia confirmação de alteração de senha

### 3. Endpoints da API

- **POST /api/auth/forgot-password**: Inicia o processo de recuperação
- **POST /api/auth/validate-reset-token**: Valida um token de recuperação
- **POST /api/auth/reset-password**: Redefine a senha com um token válido

## Segurança

### Proteção contra Enumeração de Usuários

O endpoint `/forgot-password` sempre retorna uma resposta de sucesso, mesmo se o email não existir no sistema. Isso evita que atacantes descubram quais emails estão cadastrados.

### Tokens Seguros

- Tokens são gerados usando métodos criptograficamente seguros
- Tokens têm expiração de 24 horas
- Tokens são invalidados após o uso
- Tokens anteriores são invalidados quando um novo é gerado

### Validação de Senha

- Senhas devem ter pelo menos 8 caracteres
- Senhas devem conter letras, números e caracteres especiais
- Validação é feita tanto no cliente quanto no servidor

## Exemplo de Uso

### Solicitar Recuperação de Senha

```javascript
// Frontend
async function requestPasswordReset(email) {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  return data;
}
```

### Validar Token

```javascript
// Frontend
async function validateResetToken(token) {
  const response = await fetch('/api/auth/validate-reset-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  
  const data = await response.json();
  return data;
}
```

### Redefinir Senha

```javascript
// Frontend
async function resetPassword(token, password) {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password })
  });
  
  const data = await response.json();
  return data;
}
```

## Testes

O sistema inclui testes automatizados para verificar:

- Criação e validação de tokens
- Rejeição de tokens inválidos ou expirados
- Validação de força de senha
- Envio de emails
- Limpeza de tokens expirados

Execute os testes com:

```bash
npm run test:password-reset
```

## Considerações para Produção

1. **Armazenamento de Tokens**: Em produção, os tokens devem ser armazenados em um banco de dados em vez de na memória
2. **Serviço de Email Real**: Integre com um serviço de email como SendGrid, Mailgun, etc.
3. **Monitoramento**: Adicione logging e alertas para tentativas suspeitas de recuperação de senha
4. **Rate Limiting**: Implemente limitação de taxa para evitar abuso do sistema
5. **HTTPS**: Sempre use HTTPS para proteger os dados em trânsito
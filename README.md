# Sistema de Gestão de Igrejas

Este projeto é um sistema de gestão para igrejas, com funcionalidades para gerenciar membros, grupos, finanças, patrimônio, agenda e mural.

## Configuração do Banco de Dados

Para configurar o banco de dados no Supabase, siga os passos abaixo:

1. Acesse o console do Supabase (https://app.supabase.com/)
2. Selecione seu projeto
3. Vá para a seção "SQL Editor"
4. Crie uma nova consulta
5. Cole o conteúdo do arquivo `supabase_auth_schema.sql`
6. Execute a consulta

O script SQL criará as seguintes tabelas:

- `roles`: Armazena os diferentes níveis de usuário
- `permissions`: Armazena as permissões disponíveis
- `role_permissions`: Relaciona roles com permissions
- `users`: Estende a tabela auth.users do Supabase

Além disso, o script também:

- Insere os roles padrão (admin, pastor, lider, tesoureiro, voluntario, membro)
- Insere as permissões básicas para cada recurso do sistema
- Atribui permissões aos roles
- Cria funções e políticas de segurança

## Estrutura de Autenticação e Autorização

O sistema utiliza um modelo de autenticação e autorização baseado em roles e permissions:

1. Cada usuário tem um role (papel/nível) atribuído
2. Cada role tem um conjunto de permissions (permissões)
3. Cada permission define o que o usuário pode fazer em um determinado recurso

### Roles (Papéis/Níveis)

- **admin**: Administrador com acesso completo ao sistema
- **pastor**: Pastor com acesso a quase todas as funcionalidades
- **lider**: Líder com acesso a grupos e pessoas
- **tesoureiro**: Tesoureiro com acesso às finanças
- **voluntario**: Voluntário com acesso limitado
- **membro**: Membro com acesso básico

### Permissions (Permissões)

As permissões seguem o formato `{action}_{resource}`, onde:

- **action**: view, create, edit, delete
- **resource**: pessoas, grupos, financas, patrimonio, agenda, mural, config

Exemplos:
- `view_pessoas`: Permissão para visualizar a lista de pessoas
- `create_grupos`: Permissão para criar novos grupos
- `edit_financas`: Permissão para editar transações financeiras

## Desenvolvimento

Para desenvolver o projeto, você precisará:

1. Node.js e npm instalados
2. Conta no Supabase
3. Configurar as variáveis de ambiente com as credenciais do Supabase

## Executando o Projeto

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente
4. Execute o projeto: `npm start`
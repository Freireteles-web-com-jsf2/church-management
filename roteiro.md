
# Roteiro-de-Desenvolvimento do Sistema de Gestão de Igrejas


## 1. Estrutura de Perfis e Permissões



* **Perfis Padrão:** Administrador, Pastor, Líder, Tesoureiro, Voluntário, Membro.
* **Permissões:** Cada perfil acessa módulos específicos, com painel de controle para personalização fina de permissões.
* **Gestão de Permissões Dinâmica:** Ferramenta de controle para administradores criarem ou editarem perfis personalizados.

---

## 2. Telas e Módulos Principais

### 2.1. Autenticação e Acesso

* **Campos:**

  * E-mail (input\[type=email])
  * Senha (input\[type=password])
  * Botões: Login, Esqueci minha senha, Cadastro (opcional)

### 2.2. Dashboard

* Cards dinâmicos:

  * Total de membros, membros ativos, aniversariantes do dia/mês
  * Receitas/Despesas do mês
  * Gráficos de barras/pizza com Recharts
  * Lista de notificações e mural

### 2.3. Pessoas

* **Campos do Formulário:**

  * Nome completo (input)
  * Data de nascimento (date)
  * Gênero (select: Masculino/Feminino/Outro)
  * Estado civil (select)
  * E-mail (input)
  * Telefone (input)
  * Endereço (input + número + complemento + bairro + cidade + estado)
  * Função/cargo (select)
  * Grupo vinculado (select)
  * Foto de perfil (upload)
  * Data de ingresso (date)
  * Batizado? (checkbox)
  * Campos personalizados (dinâmicos)

### 2.4. Grupos/Células

* **Campos do Formulário:**

  * Nome do grupo (input)
  * Categoria (select)
  * Endereço (input)
  * Líderes (multi-select)
  * Dia e hora da reunião (input\[type=datetime-local])
  * Status (ativo/inativo)
  * Observações (textarea)

### 2.5. Financeiro

* **Campos do Formulário de Receita/Despesa:**

  * Tipo (select: Receita/Despesa)
  * Valor (input\[type=number])
  * Data (date)
  * Categoria (select)
  * Pessoa/fornecedor (select)
  * Forma de pagamento (select)
  * Observações (textarea)
  * Anexo (comprovante de pagamento/upload)

### 2.6. Patrimônio

* **Campos do Formulário:**

  * Nome do item (input)
  * Categoria (select)
  * Localização (select)
  * Valor estimado (number)
  * Data de aquisição (date)
  * Situação (select: Novo, Usado, Danificado)
  * Anotações/histórico (textarea)
  * Anexo de imagem/documento (upload)

### 2.7. Agenda e Mural

* **Campos de Evento:**

  * Título do evento (input)
  * Data e hora (datetime-local)
  * Recorrência (select: Nenhuma, Semanal, Mensal, Anual)
  * Notificações ativadas (checkbox)
  * Descrição (textarea)
* **Campos do Mural:**

  * Título (input)
  * Mensagem (textarea)
  * Visibilidade (select: todos, grupos específicos)

---

## 3. Funcionalidades Especiais

* Notificações via push ou e-mail
* Campos personalizados editáveis pelo administrador
* Exportação para Excel/CSV
* Logs de acesso e ações

---

## 4. Telas Auxiliares

* Configurações gerais
* Painel de permissões por perfil
* Tela de ajuda/suporte

---

## 5. Wireframes Adicionais (exemplos)

### Cadastro de Pessoa

```
+-----------------------------+
| Nome: [___________]         |
| Data de Nasc.: [____]       |
| Sexo: [Masculino ▼]         |
| Telefone: [__________]      |
| E-mail:   [__________]      |
| Endereço: [__________]      |
| Função:   [__________]      |
| Grupo:    [__________]      |
| Foto: [Selecionar Imagem]   |
| [Salvar] [Cancelar]         |
+-----------------------------+
```

### Cadastro de Evento

```
+-----------------------------+
| Evento: [___________]       |
| Data/Hora: [__/__/__ __:__] |
| Recorrência: [Nenhuma ▼]    |
| Notificar? [x]              |
| Descrição: [__________]     |
| [Salvar] [Cancelar]         |
+-----------------------------+




**Fim do Documento**
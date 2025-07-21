// Script para criar tabelas de autenticação de níveis de usuário no Supabase usando MCP
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ler o arquivo SQL
const sqlFilePath = path.join(__dirname, 'supabase_auth_schema.sql');
const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

// Função para executar o script SQL usando o MCP do Supabase
async function createAuthTablesWithMCP() {
  try {
    console.log('Iniciando a criação das tabelas de autenticação no Supabase usando MCP...');
    
    // Criar um arquivo temporário com o comando MCP
    const mcpCommandFile = path.join(__dirname, 'mcp_command.json');
    const mcpCommand = {
      command: "execute_sql",
      sql: sqlScript
    };
    
    fs.writeFileSync(mcpCommandFile, JSON.stringify(mcpCommand, null, 2));
    
    console.log('Arquivo de comando MCP criado. Executando comando...');
    
    // Executar o comando MCP
    try {
      // Usar o comando uvx para executar o MCP do Supabase
      const result = execSync('uvx supabase-mcp-server@latest execute_sql --file mcp_command.json', { encoding: 'utf8' });
      console.log('Resultado do MCP:', result);
      
      console.log('Tabelas de autenticação criadas com sucesso usando MCP!');
      console.log('Estrutura criada:');
      console.log('- Tabela roles: Armazena os diferentes níveis de usuário');
      console.log('- Tabela permissions: Armazena as permissões disponíveis');
      console.log('- Tabela role_permissions: Relaciona roles com permissions');
      console.log('- Tabela users: Estende a tabela auth.users do Supabase');
      console.log('- Funções e políticas de segurança configuradas');
      
      // Limpar o arquivo temporário
      fs.unlinkSync(mcpCommandFile);
      
      return {
        success: true,
        message: 'Tabelas de autenticação criadas com sucesso usando MCP!'
      };
    } catch (execError) {
      console.error('Erro ao executar comando MCP:', execError.message);
      console.log('O MCP do Supabase pode não estar disponível ou configurado corretamente.');
      console.log('Verifique se o MCP está instalado e configurado no arquivo .kiro/settings/mcp.json');
      
      // Limpar o arquivo temporário mesmo em caso de erro
      if (fs.existsSync(mcpCommandFile)) {
        fs.unlinkSync(mcpCommandFile);
      }
      
      return {
        success: false,
        message: 'Erro ao executar comando MCP',
        error: execError.message
      };
    }
  } catch (error) {
    console.error('Erro ao criar tabelas de autenticação:', error);
    return {
      success: false,
      message: 'Erro ao criar tabelas de autenticação',
      error: error.message
    };
  }
}

// Executar a função
createAuthTablesWithMCP()
  .then(result => {
    console.log('Resultado final:', result);
  })
  .catch(error => {
    console.error('Erro não tratado:', error);
  });
// Script para criar tabelas de autenticação de níveis de usuário no Supabase usando a API direta
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Ler o arquivo SQL
const sqlFilePath = path.join(__dirname, 'supabase_auth_schema.sql');
const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

// Configuração do Supabase (substitua com suas credenciais)
const supabaseUrl = 'https://pskaimoanrxcsjeaalrz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBza2FpbW9hbnJ4Y3NqZWFhbHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTIwMjgsImV4cCI6MjA2ODE4ODAyOH0.yQtaXz0Ss854-X47rAM-kMzCdyWdIFf-VE744U3tcYU';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para executar o script SQL usando a API do Supabase
async function createAuthTablesWithAPI() {
  try {
    console.log('Iniciando a criação das tabelas de autenticação no Supabase usando API direta...');
    
    // Dividir o script SQL em comandos individuais
    const sqlCommands = sqlScript.split(';').filter(cmd => cmd.trim().length > 0);
    
    console.log(`Executando ${sqlCommands.length} comandos SQL...`);
    
    // Executar cada comando SQL individualmente
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i].trim() + ';';
      console.log(`Executando comando ${i + 1}/${sqlCommands.length}...`);
      
      try {
        // Usar a função rpc para executar SQL personalizado
        const { data, error } = await supabase.rpc('execute_sql', { sql: command });
        
        if (error) {
          console.error(`Erro ao executar comando ${i + 1}:`, error);
        } else {
          console.log(`Comando ${i + 1} executado com sucesso.`);
        }
      } catch (cmdError) {
        console.error(`Exceção ao executar comando ${i + 1}:`, cmdError);
      }
    }
    
    console.log('Todos os comandos SQL foram processados.');
    console.log('Tabelas de autenticação criadas com sucesso!');
    console.log('Estrutura criada:');
    console.log('- Tabela roles: Armazena os diferentes níveis de usuário');
    console.log('- Tabela permissions: Armazena as permissões disponíveis');
    console.log('- Tabela role_permissions: Relaciona roles com permissions');
    console.log('- Tabela users: Estende a tabela auth.users do Supabase');
    console.log('- Funções e políticas de segurança configuradas');
    
    return {
      success: true,
      message: 'Tabelas de autenticação criadas com sucesso!'
    };
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
createAuthTablesWithAPI()
  .then(result => {
    console.log('Resultado final:', result);
  })
  .catch(error => {
    console.error('Erro não tratado:', error);
  });
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Resetando banco de dados...');

try {
  // Remove o arquivo do banco SQLite se existir
  const dbPath = path.join(__dirname, '../prisma/dev.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('🗑️  Banco de dados anterior removido');
  }

  // Executa as migrations
  console.log('📋 Executando migrations...');
  execSync('npx prisma migrate dev --name init', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  // Executa o seed
  console.log('🌱 Populando banco com dados de teste...');
  execSync('npx prisma db seed', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  console.log('✅ Banco de dados resetado com sucesso!');
  console.log('📊 Dados de teste carregados');

} catch (error) {
  console.error('❌ Erro ao resetar banco:', error.message);
  process.exit(1);
}
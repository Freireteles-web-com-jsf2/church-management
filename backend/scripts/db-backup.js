const fs = require('fs');
const path = require('path');

const backupDir = path.join(__dirname, '../backups');
const dbPath = path.join(__dirname, '../prisma/dev.db');

// Criar diretório de backup se não existir
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Gerar nome do backup com timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `dev-backup-${timestamp}.db`);

try {
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`✅ Backup criado: ${backupPath}`);
  } else {
    console.log('⚠️  Banco de dados não encontrado para backup');
  }
} catch (error) {
  console.error('❌ Erro ao criar backup:', error.message);
  process.exit(1);
}
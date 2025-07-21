const fs = require('fs');
const path = require('path');

const backupDir = path.join(__dirname, '../backups');
const dbPath = path.join(__dirname, '../prisma/dev.db');

// Listar backups disponíveis
const backups = fs.readdirSync(backupDir)
  .filter(file => file.endsWith('.db'))
  .sort()
  .reverse();

if (backups.length === 0) {
  console.log('❌ Nenhum backup encontrado');
  process.exit(1);
}

console.log('📋 Backups disponíveis:');
backups.forEach((backup, index) => {
  console.log(`${index + 1}. ${backup}`);
});

// Para este script, vamos restaurar o backup mais recente
const latestBackup = backups[0];
const backupPath = path.join(backupDir, latestBackup);

try {
  fs.copyFileSync(backupPath, dbPath);
  console.log(`✅ Banco restaurado do backup: ${latestBackup}`);
} catch (error) {
  console.error('❌ Erro ao restaurar backup:', error.message);
  process.exit(1);
}
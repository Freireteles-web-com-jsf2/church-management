import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import securityRoutes from './routes/security';
import auditRoutes from './routes/audit';
import dashboardRoutes from './routes/dashboard';
import { securityHeaders } from './middleware/auth';
import { AuthErrorCodes, getAuthError } from './utils/authErrors';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// Security middlewares
app.use(securityHeaders);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Middleware de log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Security monitoring routes
app.use('/api/security', securityRoutes);

// Security audit routes
app.use('/api/audit', auditRoutes);

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rotas de Pessoas
app.get('/api/pessoas', async (req, res) => {
  try {
    const pessoas = await prisma.pessoa.findMany({
      include: {
        grupo: true
      },
      orderBy: {
        nome: 'asc'
      }
    });
    res.json(pessoas);
  } catch (error) {
    console.error('Erro ao buscar pessoas:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

app.get('/api/pessoas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pessoa = await prisma.pessoa.findUnique({
      where: { id },
      include: {
        grupo: true
      }
    });
    
    if (!pessoa) {
      return res.status(404).json(getAuthError(AuthErrorCodes.USER_NOT_FOUND));
    }
    
    res.json(pessoa);
  } catch (error) {
    console.error('Erro ao buscar pessoa:', error);
    res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
  }
});

app.post('/api/pessoas', async (req, res) => {
  try {
    const pessoa = await prisma.pessoa.create({
      data: req.body,
      include: {
        grupo: true
      }
    });
    res.status(201).json(pessoa);
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/pessoas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pessoa = await prisma.pessoa.update({
      where: { id },
      data: req.body,
      include: {
        grupo: true
      }
    });
    res.json(pessoa);
  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/pessoas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.pessoa.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de Grupos
app.get('/api/grupos', async (req, res) => {
  try {
    const grupos = await prisma.grupo.findMany({
      include: {
        pessoas: true
      },
      orderBy: {
        nome: 'asc'
      }
    });
    
    // Converter lideres de JSON string para array
    const gruposFormatados = grupos.map(grupo => ({
      ...grupo,
      lideres: JSON.parse(grupo.lideres)
    }));
    
    res.json(gruposFormatados);
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de Financeiro
app.get('/api/financeiro', async (req, res) => {
  try {
    const lancamentos = await prisma.lancamentoFinanceiro.findMany({
      orderBy: {
        data: 'desc'
      }
    });
    res.json(lancamentos);
  } catch (error) {
    console.error('Erro ao buscar lançamentos financeiros:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de Patrimônio
app.get('/api/patrimonio', async (req, res) => {
  try {
    const patrimonio = await prisma.patrimonio.findMany({
      orderBy: {
        nome: 'asc'
      }
    });
    res.json(patrimonio);
  } catch (error) {
    console.error('Erro ao buscar patrimônio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de Eventos
app.get('/api/eventos', async (req, res) => {
  try {
    const eventos = await prisma.evento.findMany({
      orderBy: {
        dataHora: 'asc'
      }
    });
    res.json(eventos);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas do Mural
app.get('/api/mural', async (req, res) => {
  try {
    const mensagens = await prisma.mensagemMural.findMany({
      orderBy: {
        titulo: 'asc'
      }
    });
    
    // Converter gruposEspecificos de JSON string para array
    const mensagensFormatadas = mensagens.map(mensagem => ({
      ...mensagem,
      gruposEspecificos: JSON.parse(mensagem.gruposEspecificos)
    }));
    
    res.json(mensagensFormatadas);
  } catch (error) {
    console.error('Erro ao buscar mensagens do mural:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


// Middleware de tratamento de erros
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', error);
  // Se o erro já tem código de autenticação, retorna formatado
  if (error && typeof error.code === 'string' && AuthErrorCodes[error.code as keyof typeof AuthErrorCodes]) {
    return res.status(error.status || 400).json(getAuthError(error.code, error.details));
  }
  // Se for erro de validação
  if (error && error.name === 'ValidationError') {
    return res.status(400).json(getAuthError(AuthErrorCodes.VALIDATION_ERROR, error.details));
  }
  // Erro genérico
  res.status(500).json(getAuthError(AuthErrorCodes.INTERNAL_ERROR));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const security_1 = __importDefault(require("./routes/security"));
const audit_1 = __importDefault(require("./routes/audit"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const auth_2 = require("./middleware/auth");
const authErrors_1 = require("./utils/authErrors");
// Carregar variáveis de ambiente
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 4000;
// Security middlewares
app.use(auth_2.securityHeaders);
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);
// Middleware de log
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Authentication routes
app.use('/api/auth', auth_1.default);
// Security monitoring routes
app.use('/api/security', security_1.default);
// Security audit routes
app.use('/api/audit', audit_1.default);
// Dashboard routes
app.use('/api/dashboard', dashboard_1.default);
// Rota de teste
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Backend funcionando!',
        timestamp: new Date().toISOString()
    });
});
// Rotas de Pessoas
app.get('/api/pessoas', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pessoas = yield prisma.pessoa.findMany({
            include: {
                grupo: true
            },
            orderBy: {
                nome: 'asc'
            }
        });
        res.json(pessoas);
    }
    catch (error) {
        console.error('Erro ao buscar pessoas:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
app.get('/api/pessoas/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const pessoa = yield prisma.pessoa.findUnique({
            where: { id },
            include: {
                grupo: true
            }
        });
        if (!pessoa) {
            return res.status(404).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.USER_NOT_FOUND));
        }
        res.json(pessoa);
    }
    catch (error) {
        console.error('Erro ao buscar pessoa:', error);
        res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
    }
}));
app.post('/api/pessoas', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pessoa = yield prisma.pessoa.create({
            data: req.body,
            include: {
                grupo: true
            }
        });
        res.status(201).json(pessoa);
    }
    catch (error) {
        console.error('Erro ao criar pessoa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
app.put('/api/pessoas/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const pessoa = yield prisma.pessoa.update({
            where: { id },
            data: req.body,
            include: {
                grupo: true
            }
        });
        res.json(pessoa);
    }
    catch (error) {
        console.error('Erro ao atualizar pessoa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
app.delete('/api/pessoas/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.pessoa.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Erro ao excluir pessoa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Rotas de Grupos
app.get('/api/grupos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const grupos = yield prisma.grupo.findMany({
            include: {
                pessoas: true
            },
            orderBy: {
                nome: 'asc'
            }
        });
        // Converter lideres de JSON string para array
        const gruposFormatados = grupos.map(grupo => (Object.assign(Object.assign({}, grupo), { lideres: JSON.parse(grupo.lideres) })));
        res.json(gruposFormatados);
    }
    catch (error) {
        console.error('Erro ao buscar grupos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Rotas de Financeiro
app.get('/api/financeiro', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lancamentos = yield prisma.lancamentoFinanceiro.findMany({
            orderBy: {
                data: 'desc'
            }
        });
        res.json(lancamentos);
    }
    catch (error) {
        console.error('Erro ao buscar lançamentos financeiros:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Rotas de Patrimônio
app.get('/api/patrimonio', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patrimonio = yield prisma.patrimonio.findMany({
            orderBy: {
                nome: 'asc'
            }
        });
        res.json(patrimonio);
    }
    catch (error) {
        console.error('Erro ao buscar patrimônio:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Rotas de Eventos
app.get('/api/eventos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventos = yield prisma.evento.findMany({
            orderBy: {
                dataHora: 'asc'
            }
        });
        res.json(eventos);
    }
    catch (error) {
        console.error('Erro ao buscar eventos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Rotas do Mural
app.get('/api/mural', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mensagens = yield prisma.mensagemMural.findMany({
            orderBy: {
                titulo: 'asc'
            }
        });
        // Converter gruposEspecificos de JSON string para array
        const mensagensFormatadas = mensagens.map(mensagem => (Object.assign(Object.assign({}, mensagem), { gruposEspecificos: JSON.parse(mensagem.gruposEspecificos) })));
        res.json(mensagensFormatadas);
    }
    catch (error) {
        console.error('Erro ao buscar mensagens do mural:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}));
// Middleware de tratamento de erros
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    // Se o erro já tem código de autenticação, retorna formatado
    if (error && typeof error.code === 'string' && authErrors_1.AuthErrorCodes[error.code]) {
        return res.status(error.status || 400).json((0, authErrors_1.getAuthError)(error.code, error.details));
    }
    // Se for erro de validação
    if (error && error.name === 'ValidationError') {
        return res.status(400).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.VALIDATION_ERROR, error.details));
    }
    // Erro genérico
    res.status(500).json((0, authErrors_1.getAuthError)(authErrors_1.AuthErrorCodes.INTERNAL_ERROR));
});
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 API disponível em: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
// Graceful shutdown
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('\n🛑 Encerrando servidor...');
    yield prisma.$disconnect();
    process.exit(0);
}));

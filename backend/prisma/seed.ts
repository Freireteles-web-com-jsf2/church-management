import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Limpar dados existentes
    await prisma.mensagemMural.deleteMany();
    await prisma.evento.deleteMany();
    await prisma.patrimonio.deleteMany();
    await prisma.lancamentoFinanceiro.deleteMany();
    await prisma.pessoa.deleteMany();
    await prisma.grupo.deleteMany();
    await prisma.permissao.deleteMany();
    await prisma.perfil.deleteMany();

    console.log('🗑️  Dados existentes removidos');

    // Criar perfis e permissões
    await createPerfis();
    console.log('👥 Perfis criados');

    // Criar grupos
    const grupos = await createGrupos();
    console.log('🏠 Grupos criados');

    // Criar pessoas
    await createPessoas(grupos);
    console.log('👤 Pessoas criadas');

    // Criar lançamentos financeiros
    await createLancamentosFinanceiros();
    console.log('💰 Lançamentos financeiros criados');

    // Criar patrimônio
    await createPatrimonio();
    console.log('📦 Patrimônio criado');

    // Criar eventos
    await createEventos();
    console.log('📅 Eventos criados');

    // Criar mensagens do mural
    await createMensagensMural();
    console.log('📢 Mensagens do mural criadas');

    console.log('✅ Seed concluído com sucesso!');
}

async function createPerfis() {
    const perfisData = [
        {
            nome: 'Administrador',
            permissoes: {
                create: [
                    { nome: 'gerenciar_usuarios', descricao: 'Gerenciar usuários do sistema' },
                    { nome: 'gerenciar_perfis', descricao: 'Gerenciar perfis e permissões' },
                    { nome: 'acessar_todas_funcionalidades', descricao: 'Acesso total ao sistema' },
                    { nome: 'gerenciar_configuracoes', descricao: 'Gerenciar configurações do sistema' },
                ]
            }
        },
        {
            nome: 'Pastor',
            permissoes: {
                create: [
                    { nome: 'gerenciar_membros', descricao: 'Gerenciar membros da igreja' },
                    { nome: 'gerenciar_grupos', descricao: 'Gerenciar grupos e células' },
                    { nome: 'visualizar_financeiro', descricao: 'Visualizar relatórios financeiros' },
                    { nome: 'gerenciar_eventos', descricao: 'Gerenciar eventos e agenda' },
                    { nome: 'gerenciar_mural', descricao: 'Gerenciar mural da igreja' },
                ]
            }
        },
        {
            nome: 'Líder',
            permissoes: {
                create: [
                    { nome: 'visualizar_membros', descricao: 'Visualizar membros do seu grupo' },
                    { nome: 'gerenciar_seu_grupo', descricao: 'Gerenciar apenas seu grupo' },
                    { nome: 'criar_eventos', descricao: 'Criar eventos para seu grupo' },
                ]
            }
        },
        {
            nome: 'Tesoureiro',
            permissoes: {
                create: [
                    { nome: 'gerenciar_financeiro', descricao: 'Gerenciar finanças da igreja' },
                    { nome: 'gerenciar_patrimonio', descricao: 'Gerenciar patrimônio da igreja' },
                    { nome: 'visualizar_relatorios', descricao: 'Visualizar relatórios financeiros' },
                ]
            }
        },
        {
            nome: 'Voluntário',
            permissoes: {
                create: [
                    { nome: 'visualizar_agenda', descricao: 'Visualizar agenda de eventos' },
                    { nome: 'visualizar_mural', descricao: 'Visualizar mural da igreja' },
                ]
            }
        },
        {
            nome: 'Membro',
            permissoes: {
                create: [
                    { nome: 'visualizar_agenda', descricao: 'Visualizar agenda de eventos' },
                    { nome: 'visualizar_mural', descricao: 'Visualizar mural da igreja' },
                    { nome: 'editar_perfil', descricao: 'Editar próprio perfil' },
                ]
            }
        }
    ];

    const perfis: any[] = [];
    for (const perfilData of perfisData) {
        const perfil = await prisma.perfil.create({
            data: perfilData,
            include: { permissoes: true }
        });
        perfis.push(perfil);
    }

    return perfis;
}

async function createGrupos() {
    const gruposData = [
        {
            nome: 'Célula Esperança',
            categoria: 'Célula',
            endereco: 'Rua das Flores, 123 - Centro',
            lideres: JSON.stringify(['João Silva', 'Maria Santos']),
            dataHoraReuniao: new Date('2024-01-15T19:30:00'),
            status: 'Ativo',
            observacoes: 'Célula focada em jovens e famílias'
        },
        {
            nome: 'Grupo de Oração',
            categoria: 'Ministério',
            endereco: 'Igreja - Sala 2',
            lideres: JSON.stringify(['Ana Costa']),
            dataHoraReuniao: new Date('2024-01-10T18:00:00'),
            status: 'Ativo',
            observacoes: 'Reunião de oração todas as quartas-feiras'
        },
        {
            nome: 'Ministério de Louvor',
            categoria: 'Ministério',
            endereco: 'Igreja - Santuário',
            lideres: JSON.stringify(['Carlos Oliveira', 'Fernanda Lima']),
            dataHoraReuniao: new Date('2024-01-12T19:00:00'),
            status: 'Ativo',
            observacoes: 'Ensaios aos sábados'
        },
        {
            nome: 'Célula Vida Nova',
            categoria: 'Célula',
            endereco: 'Av. Principal, 456 - Jardim',
            lideres: JSON.stringify(['Pedro Almeida']),
            dataHoraReuniao: new Date('2024-01-14T20:00:00'),
            status: 'Ativo',
            observacoes: 'Célula para novos convertidos'
        },
        {
            nome: 'Ministério Infantil',
            categoria: 'Ministério',
            endereco: 'Igreja - Sala Infantil',
            lideres: JSON.stringify(['Lucia Ferreira', 'Roberto Silva']),
            dataHoraReuniao: new Date('2024-01-07T09:00:00'),
            status: 'Ativo',
            observacoes: 'Atividades para crianças de 4 a 12 anos'
        }
    ];

    const grupos: any[] = [];
    for (const grupoData of gruposData) {
        const grupo = await prisma.grupo.create({
            data: grupoData
        });
        grupos.push(grupo);
    }

    return grupos;
}

async function createPessoas(grupos: any[]) {
    const pessoasData = [
        {
            nome: 'João Silva',
            dataNascimento: new Date('1985-03-15'),
            genero: 'Masculino',
            estadoCivil: 'Casado',
            email: 'joao.silva@email.com',
            telefone: '(11) 99999-1111',
            endereco: 'Rua das Flores, 123',
            numero: '123',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            funcao: 'Líder',
            grupoId: grupos[0].id,
            dataIngresso: new Date('2020-01-15'),
            batizado: true,
            camposPersonalizados: {
                profissao: 'Engenheiro',
                estadoCivil: 'Casado',
                conjuge: 'Maria Silva'
            }
        },
        {
            nome: 'Maria Santos',
            dataNascimento: new Date('1990-07-22'),
            genero: 'Feminino',
            estadoCivil: 'Solteira',
            email: 'maria.santos@email.com',
            telefone: '(11) 99999-2222',
            endereco: 'Av. Principal, 456',
            numero: '456',
            bairro: 'Jardim',
            cidade: 'São Paulo',
            estado: 'SP',
            funcao: 'Líder',
            grupoId: grupos[0].id,
            dataIngresso: new Date('2019-05-10'),
            batizado: true,
            camposPersonalizados: {
                profissao: 'Professora',
                ministerio: 'Ensino'
            }
        },
        {
            nome: 'Ana Costa',
            dataNascimento: new Date('1975-11-08'),
            genero: 'Feminino',
            estadoCivil: 'Casada',
            email: 'ana.costa@email.com',
            telefone: '(11) 99999-3333',
            endereco: 'Rua da Paz, 789',
            numero: '789',
            bairro: 'Vila Nova',
            cidade: 'São Paulo',
            estado: 'SP',
            funcao: 'Líder',
            grupoId: grupos[1].id,
            dataIngresso: new Date('2018-03-20'),
            batizado: true,
            camposPersonalizados: {
                profissao: 'Enfermeira',
                ministerio: 'Oração'
            }
        },
        {
            nome: 'Carlos Oliveira',
            dataNascimento: new Date('1988-09-12'),
            genero: 'Masculino',
            estadoCivil: 'Casado',
            email: 'carlos.oliveira@email.com',
            telefone: '(11) 99999-4444',
            endereco: 'Rua Harmonia, 321',
            numero: '321',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            funcao: 'Líder',
            grupoId: grupos[2].id,
            dataIngresso: new Date('2017-08-15'),
            batizado: true,
            camposPersonalizados: {
                profissao: 'Músico',
                ministerio: 'Louvor',
                instrumento: 'Guitarra'
            }
        },
        {
            nome: 'Fernanda Lima',
            dataNascimento: new Date('1992-04-18'),
            genero: 'Feminino',
            estadoCivil: 'Solteira',
            email: 'fernanda.lima@email.com',
            telefone: '(11) 99999-5555',
            endereco: 'Av. Melodia, 654',
            numero: '654',
            bairro: 'Jardim',
            cidade: 'São Paulo',
            estado: 'SP',
            funcao: 'Líder',
            grupoId: grupos[2].id,
            dataIngresso: new Date('2019-02-10'),
            batizado: true,
            camposPersonalizados: {
                profissao: 'Cantora',
                ministerio: 'Louvor',
                instrumento: 'Vocal'
            }
        },
        {
            nome: 'Pedro Almeida',
            dataNascimento: new Date('1980-12-03'),
            genero: 'Masculino',
            estadoCivil: 'Casado',
            email: 'pedro.almeida@email.com',
            telefone: '(11) 99999-6666',
            endereco: 'Rua Nova Vida, 987',
            numero: '987',
            bairro: 'Vila Esperança',
            cidade: 'São Paulo',
            estado: 'SP',
            funcao: 'Líder',
            grupoId: grupos[3].id,
            dataIngresso: new Date('2016-11-25'),
            batizado: true,
            camposPersonalizados: {
                profissao: 'Pastor',
                ministerio: 'Evangelismo'
            }
        },
        {
            nome: 'Lucia Ferreira',
            dataNascimento: new Date('1983-06-14'),
            genero: 'Feminino',
            estadoCivil: 'Casada',
            email: 'lucia.ferreira@email.com',
            telefone: '(11) 99999-7777',
            endereco: 'Rua Alegria, 147',
            numero: '147',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            funcao: 'Líder',
            grupoId: grupos[4].id,
            dataIngresso: new Date('2018-09-05'),
            batizado: true,
            camposPersonalizados: {
                profissao: 'Pedagoga',
                ministerio: 'Infantil'
            }
        },
        {
            nome: 'Roberto Silva',
            dataNascimento: new Date('1978-01-28'),
            genero: 'Masculino',
            estadoCivil: 'Casado',
            email: 'roberto.silva@email.com',
            telefone: '(11) 99999-8888',
            endereco: 'Av. Criança, 258',
            numero: '258',
            bairro: 'Jardim',
            cidade: 'São Paulo',
            estado: 'SP',
            funcao: 'Líder',
            grupoId: grupos[4].id,
            dataIngresso: new Date('2017-04-12'),
            batizado: true,
            camposPersonalizados: {
                profissao: 'Educador Físico',
                ministerio: 'Infantil'
            }
        }
    ];

    // Adicionar alguns membros regulares
    const membrosRegulares = [
        {
            nome: 'Marcos Pereira',
            dataNascimento: new Date('1995-05-20'),
            genero: 'Masculino',
            estadoCivil: 'Solteiro',
            email: 'marcos.pereira@email.com',
            telefone: '(11) 99999-9999',
            endereco: 'Rua Juventude, 369',
            numero: '369',
            bairro: 'Vila Nova',
            cidade: 'São Paulo',
            estado: 'SP',
            funcao: 'Membro',
            grupoId: grupos[0].id,
            dataIngresso: new Date('2021-06-15'),
            batizado: false,
            camposPersonalizados: {
                profissao: 'Estudante',
                curso: 'Administração'
            }
        },
        {
            nome: 'Juliana Rodrigues',
            dataNascimento: new Date('1987-10-11'),
            genero: 'Feminino',
            estadoCivil: 'Casada',
            email: 'juliana.rodrigues@email.com',
            telefone: '(11) 99999-0000',
            endereco: 'Rua Família, 741',
            numero: '741',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            funcao: 'Membro',
            grupoId: grupos[1].id,
            dataIngresso: new Date('2020-08-30'),
            batizado: true,
            camposPersonalizados: {
                profissao: 'Contadora',
                ministerio: 'Administração'
            }
        }
    ];

    const todasPessoas = [...pessoasData, ...membrosRegulares];

    for (const pessoaData of todasPessoas) {
        await prisma.pessoa.create({
            data: pessoaData
        });
    }
}

async function createLancamentosFinanceiros() {
    const lancamentosData = [
        {
            tipo: 'Receita',
            valor: 2500.00,
            data: new Date('2024-01-07'),
            categoria: 'Dízimo',
            pessoaFornecedor: 'João Silva',
            formaPagamento: 'PIX',
            observacoes: 'Dízimo mensal'
        },
        {
            tipo: 'Receita',
            valor: 800.00,
            data: new Date('2024-01-07'),
            categoria: 'Oferta',
            pessoaFornecedor: 'Maria Santos',
            formaPagamento: 'Dinheiro',
            observacoes: 'Oferta especial para missões'
        },
        {
            tipo: 'Despesa',
            valor: 450.00,
            data: new Date('2024-01-05'),
            categoria: 'Energia Elétrica',
            pessoaFornecedor: 'Companhia Elétrica',
            formaPagamento: 'Débito Automático',
            observacoes: 'Conta de luz da igreja'
        },
        {
            tipo: 'Despesa',
            valor: 320.00,
            data: new Date('2024-01-03'),
            categoria: 'Material de Limpeza',
            pessoaFornecedor: 'Loja de Materiais',
            formaPagamento: 'Cartão de Crédito',
            observacoes: 'Produtos para limpeza da igreja'
        },
        {
            tipo: 'Receita',
            valor: 1200.00,
            data: new Date('2024-01-14'),
            categoria: 'Dízimo',
            pessoaFornecedor: 'Ana Costa',
            formaPagamento: 'Transferência',
            observacoes: 'Dízimo mensal'
        },
        {
            tipo: 'Despesa',
            valor: 180.00,
            data: new Date('2024-01-10'),
            categoria: 'Internet',
            pessoaFornecedor: 'Provedor Internet',
            formaPagamento: 'Débito Automático',
            observacoes: 'Internet da igreja'
        }
    ];

    for (const lancamentoData of lancamentosData) {
        await prisma.lancamentoFinanceiro.create({
            data: lancamentoData
        });
    }
}

async function createPatrimonio() {
    const patrimonioData = [
        {
            nome: 'Sistema de Som',
            categoria: 'Equipamento de Áudio',
            localizacao: 'Santuário Principal',
            valorEstimado: 15000.00,
            dataAquisicao: new Date('2022-03-15'),
            situacao: 'Bom',
            anotacoes: 'Mesa de som digital com 32 canais'
        },
        {
            nome: 'Projetor Multimídia',
            categoria: 'Equipamento de Vídeo',
            localizacao: 'Santuário Principal',
            valorEstimado: 3500.00,
            dataAquisicao: new Date('2023-01-20'),
            situacao: 'Excelente',
            anotacoes: 'Projetor Full HD para apresentações'
        },
        {
            nome: 'Piano Digital',
            categoria: 'Instrumento Musical',
            localizacao: 'Santuário Principal',
            valorEstimado: 8000.00,
            dataAquisicao: new Date('2021-11-10'),
            situacao: 'Bom',
            anotacoes: 'Piano digital 88 teclas'
        },
        {
            nome: 'Cadeiras do Santuário',
            categoria: 'Mobiliário',
            localizacao: 'Santuário Principal',
            valorEstimado: 12000.00,
            dataAquisicao: new Date('2020-08-05'),
            situacao: 'Bom',
            anotacoes: '200 cadeiras estofadas'
        },
        {
            nome: 'Ar Condicionado Central',
            categoria: 'Climatização',
            localizacao: 'Santuário Principal',
            valorEstimado: 25000.00,
            dataAquisicao: new Date('2022-06-30'),
            situacao: 'Excelente',
            anotacoes: 'Sistema central de 60.000 BTUs'
        }
    ];

    for (const patrimonioItem of patrimonioData) {
        await prisma.patrimonio.create({
            data: patrimonioItem
        });
    }
}

async function createEventos() {
    const eventosData = [
        {
            titulo: 'Culto Dominical',
            dataHora: new Date('2024-01-21T10:00:00'),
            recorrencia: 'Semanal',
            notificacoesAtivadas: true,
            descricao: 'Culto de adoração e pregação da palavra'
        },
        {
            titulo: 'Reunião de Oração',
            dataHora: new Date('2024-01-17T19:30:00'),
            recorrencia: 'Semanal',
            notificacoesAtivadas: true,
            descricao: 'Reunião de oração todas as quartas-feiras'
        },
        {
            titulo: 'Escola Bíblica Dominical',
            dataHora: new Date('2024-01-21T09:00:00'),
            recorrencia: 'Semanal',
            notificacoesAtivadas: true,
            descricao: 'Estudo bíblico para todas as idades'
        },
        {
            titulo: 'Conferência de Jovens',
            dataHora: new Date('2024-02-15T19:00:00'),
            recorrencia: 'Único',
            notificacoesAtivadas: true,
            descricao: 'Conferência especial para jovens com palestrante convidado'
        },
        {
            titulo: 'Retiro Espiritual',
            dataHora: new Date('2024-03-08T08:00:00'),
            recorrencia: 'Único',
            notificacoesAtivadas: true,
            descricao: 'Retiro de fim de semana para renovação espiritual'
        }
    ];

    for (const eventoData of eventosData) {
        await prisma.evento.create({
            data: eventoData
        });
    }
}

async function createMensagensMural() {
    const mensagensData = [
        {
            titulo: 'Bem-vindos à nossa igreja!',
            mensagem: 'Sejam todos bem-vindos à nossa comunidade de fé. Que Deus abençoe a todos!',
            visibilidade: 'Todos',
            gruposEspecificos: JSON.stringify([])
        },
        {
            titulo: 'Conferência de Jovens - Inscrições Abertas',
            mensagem: 'As inscrições para a Conferência de Jovens estão abertas! Não percam essa oportunidade de crescimento espiritual.',
            visibilidade: 'Grupos Específicos',
            gruposEspecificos: JSON.stringify(['Célula Esperança', 'Célula Vida Nova'])
        },
        {
            titulo: 'Campanha de Arrecadação',
            mensagem: 'Estamos arrecadando alimentos não perecíveis para famílias carentes. Sua contribuição faz a diferença!',
            visibilidade: 'Todos',
            gruposEspecificos: JSON.stringify([])
        },
        {
            titulo: 'Ensaio do Coral',
            mensagem: 'Lembrete: ensaio do coral hoje às 19h no santuário. Presença obrigatória para todos os coralistas.',
            visibilidade: 'Grupos Específicos',
            gruposEspecificos: JSON.stringify(['Ministério de Louvor'])
        }
    ];

    for (const mensagemData of mensagensData) {
        await prisma.mensagemMural.create({
            data: mensagemData
        });
    }
}

main()
    .catch((e) => {
        console.error('❌ Erro durante o seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
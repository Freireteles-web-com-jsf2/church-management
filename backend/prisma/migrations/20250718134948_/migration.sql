-- CreateTable
CREATE TABLE "Pessoa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "dataNascimento" DATETIME NOT NULL,
    "genero" TEXT NOT NULL,
    "estadoCivil" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "grupoId" TEXT,
    "fotoUrl" TEXT,
    "dataIngresso" DATETIME NOT NULL,
    "batizado" BOOLEAN NOT NULL,
    "camposPersonalizados" JSONB,
    CONSTRAINT "Pessoa_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Grupo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "lideres" TEXT NOT NULL,
    "dataHoraReuniao" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "observacoes" TEXT
);

-- CreateTable
CREATE TABLE "LancamentoFinanceiro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "data" DATETIME NOT NULL,
    "categoria" TEXT NOT NULL,
    "pessoaFornecedor" TEXT NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "observacoes" TEXT,
    "anexoUrl" TEXT
);

-- CreateTable
CREATE TABLE "Patrimonio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL,
    "valorEstimado" REAL NOT NULL,
    "dataAquisicao" DATETIME NOT NULL,
    "situacao" TEXT NOT NULL,
    "anotacoes" TEXT,
    "anexoUrl" TEXT
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "dataHora" DATETIME NOT NULL,
    "recorrencia" TEXT NOT NULL,
    "notificacoesAtivadas" BOOLEAN NOT NULL,
    "descricao" TEXT
);

-- CreateTable
CREATE TABLE "MensagemMural" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "visibilidade" TEXT NOT NULL,
    "gruposEspecificos" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Perfil" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Permissao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "perfilId" TEXT NOT NULL,
    CONSTRAINT "Permissao_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Pessoa_email_key" ON "Pessoa"("email");

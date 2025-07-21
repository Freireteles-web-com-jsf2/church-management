"use strict";
// Centralização dos tipos/códigos/mensagens de erro de autenticação
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthErrorMessages = exports.AuthErrorCodes = void 0;
exports.getAuthError = getAuthError;
exports.AuthErrorCodes = {
    NO_TOKEN: 'NO_TOKEN',
    INVALID_TOKEN: 'INVALID_TOKEN',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
    AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
    TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',
    NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    ACCESS_DENIED: 'ACCESS_DENIED',
    MISSING_CREDENTIALS: 'MISSING_CREDENTIALS',
    MISSING_PASSWORD: 'MISSING_PASSWORD',
    WEAK_PASSWORD: 'WEAK_PASSWORD',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    EMAIL_EXISTS: 'EMAIL_EXISTS',
    RESET_FAILED: 'RESET_FAILED',
    INVALID_PASSWORD: 'INVALID_PASSWORD',
    MISSING_FIELDS: 'MISSING_FIELDS',
};
exports.AuthErrorMessages = {
    NO_TOKEN: 'Token de acesso requerido',
    INVALID_TOKEN: 'Token inválido ou expirado',
    USER_NOT_FOUND: 'Usuário não encontrado',
    ACCOUNT_INACTIVE: 'Conta desativada',
    AUTHENTICATION_FAILED: 'Credenciais inválidas',
    TOO_MANY_ATTEMPTS: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    NOT_AUTHENTICATED: 'Usuário não autenticado',
    INSUFFICIENT_PERMISSIONS: 'Permissões insuficientes para acessar este recurso.',
    ACCESS_DENIED: 'Acesso negado',
    MISSING_CREDENTIALS: 'Email e senha são obrigatórios',
    MISSING_PASSWORD: 'Senha é obrigatória',
    WEAK_PASSWORD: 'A senha não atende aos requisitos de segurança',
    INTERNAL_ERROR: 'Erro interno do servidor',
    VALIDATION_ERROR: 'Erro de validação',
    EMAIL_EXISTS: 'Email já está em uso',
    RESET_FAILED: 'Não foi possível redefinir a senha. O token pode ser inválido ou ter expirado.',
    INVALID_PASSWORD: 'Senha inválida',
    MISSING_FIELDS: 'Campos obrigatórios ausentes',
};
function getAuthError(code, details) {
    return Object.assign({ error: exports.AuthErrorMessages[code] || 'Erro de autenticação', code }, (details ? { details } : {}));
}

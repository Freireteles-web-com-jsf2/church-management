"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.PasswordResetService = void 0;
const crypto = __importStar(require("crypto"));
const client_1 = require("@prisma/client");
const AuthService_1 = __importDefault(require("./AuthService"));
const crypto_1 = __importDefault(require("../utils/crypto"));
const prisma = new client_1.PrismaClient();
class PasswordResetService {
    /**
     * Cria um token de redefinição de senha para o usuário
     */
    static createResetToken(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verificar se o email existe
                const user = yield prisma.pessoa.findUnique({
                    where: { email }
                });
                if (!user) {
                    // Por segurança, não revelamos se o email existe ou não
                    console.log(`Reset password requested for non-existent email: ${email}`);
                    return null;
                }
                // Gerar token seguro
                const token = crypto_1.default.generateSecureToken(32);
                // Criar registro de token
                const resetToken = {
                    id: crypto.randomUUID(),
                    userId: user.id,
                    email: user.email,
                    token: token,
                    expiresAt: new Date(Date.now() + this.TOKEN_EXPIRY),
                    used: false,
                    createdAt: new Date()
                };
                // Armazenar token (em produção, isso seria armazenado no banco de dados)
                if (!global.passwordResetTokens) {
                    global.passwordResetTokens = new Map();
                }
                // Invalidar tokens anteriores para este usuário
                for (const [existingToken, tokenData] of global.passwordResetTokens.entries()) {
                    if (tokenData.userId === user.id && !tokenData.used) {
                        tokenData.used = true;
                        global.passwordResetTokens.set(existingToken, tokenData);
                    }
                }
                // Armazenar o novo token
                global.passwordResetTokens.set(token, resetToken);
                return resetToken;
            }
            catch (error) {
                console.error('Error creating password reset token:', error);
                return null;
            }
        });
    }
    /**
     * Verifica se um token de redefinição de senha é válido
     */
    static validateResetToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!global.passwordResetTokens) {
                return null;
            }
            const resetToken = global.passwordResetTokens.get(token);
            if (!resetToken) {
                return null;
            }
            // Verificar se o token expirou
            if (new Date() > resetToken.expiresAt || resetToken.used) {
                return null;
            }
            return resetToken;
        });
    }
    /**
     * Redefine a senha do usuário usando um token válido
     */
    static resetPassword(token, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validar o token
                const resetToken = yield this.validateResetToken(token);
                if (!resetToken) {
                    return false;
                }
                // Validar a nova senha
                const passwordValidation = AuthService_1.default.validatePassword(newPassword);
                if (!passwordValidation.isValid) {
                    return false;
                }
                // Gerar hash da nova senha
                const hashedPassword = yield AuthService_1.default.hashPassword(newPassword);
                // Em uma implementação real, você atualizaria a senha no banco de dados
                // Por enquanto, apenas simulamos o sucesso
                console.log(`Password reset for user ${resetToken.userId} (${resetToken.email})`);
                // Marcar o token como usado
                resetToken.used = true;
                global.passwordResetTokens.set(token, resetToken);
                return true;
            }
            catch (error) {
                console.error('Error resetting password:', error);
                return false;
            }
        });
    }
    /**
     * Limpa tokens expirados ou usados
     */
    static cleanupExpiredTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!global.passwordResetTokens) {
                return;
            }
            const now = new Date();
            for (const [token, tokenData] of global.passwordResetTokens.entries()) {
                if (now > tokenData.expiresAt || tokenData.used) {
                    global.passwordResetTokens.delete(token);
                }
            }
        });
    }
}
exports.PasswordResetService = PasswordResetService;
PasswordResetService.TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
// Inicializar limpeza periódica de tokens expirados
setInterval(() => {
    PasswordResetService.cleanupExpiredTokens();
}, 60 * 60 * 1000); // Limpar a cada hora
exports.default = PasswordResetService;

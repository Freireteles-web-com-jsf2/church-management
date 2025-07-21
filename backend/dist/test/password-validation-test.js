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
Object.defineProperty(exports, "__esModule", { value: true });
const AuthService_1 = require("../services/AuthService");
console.log('🔐 Testando Sistema de Validação de Senhas...\n');
// Test cases for password validation
const testCases = [
    // Valid passwords
    { password: 'MinhaSenh@123', expected: true, description: 'Senha válida básica' },
    { password: 'SuperSenh@Forte456!', expected: true, description: 'Senha forte com maiúsculas e minúsculas' },
    { password: 'C0mpl3x@P@ssw0rd!', expected: true, description: 'Senha complexa' },
    // Invalid passwords - too short
    { password: 'abc123!', expected: false, description: 'Muito curta (7 caracteres)' },
    { password: '1234567', expected: false, description: 'Muito curta sem caracteres especiais' },
    // Invalid passwords - missing character types
    { password: 'senhasemnum!', expected: false, description: 'Sem números' },
    { password: 'senha123456', expected: false, description: 'Sem caracteres especiais' },
    { password: 'SENHA123!', expected: false, description: 'Sem letras minúsculas' },
    // Invalid passwords - weak patterns
    { password: 'password123!', expected: false, description: 'Contém palavra comum' },
    { password: 'admin123!', expected: false, description: 'Contém palavra comum' },
    { password: '123456789!A', expected: false, description: 'Sequência numérica' },
    { password: 'qwerty123!', expected: false, description: 'Sequência de teclado' },
    { password: 'aaa123456!', expected: false, description: 'Caracteres repetidos' },
    // Invalid passwords - whitespace issues
    { password: ' senha123!', expected: false, description: 'Espaço no início' },
    { password: 'senha123! ', expected: false, description: 'Espaço no final' },
    // Edge cases
    { password: 'a'.repeat(129) + '1!', expected: false, description: 'Muito longa (>128 caracteres)' },
    { password: '', expected: false, description: 'Senha vazia' },
];
// Test password validation
console.log('📋 Testando validação básica de senhas:\n');
let passedTests = 0;
let totalTests = testCases.length;
testCases.forEach((testCase, index) => {
    const result = AuthService_1.AuthService.validatePassword(testCase.password);
    const passed = result.isValid === testCase.expected;
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   Senha: "${testCase.password}"`);
    console.log(`   Esperado: ${testCase.expected ? 'Válida' : 'Inválida'}`);
    console.log(`   Resultado: ${result.isValid ? 'Válida' : 'Inválida'}`);
    if (!result.isValid && result.errors.length > 0) {
        console.log(`   Erros: ${result.errors.join(', ')}`);
    }
    console.log(`   Status: ${passed ? '✅ PASSOU' : '❌ FALHOU'}\n`);
    if (passed)
        passedTests++;
});
console.log(`📊 Resultado dos testes de validação: ${passedTests}/${totalTests} passaram\n`);
// Test password strength scoring
console.log('💪 Testando sistema de força de senhas:\n');
const strengthTestCases = [
    { password: '123', expectedLevel: 'weak' },
    { password: 'senha123', expectedLevel: 'weak' },
    { password: 'MinhaSenh@123', expectedLevel: 'fair' },
    { password: 'SuperSenh@Forte456!', expectedLevel: 'good' },
    { password: 'C0mpl3x@P@ssw0rd!WithM0r3Ch@rs', expectedLevel: 'strong' },
];
strengthTestCases.forEach((testCase, index) => {
    const result = AuthService_1.AuthService.getPasswordStrength(testCase.password);
    console.log(`${index + 1}. Senha: "${testCase.password}"`);
    console.log(`   Pontuação: ${result.score}/100`);
    console.log(`   Nível: ${result.level}`);
    console.log(`   Esperado: ${testCase.expectedLevel}`);
    console.log(`   Feedback: ${result.feedback.join(', ')}`);
    console.log(`   Status: ${result.level === testCase.expectedLevel ? '✅ PASSOU' : '❌ FALHOU'}\n`);
});
// Test password hashing
console.log('🔒 Testando hash de senhas:\n');
function testPasswordHashing() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const password = 'MinhaSenh@123';
            console.log('1. Testando hash de senha...');
            const hash = yield AuthService_1.AuthService.hashPassword(password);
            console.log(`   Senha original: ${password}`);
            console.log(`   Hash gerado: ${hash.substring(0, 20)}...`);
            console.log(`   Status: ✅ Hash gerado com sucesso\n`);
            console.log('2. Testando verificação de senha...');
            const isValid = yield AuthService_1.AuthService.verifyPassword(password, hash);
            console.log(`   Verificação com senha correta: ${isValid ? '✅ PASSOU' : '❌ FALHOU'}`);
            const isInvalid = yield AuthService_1.AuthService.verifyPassword('senhaerrada', hash);
            console.log(`   Verificação com senha incorreta: ${!isInvalid ? '✅ PASSOU' : '❌ FALHOU'}\n`);
        }
        catch (error) {
            console.error('❌ Erro no teste de hash:', error);
        }
    });
}
// Test token generation
console.log('🎫 Testando geração de tokens:\n');
function testTokenGeneration() {
    try {
        console.log('1. Testando geração de token seguro...');
        const token1 = AuthService_1.AuthService.generateSecureToken();
        const token2 = AuthService_1.AuthService.generateSecureToken();
        console.log(`   Token 1: ${token1.substring(0, 20)}...`);
        console.log(`   Token 2: ${token2.substring(0, 20)}...`);
        console.log(`   Tokens são diferentes: ${token1 !== token2 ? '✅ PASSOU' : '❌ FALHOU'}\n`);
        console.log('2. Testando validação de token...');
        const validation1 = AuthService_1.AuthService.validateToken(token1);
        console.log(`   Token válido: ${validation1.isValid ? '✅ PASSOU' : '❌ FALHOU'}`);
        const validation2 = AuthService_1.AuthService.validateToken('token_invalido');
        console.log(`   Token inválido rejeitado: ${!validation2.isValid ? '✅ PASSOU' : '❌ FALHOU'}\n`);
    }
    catch (error) {
        console.error('❌ Erro no teste de tokens:', error);
    }
}
// Run all tests
function runAllTests() {
    return __awaiter(this, void 0, void 0, function* () {
        yield testPasswordHashing();
        testTokenGeneration();
        console.log('🎉 Todos os testes de validação de senhas foram executados!');
        console.log('📝 Verifique os resultados acima para garantir que tudo está funcionando corretamente.');
    });
}
runAllTests().catch(console.error);

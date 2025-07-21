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
const AuthService_1 = __importDefault(require("../services/AuthService"));
function runIntegrationTests() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log('🧪 Running Authentication Service Integration Tests...\n');
        let testsPassed = 0;
        let testsTotal = 0;
        function test(name, condition) {
            testsTotal++;
            if (condition) {
                console.log(`✅ ${name}`);
                testsPassed++;
            }
            else {
                console.log(`❌ ${name}`);
            }
        }
        // Test 1: Password Validation
        console.log('1. Password Validation Tests:');
        const weakPassword = AuthService_1.default.validatePassword('123');
        const strongPassword = AuthService_1.default.validatePassword('MyStr0ng!Pass');
        test('Weak password rejected', !weakPassword.isValid && weakPassword.errors.length > 0);
        test('Strong password accepted', strongPassword.isValid && strongPassword.errors.length === 0);
        // Test 2: Password Hashing
        console.log('\n2. Password Hashing Tests:');
        const password = 'testPassword123!';
        const hashedPassword = yield AuthService_1.default.hashPassword(password);
        const isValidPassword = yield AuthService_1.default.verifyPassword(password, hashedPassword);
        const isInvalidPassword = yield AuthService_1.default.verifyPassword('wrongPassword', hashedPassword);
        test('Password hashing works', hashedPassword.length > 50);
        test('Password verification works (correct)', isValidPassword);
        test('Password verification works (incorrect)', !isInvalidPassword);
        // Test 3: Token Generation and Validation
        console.log('\n3. Token Generation Tests:');
        const secureToken = AuthService_1.default.generateSecureToken();
        const sessionToken = AuthService_1.default.generateSessionToken('user123', false);
        const extendedSessionToken = AuthService_1.default.generateSessionToken('user123', true);
        test('Secure token generated', secureToken.length > 20);
        test('Session token generated', sessionToken.length > 20);
        test('Extended session token generated', extendedSessionToken.length > 20);
        const tokenValidation = AuthService_1.default.validateToken(sessionToken);
        test('Token validation works', tokenValidation.isValid);
        test('Token contains user ID', ((_a = tokenValidation.payload) === null || _a === void 0 ? void 0 : _a.userId) === 'user123');
        // Test 4: Login Attempt Tracking
        console.log('\n4. Login Attempt Tracking Tests:');
        const testEmail = 'test@example.com';
        const testIP = '192.168.1.1';
        // Clear any existing attempts
        if (global.loginAttempts) {
            global.loginAttempts = [];
        }
        // Record failed attempts
        yield AuthService_1.default.recordLoginAttempt(testEmail, false, testIP, 'Test Browser', 'INVALID_PASSWORD');
        yield AuthService_1.default.recordLoginAttempt(testEmail, false, testIP, 'Test Browser', 'INVALID_PASSWORD');
        yield AuthService_1.default.recordLoginAttempt(testEmail, false, testIP, 'Test Browser', 'INVALID_PASSWORD');
        const canAttemptLogin = yield AuthService_1.default.checkLoginAttempts(testEmail, testIP);
        test('Login attempts tracked (3 failures, still allowed)', canAttemptLogin);
        // Add more failures to trigger lockout
        yield AuthService_1.default.recordLoginAttempt(testEmail, false, testIP, 'Test Browser', 'INVALID_PASSWORD');
        yield AuthService_1.default.recordLoginAttempt(testEmail, false, testIP, 'Test Browser', 'INVALID_PASSWORD');
        const canAttemptAfterLockout = yield AuthService_1.default.checkLoginAttempts(testEmail, testIP);
        test('Account lockout works (5 failures, blocked)', !canAttemptAfterLockout);
        // Test 5: Session Management
        console.log('\n5. Session Management Tests:');
        const mockUser = {
            id: 'user123',
            nome: 'Test User',
            email: 'test@example.com',
            funcao: 'membro',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const session = AuthService_1.default.createSession(mockUser, false, testIP, 'Test Browser');
        test('Session created', session.token.length > 20);
        test('Session has correct user ID', session.userId === 'user123');
        test('Session has expiry date', session.expiresAt > new Date());
        const validatedSession = yield AuthService_1.default.validateSession(session.token);
        test('Session validation works', validatedSession !== null);
        test('Validated session matches created session', (validatedSession === null || validatedSession === void 0 ? void 0 : validatedSession.userId) === session.userId);
        const refreshedSession = yield AuthService_1.default.refreshSession(session.token);
        test('Session refresh works', refreshedSession !== null);
        test('Refreshed session has extended expiry', refreshedSession !== null && refreshedSession.expiresAt > session.expiresAt);
        yield AuthService_1.default.destroySession(session.token);
        const destroyedSession = yield AuthService_1.default.validateSession(session.token);
        test('Session destruction works', destroyedSession === null);
        // Test 6: Security Features
        console.log('\n6. Security Features Tests:');
        // Test multiple sessions for same user
        const session1 = AuthService_1.default.createSession(mockUser, false, testIP, 'Browser 1');
        const session2 = AuthService_1.default.createSession(mockUser, false, testIP, 'Browser 2');
        const activeSessions = yield AuthService_1.default.getActiveSessions(mockUser.id);
        test('Multiple sessions supported', activeSessions.length >= 2);
        // Clean up test sessions
        yield AuthService_1.default.destroySession(session1.token);
        yield AuthService_1.default.destroySession(session2.token);
        // Test expired session cleanup
        yield AuthService_1.default.cleanExpiredSessions();
        test('Expired session cleanup runs without error', true);
        // Summary
        console.log('\n📊 Test Summary:');
        console.log(`   Tests passed: ${testsPassed}/${testsTotal}`);
        console.log(`   Success rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);
        if (testsPassed === testsTotal) {
            console.log('\n🎉 All tests passed! Authentication Service is working correctly.');
            return true;
        }
        else {
            console.log('\n⚠️  Some tests failed. Please review the implementation.');
            return false;
        }
    });
}
// Export for use in other files
exports.default = runIntegrationTests;
// Run tests if this file is executed directly
if (require.main === module) {
    runIntegrationTests().catch(console.error);
}

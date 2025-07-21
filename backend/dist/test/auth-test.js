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
function testAuthService() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🧪 Testing Authentication Service...\n');
        // Test 1: Password validation
        console.log('1. Testing password validation:');
        const weakPassword = AuthService_1.default.validatePassword('123');
        const strongPassword = AuthService_1.default.validatePassword('MyStr0ng!Pass');
        console.log('   Weak password (123):', weakPassword.isValid ? '✅ Valid' : '❌ Invalid');
        if (!weakPassword.isValid) {
            console.log('   Errors:', weakPassword.errors);
        }
        console.log('   Strong password (MyStr0ng!Pass):', strongPassword.isValid ? '✅ Valid' : '❌ Invalid');
        if (!strongPassword.isValid) {
            console.log('   Errors:', strongPassword.errors);
        }
        // Test 2: Password hashing
        console.log('\n2. Testing password hashing:');
        const password = 'testPassword123!';
        const hashedPassword = yield AuthService_1.default.hashPassword(password);
        const isValidPassword = yield AuthService_1.default.verifyPassword(password, hashedPassword);
        const isInvalidPassword = yield AuthService_1.default.verifyPassword('wrongPassword', hashedPassword);
        console.log('   Original password:', password);
        console.log('   Hashed password:', hashedPassword.substring(0, 20) + '...');
        console.log('   Password verification (correct):', isValidPassword ? '✅ Valid' : '❌ Invalid');
        console.log('   Password verification (incorrect):', isInvalidPassword ? '❌ Should be false' : '✅ Correctly rejected');
        // Test 3: Token generation and validation
        console.log('\n3. Testing token generation:');
        const secureToken = AuthService_1.default.generateSecureToken();
        const sessionToken = AuthService_1.default.generateSessionToken('user123', false);
        const extendedSessionToken = AuthService_1.default.generateSessionToken('user123', true);
        console.log('   Secure token:', secureToken.substring(0, 20) + '...');
        console.log('   Session token:', sessionToken.substring(0, 20) + '...');
        console.log('   Extended session token:', extendedSessionToken.substring(0, 20) + '...');
        const tokenValidation = AuthService_1.default.validateToken(sessionToken);
        console.log('   Token validation:', tokenValidation.isValid ? '✅ Valid' : '❌ Invalid');
        if (tokenValidation.isValid) {
            console.log('   Token payload:', tokenValidation.payload);
        }
        // Test 4: Login attempt tracking
        console.log('\n4. Testing login attempt tracking:');
        const testEmail = 'test@example.com';
        const testIP = '192.168.1.1';
        // Record some failed attempts
        yield AuthService_1.default.recordLoginAttempt(testEmail, false, testIP, 'Test Browser', 'INVALID_PASSWORD');
        yield AuthService_1.default.recordLoginAttempt(testEmail, false, testIP, 'Test Browser', 'INVALID_PASSWORD');
        yield AuthService_1.default.recordLoginAttempt(testEmail, false, testIP, 'Test Browser', 'INVALID_PASSWORD');
        const canAttemptLogin = yield AuthService_1.default.checkLoginAttempts(testEmail, testIP);
        console.log('   Can attempt login after 3 failures:', canAttemptLogin ? '✅ Allowed' : '❌ Blocked');
        // Record more failed attempts to trigger lockout
        yield AuthService_1.default.recordLoginAttempt(testEmail, false, testIP, 'Test Browser', 'INVALID_PASSWORD');
        yield AuthService_1.default.recordLoginAttempt(testEmail, false, testIP, 'Test Browser', 'INVALID_PASSWORD');
        const canAttemptAfterLockout = yield AuthService_1.default.checkLoginAttempts(testEmail, testIP);
        console.log('   Can attempt login after 5 failures:', canAttemptAfterLockout ? '❌ Should be blocked' : '✅ Correctly blocked');
        // Test 5: Session management
        console.log('\n5. Testing session management:');
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
        console.log('   Session created:', session.token.substring(0, 20) + '...');
        console.log('   Session expires at:', session.expiresAt);
        const validatedSession = yield AuthService_1.default.validateSession(session.token);
        console.log('   Session validation:', validatedSession ? '✅ Valid' : '❌ Invalid');
        const refreshedSession = yield AuthService_1.default.refreshSession(session.token);
        console.log('   Session refresh:', refreshedSession ? '✅ Refreshed' : '❌ Failed');
        yield AuthService_1.default.destroySession(session.token);
        const destroyedSession = yield AuthService_1.default.validateSession(session.token);
        console.log('   Session after destroy:', destroyedSession ? '❌ Should be null' : '✅ Correctly destroyed');
        console.log('\n✅ Authentication Service tests completed!');
    });
}
// Run tests if this file is executed directly
if (require.main === module) {
    testAuthService().catch(console.error);
}
exports.default = testAuthService;

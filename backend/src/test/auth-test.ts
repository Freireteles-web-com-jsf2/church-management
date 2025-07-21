import AuthService from '../services/AuthService';

async function testAuthService() {
  console.log('🧪 Testing Authentication Service...\n');

  // Test 1: Password validation
  console.log('1. Testing password validation:');
  const weakPassword = AuthService.validatePassword('123');
  const strongPassword = AuthService.validatePassword('MyStr0ng!Pass');
  
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
  const hashedPassword = await AuthService.hashPassword(password);
  const isValidPassword = await AuthService.verifyPassword(password, hashedPassword);
  const isInvalidPassword = await AuthService.verifyPassword('wrongPassword', hashedPassword);
  
  console.log('   Original password:', password);
  console.log('   Hashed password:', hashedPassword.substring(0, 20) + '...');
  console.log('   Password verification (correct):', isValidPassword ? '✅ Valid' : '❌ Invalid');
  console.log('   Password verification (incorrect):', isInvalidPassword ? '❌ Should be false' : '✅ Correctly rejected');

  // Test 3: Token generation and validation
  console.log('\n3. Testing token generation:');
  const secureToken = AuthService.generateSecureToken();
  const sessionToken = AuthService.generateSessionToken('user123', false);
  const extendedSessionToken = AuthService.generateSessionToken('user123', true);
  
  console.log('   Secure token:', secureToken.substring(0, 20) + '...');
  console.log('   Session token:', sessionToken.substring(0, 20) + '...');
  console.log('   Extended session token:', extendedSessionToken.substring(0, 20) + '...');

  const tokenValidation = AuthService.validateToken(sessionToken);
  console.log('   Token validation:', tokenValidation.isValid ? '✅ Valid' : '❌ Invalid');
  if (tokenValidation.isValid) {
    console.log('   Token payload:', tokenValidation.payload);
  }

  // Test 4: Login attempt tracking
  console.log('\n4. Testing login attempt tracking:');
  const testEmail = 'test@example.com';
  const testIP = '192.168.1.1';

  // Record some failed attempts
  await AuthService.recordLoginAttempt(testEmail, false, testIP, 'Test Browser', 'INVALID_PASSWORD');
  await AuthService.recordLoginAttempt(testEmail, false, testIP, 'Test Browser', 'INVALID_PASSWORD');
  await AuthService.recordLoginAttempt(testEmail, false, testIP, 'Test Browser', 'INVALID_PASSWORD');

  const canAttemptLogin = await AuthService.checkLoginAttempts(testEmail, testIP);
  console.log('   Can attempt login after 3 failures:', canAttemptLogin ? '✅ Allowed' : '❌ Blocked');

  // Record more failed attempts to trigger lockout
  await AuthService.recordLoginAttempt(testEmail, false, testIP, 'Test Browser', 'INVALID_PASSWORD');
  await AuthService.recordLoginAttempt(testEmail, false, testIP, 'Test Browser', 'INVALID_PASSWORD');

  const canAttemptAfterLockout = await AuthService.checkLoginAttempts(testEmail, testIP);
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

  const session = AuthService.createSession(mockUser, false, testIP, 'Test Browser');
  console.log('   Session created:', session.token.substring(0, 20) + '...');
  console.log('   Session expires at:', session.expiresAt);

  const validatedSession = await AuthService.validateSession(session.token);
  console.log('   Session validation:', validatedSession ? '✅ Valid' : '❌ Invalid');

  const refreshedSession = await AuthService.refreshSession(session.token);
  console.log('   Session refresh:', refreshedSession ? '✅ Refreshed' : '❌ Failed');

  await AuthService.destroySession(session.token);
  const destroyedSession = await AuthService.validateSession(session.token);
  console.log('   Session after destroy:', destroyedSession ? '❌ Should be null' : '✅ Correctly destroyed');

  console.log('\n✅ Authentication Service tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAuthService().catch(console.error);
}

export default testAuthService;
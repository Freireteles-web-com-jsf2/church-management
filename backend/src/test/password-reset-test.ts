import PasswordResetService from '../services/PasswordResetService';
import EmailService from '../services/EmailService';
import AuthService from '../services/AuthService';

async function testPasswordResetFlow() {
  console.log('🧪 Testing Password Reset Flow...\n');

  let testsPassed = 0;
  let testsTotal = 0;

  function test(name: string, condition: boolean) {
    testsTotal++;
    if (condition) {
      console.log(`✅ ${name}`);
      testsPassed++;
    } else {
      console.log(`❌ ${name}`);
    }
  }

  // Test 1: Create Reset Token
  console.log('1. Testing Reset Token Creation:');
  const testEmail = 'test@example.com';
  
  // Clear any existing tokens
  if (global.passwordResetTokens) {
    global.passwordResetTokens.clear();
  }
  
  const resetToken = await PasswordResetService.createResetToken(testEmail);
  
  test('Reset token created', resetToken !== null);
  if (resetToken) {
    test('Token has correct email', resetToken.email === testEmail);
    test('Token has expiry date', resetToken.expiresAt > new Date());
    test('Token is not used', resetToken.used === false);
  }

  // Test 2: Validate Reset Token
  console.log('\n2. Testing Token Validation:');
  if (resetToken) {
    const validToken = await PasswordResetService.validateResetToken(resetToken.token);
    test('Valid token is validated', validToken !== null);
    
    const invalidToken = await PasswordResetService.validateResetToken('invalid-token');
    test('Invalid token is rejected', invalidToken === null);
    
    // Mark token as used
    if (global.passwordResetTokens) {
      const tokenData = global.passwordResetTokens.get(resetToken.token);
      if (tokenData) {
        tokenData.used = true;
        global.passwordResetTokens.set(resetToken.token, tokenData);
      }
    }
    
    const usedToken = await PasswordResetService.validateResetToken(resetToken.token);
    test('Used token is rejected', usedToken === null);
    
    // Reset for next test
    if (global.passwordResetTokens) {
      const tokenData = global.passwordResetTokens.get(resetToken.token);
      if (tokenData) {
        tokenData.used = false;
        global.passwordResetTokens.set(resetToken.token, tokenData);
      }
    }
  }

  // Test 3: Reset Password
  console.log('\n3. Testing Password Reset:');
  if (resetToken) {
    const weakPassword = 'weak';
    const strongPassword = 'StrongP@ss123';
    
    const weakPasswordReset = await PasswordResetService.resetPassword(resetToken.token, weakPassword);
    test('Weak password is rejected', weakPasswordReset === false);
    
    const strongPasswordReset = await PasswordResetService.resetPassword(resetToken.token, strongPassword);
    test('Strong password is accepted', strongPasswordReset === true);
    
    const usedTokenReset = await PasswordResetService.resetPassword(resetToken.token, strongPassword);
    test('Used token is rejected for reset', usedTokenReset === false);
  }

  // Test 4: Email Service
  console.log('\n4. Testing Email Service:');
  const resetEmailSent = await EmailService.sendPasswordResetEmail(
    testEmail,
    'test-token-123',
    'Test User'
  );
  test('Reset email can be sent', resetEmailSent === true);
  
  const confirmationEmailSent = await EmailService.sendPasswordChangedEmail(
    testEmail,
    'Test User'
  );
  test('Confirmation email can be sent', confirmationEmailSent === true);

  // Test 5: Token Cleanup
  console.log('\n5. Testing Token Cleanup:');
  // Create an expired token
  if (global.passwordResetTokens) {
    const expiredToken = {
      id: 'expired-id',
      userId: 'user-id',
      email: testEmail,
      token: 'expired-token',
      expiresAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      used: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    };
    global.passwordResetTokens.set('expired-token', expiredToken);
    
    const tokenCountBefore = global.passwordResetTokens.size;
    await PasswordResetService.cleanupExpiredTokens();
    const tokenCountAfter = global.passwordResetTokens.size;
    
    test('Expired tokens are cleaned up', tokenCountBefore > tokenCountAfter);
  } else {
    test('Token map initialized', false);
  }

  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`   Tests passed: ${testsPassed}/${testsTotal}`);
  console.log(`   Success rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);
  
  if (testsPassed === testsTotal) {
    console.log('\n🎉 All tests passed! Password Reset Service is working correctly.');
    return true;
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
    return false;
  }
}

// Export for use in other files
export default testPasswordResetFlow;

// Run tests if this file is executed directly
if (require.main === module) {
  testPasswordResetFlow().catch(console.error);
}
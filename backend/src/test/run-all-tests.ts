import authTest from './auth-test';
import integrationTest from './integration-test';
import passwordResetTest from './password-reset-test';

async function runAllTests() {
  console.log('🧪 Running All Authentication Tests...\n');
  
  try {
    console.log('=== Authentication Service Tests ===');
    await authTest();
    
    console.log('\n\n=== Password Reset Service Tests ===');
    await passwordResetTest();
    
    console.log('\n\n=== Integration Tests ===');
    await integrationTest();
    
    console.log('\n\n🎉 All test suites completed!');
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export default runAllTests;
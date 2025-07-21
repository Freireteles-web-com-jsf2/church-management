// Simple validation script for authentication service
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

console.log('🧪 Validating Authentication Service Dependencies...\n');

// Test bcrypt
console.log('1. Testing bcrypt:');
const testPassword = 'testPassword123!';
bcrypt.hash(testPassword, 12)
  .then(hash => {
    console.log('   ✅ Password hashing works');
    return bcrypt.compare(testPassword, hash);
  })
  .then(isValid => {
    console.log('   ✅ Password verification works:', isValid);
  })
  .catch(err => {
    console.log('   ❌ bcrypt error:', err.message);
  });

// Test JWT
console.log('\n2. Testing JWT:');
try {
  const token = jwt.sign({ userId: 'test123' }, 'secret-key', { expiresIn: '1h' });
  console.log('   ✅ JWT signing works');
  
  const decoded = jwt.verify(token, 'secret-key');
  console.log('   ✅ JWT verification works:', decoded.userId);
} catch (err) {
  console.log('   ❌ JWT error:', err.message);
}

console.log('\n✅ Dependencies validation completed!');
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
const UserManagementService_1 = __importDefault(require("../services/UserManagementService"));
function testUserManagementService() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🧪 Testing User Management Service...\n');
        // Setup global maps for testing
        if (!global.userPasswords) {
            global.userPasswords = new Map();
        }
        if (!global.sessions) {
            global.sessions = new Map();
        }
        // Sample user data
        const mockUserData = {
            nome: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            funcao: 'membro',
            dataNascimento: new Date('1990-01-01'),
            genero: 'Masculino',
            estadoCivil: 'Solteiro',
            telefone: '123456789',
            endereco: 'Test Street',
            numero: '123',
            bairro: 'Test Neighborhood',
            cidade: 'Test City',
            estado: 'TS',
            dataIngresso: new Date(),
            batizado: true
        };
        // Test 1: Create User
        console.log('1. Testing user creation:');
        try {
            const result = yield UserManagementService_1.default.createUser(mockUserData);
            console.log('   ✅ User created successfully:', result.nome);
            console.log('   Email:', result.email);
            console.log('   Function:', result.funcao);
            console.log('   Active:', result.isActive);
        }
        catch (error) {
            console.log('   ❌ Error creating user:', error.message);
        }
        // Test 2: Try to create user with same email (should fail)
        console.log('\n2. Testing duplicate email validation:');
        try {
            yield UserManagementService_1.default.createUser(mockUserData);
            console.log('   ❌ Should have failed with duplicate email');
        }
        catch (error) {
            console.log('   ✅ Correctly rejected duplicate email:', error.message);
        }
        // Test 3: List users
        console.log('\n3. Testing user listing:');
        try {
            const filters = {
                search: 'Test',
                funcao: 'membro',
                page: 1,
                limit: 10
            };
            const users = yield UserManagementService_1.default.listUsers(filters);
            console.log('   ✅ Users listed successfully. Count:', users.length);
            if (users.length > 0) {
                console.log('   First user:', users[0].nome);
            }
        }
        catch (error) {
            console.log('   ❌ Error listing users:', error.message);
        }
        // Test 4: Get user by ID
        console.log('\n4. Testing get user by ID:');
        try {
            // First, let's create a user to get its ID
            const createdUser = yield UserManagementService_1.default.createUser(Object.assign(Object.assign({}, mockUserData), { email: 'test2@example.com' }));
            const user = yield UserManagementService_1.default.getUserById(createdUser.id);
            console.log('   ✅ User retrieved successfully:', user.nome);
            console.log('   Email:', user.email);
        }
        catch (error) {
            console.log('   ❌ Error getting user:', error.message);
        }
        // Test 5: Update user
        console.log('\n5. Testing user update:');
        try {
            // Get a user to update
            const users = yield UserManagementService_1.default.listUsers({ limit: 1 });
            if (users.length > 0) {
                const updateData = {
                    nome: 'Updated Test User',
                    telefone: '987654321'
                };
                const updatedUser = yield UserManagementService_1.default.updateUser(users[0].id, updateData);
                console.log('   ✅ User updated successfully:', updatedUser.nome);
                console.log('   New phone:', updatedUser.telefone);
            }
            else {
                console.log('   ⚠️ No users found to update');
            }
        }
        catch (error) {
            console.log('   ❌ Error updating user:', error.message);
        }
        // Test 6: Reset user password
        console.log('\n6. Testing password reset:');
        try {
            const users = yield UserManagementService_1.default.listUsers({ limit: 1 });
            if (users.length > 0) {
                const newPassword = yield UserManagementService_1.default.resetUserPassword(users[0].id);
                console.log('   ✅ Password reset successfully');
                console.log('   New password length:', newPassword.length);
                console.log('   Password stored in global map:', global.userPasswords.has(users[0].id));
            }
            else {
                console.log('   ⚠️ No users found to reset password');
            }
        }
        catch (error) {
            console.log('   ❌ Error resetting password:', error.message);
        }
        // Test 7: Count users by role
        console.log('\n7. Testing user count by role:');
        try {
            const counts = yield UserManagementService_1.default.countUsersByRole();
            console.log('   ✅ User counts retrieved successfully:');
            Object.entries(counts).forEach(([role, count]) => {
                console.log(`   ${role}: ${count}`);
            });
        }
        catch (error) {
            console.log('   ❌ Error counting users:', error.message);
        }
        // Test 8: Delete user
        console.log('\n8. Testing user deletion:');
        try {
            const users = yield UserManagementService_1.default.listUsers({ limit: 1 });
            if (users.length > 0) {
                yield UserManagementService_1.default.deleteUser(users[0].id);
                console.log('   ✅ User deleted successfully');
                console.log('   Password removed from global map:', !global.userPasswords.has(users[0].id));
            }
            else {
                console.log('   ⚠️ No users found to delete');
            }
        }
        catch (error) {
            console.log('   ❌ Error deleting user:', error.message);
        }
        // Test 9: Try to get deleted user (should fail)
        console.log('\n9. Testing access to deleted user:');
        try {
            yield UserManagementService_1.default.getUserById('deleted-user-id');
            console.log('   ❌ Should have failed to find deleted user');
        }
        catch (error) {
            console.log('   ✅ Correctly failed to find deleted user:', error.message);
        }
        console.log('\n✅ User Management Service tests completed!');
    });
}
// Run tests if this file is executed directly
if (require.main === module) {
    testUserManagementService().catch(console.error);
}
exports.default = testUserManagementService;

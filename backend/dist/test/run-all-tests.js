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
const auth_test_1 = __importDefault(require("./auth-test"));
const integration_test_1 = __importDefault(require("./integration-test"));
const password_reset_test_1 = __importDefault(require("./password-reset-test"));
function runAllTests() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🧪 Running All Authentication Tests...\n');
        try {
            console.log('=== Authentication Service Tests ===');
            yield (0, auth_test_1.default)();
            console.log('\n\n=== Password Reset Service Tests ===');
            yield (0, password_reset_test_1.default)();
            console.log('\n\n=== Integration Tests ===');
            yield (0, integration_test_1.default)();
            console.log('\n\n🎉 All test suites completed!');
        }
        catch (error) {
            console.error('\n❌ Test execution failed:', error);
        }
    });
}
// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}
exports.default = runAllTests;

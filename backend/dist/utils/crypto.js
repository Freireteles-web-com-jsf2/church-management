"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoUtils = void 0;
const crypto_1 = __importDefault(require("crypto"));
class CryptoUtils {
    /**
     * Generate a cryptographically secure random token
     */
    static generateSecureToken(length = 32) {
        return crypto_1.default.randomBytes(length).toString('hex');
    }
    /**
     * Generate a secure random string for passwords or tokens
     */
    static generateRandomString(length = 16) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = crypto_1.default.randomInt(0, charset.length);
            result += charset[randomIndex];
        }
        return result;
    }
    /**
     * Create a hash of sensitive data for comparison
     */
    static createHash(data, algorithm = 'sha256') {
        return crypto_1.default.createHash(algorithm).update(data).digest('hex');
    }
    /**
     * Generate a time-based one-time token (for password reset, etc.)
     */
    static generateTimedToken(userId, timestamp) {
        const time = timestamp || Date.now();
        const data = `${userId}:${time}`;
        return crypto_1.default.createHash('sha256').update(data).digest('hex');
    }
    /**
     * Validate a time-based token
     */
    static validateTimedToken(token, userId, maxAge = 3600000) {
        try {
            const now = Date.now();
            // Try different timestamps within the valid window
            for (let i = 0; i < maxAge; i += 1000) {
                const testTime = now - i;
                const expectedToken = this.generateTimedToken(userId, testTime);
                if (token === expectedToken) {
                    return true;
                }
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
}
exports.CryptoUtils = CryptoUtils;
exports.default = CryptoUtils;

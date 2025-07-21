import crypto from 'crypto';

export class CryptoUtils {
  /**
   * Generate a cryptographically secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure random string for passwords or tokens
   */
  static generateRandomString(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      result += charset[randomIndex];
    }
    
    return result;
  }

  /**
   * Create a hash of sensitive data for comparison
   */
  static createHash(data: string, algorithm: string = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  /**
   * Generate a time-based one-time token (for password reset, etc.)
   */
  static generateTimedToken(userId: string, timestamp?: number): string {
    const time = timestamp || Date.now();
    const data = `${userId}:${time}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Validate a time-based token
   */
  static validateTimedToken(token: string, userId: string, maxAge: number = 3600000): boolean {
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
    } catch (error) {
      return false;
    }
  }
}

export default CryptoUtils;
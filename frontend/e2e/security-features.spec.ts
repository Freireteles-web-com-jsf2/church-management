import { test, expect } from '@playwright/test';

const testUser = {
  email: 'security-test@example.com',
  password: 'TestPassword123',
  name: 'Security Test User'
};

test.describe('Security Features and Monitoring', () => {
  
  test.describe('Brute Force Protection', () => {
    test('should lock account after multiple failed login attempts', async ({ page }) => {
      await page.goto('/login');
      
      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await page.fill('[data-testid="email-input"]', testUser.email);
        await page.fill('[data-testid="password-input"]', 'wrongpassword');
        await page.click('[data-testid="login-button"]');
        
        // Wait for error message
        await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      }
      
      // Next attempt should show account locked message
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('text=Conta temporariamente bloqueada')).toBeVisible();
    });

    test('should show progressive delays between failed attempts', async ({ page }) => {
      await page.goto('/login');
      
      // First failed attempt
      const startTime1 = Date.now();
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      
      // Second failed attempt should have delay
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      
      // Verify delay message is shown
      await expect(page.locator('[data-testid="delay-message"]')).toBeVisible();
      await expect(page.locator('text=Aguarde antes de tentar novamente')).toBeVisible();
    });

    test('should reset failed attempts after successful login', async ({ page }) => {
      await page.goto('/login');
      
      // Make a failed attempt
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      
      // Then successful login
      await page.fill('[data-testid="email-input"]', 'admin@example.com');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123');
      await page.click('[data-testid="login-button"]');
      
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Logout and verify failed attempts were reset for the test user
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');
      
      // Should be able to attempt login normally again
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      
      // Should show normal error, not lockout message
      await expect(page.locator('text=Credenciais inválidas')).toBeVisible();
      await expect(page.locator('text=Conta temporariamente bloqueada')).not.toBeVisible();
    });
  });

  test.describe('Session Security', () => {
    test('should detect and handle concurrent sessions', async ({ page, context }) => {
      // Login in first session
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'admin@example.com');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123');
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Create second browser context (simulate different device)
      const secondContext = await context.browser()?.newContext();
      const secondPage = await secondContext?.newPage();
      
      if (secondPage) {
        // Login with same user in second session
        await secondPage.goto('/login');
        await secondPage.fill('[data-testid="email-input"]', 'admin@example.com');
        await secondPage.fill('[data-testid="password-input"]', 'AdminPassword123');
        await secondPage.click('[data-testid="login-button"]');
        
        // First session should show concurrent session warning
        await page.reload();
        await expect(page.locator('[data-testid="concurrent-session-warning"]')).toBeVisible();
        await expect(page.locator('text=Sessão detectada em outro dispositivo')).toBeVisible();
        
        await secondContext?.close();
      }
    });

    test('should handle session hijacking protection', async ({ page }) => {
      // Login normally
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'admin@example.com');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123');
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Simulate session token manipulation
      await page.evaluate(() => {
        const currentToken = localStorage.getItem('authToken');
        if (currentToken) {
          // Modify token to simulate tampering
          localStorage.setItem('authToken', currentToken + 'tampered');
        }
      });
      
      // Try to access protected resource
      await page.goto('/usuarios');
      
      // Should be redirected to login due to invalid token
      await expect(page).toHaveURL(/.*login/);
      await expect(page.locator('[data-testid="security-warning"]')).toBeVisible();
      await expect(page.locator('text=Sessão inválida detectada')).toBeVisible();
    });

    test('should enforce session timeout', async ({ page }) => {
      // Login with short session timeout (for testing)
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'admin@example.com');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123');
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Simulate session expiry by manipulating timestamp
      await page.evaluate(() => {
        const expiredTime = new Date(Date.now() - 1000 * 60 * 60).toISOString(); // 1 hour ago
        localStorage.setItem('sessionExpiry', expiredTime);
      });
      
      // Try to navigate to protected page
      await page.goto('/usuarios');
      
      // Should show session expired warning and redirect to login
      await expect(page.locator('[data-testid="session-expired-message"]')).toBeVisible();
      await expect(page.locator('text=Sua sessão expirou')).toBeVisible();
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe('Input Validation and Sanitization', () => {
    test('should prevent XSS attacks in form inputs', async ({ page }) => {
      // Register page with XSS attempt
      await page.goto('/register');
      
      const xssPayload = '<script>alert("XSS")</script>';
      
      await page.fill('[data-testid="name-input"]', xssPayload);
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'TestPassword123');
      await page.fill('[data-testid="confirm-password-input"]', 'TestPassword123');
      await page.selectOption('[data-testid="role-select"]', 'membro');
      
      await page.click('[data-testid="register-button"]');
      
      // XSS should be sanitized, no alert should appear
      // Check that the script tag was escaped or removed
      const nameValue = await page.inputValue('[data-testid="name-input"]');
      expect(nameValue).not.toContain('<script>');
    });

    test('should validate email format strictly', async ({ page }) => {
      await page.goto('/login');
      
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@example',
        'test@.com'
      ];
      
      for (const email of invalidEmails) {
        await page.fill('[data-testid="email-input"]', email);
        await page.fill('[data-testid="password-input"]', 'password');
        await page.click('[data-testid="login-button"]');
        
        await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
        await expect(page.locator('text=Email inválido')).toBeVisible();
      }
    });

    test('should enforce password complexity requirements', async ({ page }) => {
      await page.goto('/register');
      
      const weakPasswords = [
        '123',           // Too short
        'password',      // No numbers
        '12345678',      // No letters
        'PASSWORD123',   // No lowercase
        'password123'    // No uppercase (if required)
      ];
      
      for (const password of weakPasswords) {
        await page.fill('[data-testid="name-input"]', 'Test User');
        await page.fill('[data-testid="email-input"]', 'test@example.com');
        await page.fill('[data-testid="password-input"]', password);
        
        // Should show password strength indicator
        await expect(page.locator('[data-testid="password-strength"]')).toBeVisible();
        await expect(page.locator('[data-testid="password-weak"]')).toBeVisible();
        
        await page.click('[data-testid="register-button"]');
        
        // Should show validation error
        await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
      }
    });
  });

  test.describe('Security Audit Logging', () => {
    test('should log security events', async ({ page }) => {
      // Login as admin to access audit logs
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'admin@example.com');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123');
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Navigate to audit logs
      await page.goto('/audit');
      
      // Verify audit log interface is accessible
      await expect(page.locator('[data-testid="audit-log-table"]')).toBeVisible();
      
      // Verify recent login event is logged
      await expect(page.locator('[data-testid="audit-event"]').first()).toBeVisible();
      await expect(page.locator('text=LOGIN_SUCCESS')).toBeVisible();
    });

    test('should track failed login attempts in audit log', async ({ page }) => {
      // Make a failed login attempt
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      
      // Login as admin to check audit logs
      await page.fill('[data-testid="email-input"]', 'admin@example.com');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123');
      await page.click('[data-testid="login-button"]');
      
      await page.goto('/audit');
      
      // Verify failed login attempt is logged
      await expect(page.locator('text=LOGIN_FAILED')).toBeVisible();
      await expect(page.locator('text=test@example.com')).toBeVisible();
    });

    test('should log permission violations', async ({ page }) => {
      // Login as regular user
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'membro@example.com');
      await page.fill('[data-testid="password-input"]', 'MembroPassword123');
      await page.click('[data-testid="login-button"]');
      
      // Try to access restricted page
      await page.goto('/usuarios');
      await expect(page).toHaveURL(/.*access-denied/);
      
      // Logout and login as admin
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');
      
      await page.fill('[data-testid="email-input"]', 'admin@example.com');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123');
      await page.click('[data-testid="login-button"]');
      
      // Check audit logs for permission violation
      await page.goto('/audit');
      await expect(page.locator('text=ACCESS_DENIED')).toBeVisible();
      await expect(page.locator('text=membro@example.com')).toBeVisible();
    });
  });

  test.describe('Data Protection', () => {
    test('should not expose sensitive data in client-side storage', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'admin@example.com');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123');
      await page.click('[data-testid="login-button"]');
      
      // Check that password is not stored in localStorage or sessionStorage
      const localStorage = await page.evaluate(() => {
        return JSON.stringify(window.localStorage);
      });
      
      const sessionStorage = await page.evaluate(() => {
        return JSON.stringify(window.sessionStorage);
      });
      
      expect(localStorage).not.toContain('AdminPassword123');
      expect(sessionStorage).not.toContain('AdminPassword123');
      expect(localStorage).not.toContain('password');
      expect(sessionStorage).not.toContain('password');
    });

    test('should mask sensitive data in forms', async ({ page }) => {
      await page.goto('/login');
      
      // Password field should be masked
      const passwordInput = page.locator('[data-testid="password-input"]');
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Fill password and verify it's masked
      await passwordInput.fill('TestPassword123');
      const inputType = await passwordInput.getAttribute('type');
      expect(inputType).toBe('password');
    });

    test('should clear sensitive data on logout', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'admin@example.com');
      await page.fill('[data-testid="password-input"]', 'AdminPassword123');
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Verify user data is stored
      const userDataBefore = await page.evaluate(() => {
        return localStorage.getItem('userData');
      });
      expect(userDataBefore).toBeTruthy();
      
      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');
      
      // Verify sensitive data is cleared
      const userDataAfter = await page.evaluate(() => {
        return localStorage.getItem('userData');
      });
      expect(userDataAfter).toBeFalsy();
      
      const authTokenAfter = await page.evaluate(() => {
        return localStorage.getItem('authToken');
      });
      expect(authTokenAfter).toBeFalsy();
    });
  });
});
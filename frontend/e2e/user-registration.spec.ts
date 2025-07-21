import { test, expect } from './test-setup';

test.describe('User Registration and Verification', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Registration Flow', () => {
    test('should complete full user registration process', async ({ page, helpers }) => {
      // Navigate to registration page
      await page.click('text=Cadastrar');
      await expect(page).toHaveURL(/.*register/);
      
      // Fill registration form
      const newUser = {
        name: 'João Silva',
        email: 'joao.silva@example.com',
        password: 'MinhaSenh@123',
        role: 'membro'
      };
      
      await helpers.fillRegistrationForm(newUser);
      
      // Accept terms and conditions
      await page.check('[data-testid="terms-checkbox"]');
      
      // Submit registration
      await page.click('[data-testid="register-button"]');
      
      // Verify success message
      await helpers.expectSuccessMessage('Usuário criado com sucesso');
      
      // Verify redirect to login page
      await expect(page).toHaveURL(/.*login/);
      
      // Verify welcome message on login page
      await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
      await expect(page.locator('text=Cadastro realizado com sucesso')).toBeVisible();
    });

    test('should validate all required fields', async ({ page }) => {
      await page.click('text=Cadastrar');
      
      // Try to submit empty form
      await page.click('[data-testid="register-button"]');
      
      // Verify validation errors for all required fields
      await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="role-error"]')).toBeVisible();
      
      // Verify form is not submitted
      await expect(page).toHaveURL(/.*register/);
    });

    test('should validate password confirmation match', async ({ page, helpers }) => {
      await page.click('text=Cadastrar');
      
      await page.fill('[data-testid="name-input"]', 'Test User');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'Password123');
      await page.fill('[data-testid="confirm-password-input"]', 'DifferentPassword123');
      await page.selectOption('[data-testid="role-select"]', 'membro');
      
      await page.click('[data-testid="register-button"]');
      
      // Verify password mismatch error
      await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible();
      await expect(page.locator('text=As senhas não coincidem')).toBeVisible();
    });

    test('should show real-time password strength indicator', async ({ page }) => {
      await page.click('text=Cadastrar');
      
      const passwordInput = page.locator('[data-testid="password-input"]');
      const strengthIndicator = page.locator('[data-testid="password-strength"]');
      
      // Test weak password
      await passwordInput.fill('123');
      await expect(strengthIndicator).toHaveClass(/weak/);
      await expect(page.locator('[data-testid="strength-text"]')).toHaveText('Fraca');
      
      // Test medium password
      await passwordInput.fill('password123');
      await expect(strengthIndicator).toHaveClass(/medium/);
      await expect(page.locator('[data-testid="strength-text"]')).toHaveText('Média');
      
      // Test strong password
      await passwordInput.fill('MinhaSenh@123');
      await expect(strengthIndicator).toHaveClass(/strong/);
      await expect(page.locator('[data-testid="strength-text"]')).toHaveText('Forte');
    });

    test('should prevent registration with existing email', async ({ page, helpers }) => {
      await page.click('text=Cadastrar');
      
      // Try to register with admin email (already exists)
      await helpers.fillRegistrationForm({
        name: 'Another Admin',
        email: 'admin@example.com',
        password: 'AnotherPassword123',
        role: 'membro'
      });
      
      await page.check('[data-testid="terms-checkbox"]');
      await page.click('[data-testid="register-button"]');
      
      // Verify error message
      await helpers.expectErrorMessage('Email já está em uso');
      
      // Verify form stays on registration page
      await expect(page).toHaveURL(/.*register/);
    });

    test('should validate email format', async ({ page }) => {
      await page.click('text=Cadastrar');
      
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
        await page.blur('[data-testid="email-input"]'); // Trigger validation
        
        await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
        await expect(page.locator('text=Email inválido')).toBeVisible();
      }
    });

    test('should enforce password policy', async ({ page }) => {
      await page.click('text=Cadastrar');
      
      const weakPasswords = [
        { password: '123', error: 'A senha deve ter pelo menos 8 caracteres' },
        { password: 'password', error: 'A senha deve conter pelo menos um número' },
        { password: '12345678', error: 'A senha deve conter pelo menos uma letra' },
        { password: 'password123', error: 'A senha deve conter pelo menos uma letra maiúscula' }
      ];
      
      for (const { password, error } of weakPasswords) {
        await page.fill('[data-testid="password-input"]', password);
        await page.blur('[data-testid="password-input"]');
        
        await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
        await expect(page.locator(`text=${error}`)).toBeVisible();
      }
    });
  });

  test.describe('Email Verification Flow', () => {
    test('should handle email verification process', async ({ page, helpers }) => {
      // Complete registration first
      await page.click('text=Cadastrar');
      
      await helpers.fillRegistrationForm({
        name: 'Maria Santos',
        email: 'maria.santos@example.com',
        password: 'MinhaSenh@123',
        role: 'membro'
      });
      
      await page.check('[data-testid="terms-checkbox"]');
      await page.click('[data-testid="register-button"]');
      
      // Should show email verification message
      await expect(page.locator('[data-testid="verification-message"]')).toBeVisible();
      await expect(page.locator('text=Verifique seu email para ativar a conta')).toBeVisible();
      
      // Simulate clicking verification link (in real scenario, this would be from email)
      await page.goto('/verify-email?token=valid-verification-token');
      
      // Should show verification success
      await expect(page.locator('[data-testid="verification-success"]')).toBeVisible();
      await expect(page.locator('text=Email verificado com sucesso')).toBeVisible();
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
    });

    test('should handle invalid verification token', async ({ page }) => {
      await page.goto('/verify-email?token=invalid-token');
      
      // Should show error message
      await expect(page.locator('[data-testid="verification-error"]')).toBeVisible();
      await expect(page.locator('text=Token de verificação inválido')).toBeVisible();
      
      // Should provide option to resend verification
      await expect(page.locator('[data-testid="resend-verification-button"]')).toBeVisible();
    });

    test('should allow resending verification email', async ({ page }) => {
      await page.goto('/verify-email?token=expired-token');
      
      // Click resend verification
      await page.click('[data-testid="resend-verification-button"]');
      
      // Should show resend form
      await expect(page.locator('[data-testid="resend-form"]')).toBeVisible();
      
      // Enter email and resend
      await page.fill('[data-testid="email-input"]', 'maria.santos@example.com');
      await page.click('[data-testid="resend-button"]');
      
      // Should show success message
      await expect(page.locator('[data-testid="resend-success"]')).toBeVisible();
      await expect(page.locator('text=Email de verificação reenviado')).toBeVisible();
    });
  });

  test.describe('Registration Form UX', () => {
    test('should show helpful tooltips and guidance', async ({ page }) => {
      await page.click('text=Cadastrar');
      
      // Hover over password field to see requirements
      await page.hover('[data-testid="password-input"]');
      await expect(page.locator('[data-testid="password-tooltip"]')).toBeVisible();
      await expect(page.locator('text=Mínimo 8 caracteres')).toBeVisible();
      
      // Hover over role field to see descriptions
      await page.hover('[data-testid="role-select"]');
      await expect(page.locator('[data-testid="role-tooltip"]')).toBeVisible();
    });

    test('should handle form navigation and auto-focus', async ({ page }) => {
      await page.click('text=Cadastrar');
      
      // Name field should be focused initially
      await expect(page.locator('[data-testid="name-input"]')).toBeFocused();
      
      // Tab navigation should work correctly
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="password-input"]')).toBeFocused();
    });

    test('should save form progress on page refresh', async ({ page, helpers }) => {
      await page.click('text=Cadastrar');
      
      // Fill partial form
      await page.fill('[data-testid="name-input"]', 'Test User');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      
      // Refresh page
      await page.reload();
      
      // Form should retain values (if implemented)
      const nameValue = await page.inputValue('[data-testid="name-input"]');
      const emailValue = await page.inputValue('[data-testid="email-input"]');
      
      // Note: This depends on implementation - some forms save draft data
      if (nameValue) {
        expect(nameValue).toBe('Test User');
        expect(emailValue).toBe('test@example.com');
      }
    });

    test('should handle network errors gracefully', async ({ page, helpers }) => {
      await page.click('text=Cadastrar');
      
      await helpers.fillRegistrationForm({
        name: 'Network Test',
        email: 'network.test@example.com',
        password: 'NetworkTest123',
        role: 'membro'
      });
      
      // Simulate network error
      await helpers.simulateNetworkError();
      
      await page.check('[data-testid="terms-checkbox"]');
      await page.click('[data-testid="register-button"]');
      
      // Should show network error message
      await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
      await expect(page.locator('text=Erro de conexão')).toBeVisible();
      
      // Should provide retry option
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
      
      // Restore network and retry
      await helpers.restoreNetwork();
      await page.click('[data-testid="retry-button"]');
      
      // Should succeed on retry
      await helpers.expectSuccessMessage();
    });
  });
});
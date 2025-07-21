import { test, expect } from '@playwright/test';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123',
  name: 'Test User'
};

const adminUser = {
  email: 'admin@example.com',
  password: 'AdminPassword123',
  name: 'Admin User'
};

test.describe('Authentication User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test.describe('User Registration and Verification', () => {
    test('should complete user registration flow', async ({ page }) => {
      // Navigate to registration page
      await page.click('text=Cadastrar');
      
      // Fill registration form
      await page.fill('[data-testid="name-input"]', testUser.name);
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', testUser.password);
      await page.fill('[data-testid="confirm-password-input"]', testUser.password);
      
      // Select user role
      await page.selectOption('[data-testid="role-select"]', 'membro');
      
      // Submit registration
      await page.click('[data-testid="register-button"]');
      
      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('text=Usuário criado com sucesso')).toBeVisible();
      
      // Verify redirect to login page
      await expect(page).toHaveURL(/.*login/);
    });

    test('should validate password requirements during registration', async ({ page }) => {
      await page.click('text=Cadastrar');
      
      // Try weak password
      await page.fill('[data-testid="name-input"]', testUser.name);
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', '123');
      
      // Verify password validation message
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
      await expect(page.locator('text=A senha deve ter pelo menos 8 caracteres')).toBeVisible();
    });

    test('should prevent duplicate email registration', async ({ page }) => {
      await page.click('text=Cadastrar');
      
      // Try to register with existing email
      await page.fill('[data-testid="name-input"]', 'Another User');
      await page.fill('[data-testid="email-input"]', adminUser.email);
      await page.fill('[data-testid="password-input"]', testUser.password);
      await page.fill('[data-testid="confirm-password-input"]', testUser.password);
      await page.selectOption('[data-testid="role-select"]', 'membro');
      
      await page.click('[data-testid="register-button"]');
      
      // Verify error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('text=Email já está em uso')).toBeVisible();
    });
  });

  test.describe('Password Recovery and Reset', () => {
    test('should complete password recovery flow', async ({ page }) => {
      // Navigate to login page
      await page.goto('/login');
      
      // Click forgot password link
      await page.click('[data-testid="forgot-password-link"]');
      
      // Verify we're on forgot password page
      await expect(page).toHaveURL(/.*forgot-password/);
      
      // Enter email for password recovery
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.click('[data-testid="send-reset-button"]');
      
      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('text=Email de recuperação enviado')).toBeVisible();
    });

    test('should handle invalid email in password recovery', async ({ page }) => {
      await page.goto('/forgot-password');
      
      // Enter invalid email
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.click('[data-testid="send-reset-button"]');
      
      // Verify validation error
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('text=Email inválido')).toBeVisible();
    });

    test('should complete password reset with valid token', async ({ page }) => {
      // Simulate navigating to reset password page with token
      await page.goto('/reset-password?token=valid-reset-token');
      
      // Fill new password
      await page.fill('[data-testid="new-password-input"]', 'NewPassword123');
      await page.fill('[data-testid="confirm-password-input"]', 'NewPassword123');
      
      // Submit password reset
      await page.click('[data-testid="reset-password-button"]');
      
      // Verify success and redirect to login
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page).toHaveURL(/.*login/);
    });

    test('should reject invalid or expired reset token', async ({ page }) => {
      await page.goto('/reset-password?token=invalid-token');
      
      // Verify error message for invalid token
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('text=Token inválido ou expirado')).toBeVisible();
    });
  });

  test.describe('Login and Session Management', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Fill login form
      await page.fill('[data-testid="email-input"]', adminUser.email);
      await page.fill('[data-testid="password-input"]', adminUser.password);
      
      // Submit login
      await page.click('[data-testid="login-button"]');
      
      // Verify successful login and redirect to dashboard
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator(`text=${adminUser.name}`)).toBeVisible();
    });

    test('should handle invalid login credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Fill with invalid credentials
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      
      await page.click('[data-testid="login-button"]');
      
      // Verify error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('text=Credenciais inválidas')).toBeVisible();
    });

    test('should remember user session with "Remember Me"', async ({ page }) => {
      await page.goto('/login');
      
      // Login with remember me checked
      await page.fill('[data-testid="email-input"]', adminUser.email);
      await page.fill('[data-testid="password-input"]', adminUser.password);
      await page.check('[data-testid="remember-me-checkbox"]');
      
      await page.click('[data-testid="login-button"]');
      
      // Verify login success
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Simulate browser restart by reloading page
      await page.reload();
      
      // Verify user is still logged in
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', adminUser.email);
      await page.fill('[data-testid="password-input"]', adminUser.password);
      await page.click('[data-testid="login-button"]');
      
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');
      
      // Verify redirect to login page
      await expect(page).toHaveURL(/.*login/);
      
      // Verify user cannot access protected pages
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/.*login/);
    });

    test('should handle session expiry', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', adminUser.email);
      await page.fill('[data-testid="password-input"]', adminUser.password);
      await page.click('[data-testid="login-button"]');
      
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Simulate session expiry by clearing storage
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      // Try to navigate to protected page
      await page.goto('/dashboard');
      
      // Should be redirected to login
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe('User Profile Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each profile test
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', adminUser.email);
      await page.fill('[data-testid="password-input"]', adminUser.password);
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should view and edit user profile', async ({ page }) => {
      // Navigate to profile page
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="profile-link"]');
      
      await expect(page).toHaveURL(/.*perfil/);
      
      // Verify profile information is displayed
      await expect(page.locator('[data-testid="profile-name"]')).toHaveValue(adminUser.name);
      await expect(page.locator('[data-testid="profile-email"]')).toHaveValue(adminUser.email);
      
      // Edit profile information
      await page.fill('[data-testid="profile-name"]', 'Updated Admin Name');
      await page.click('[data-testid="save-profile-button"]');
      
      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('text=Perfil atualizado com sucesso')).toBeVisible();
    });

    test('should change password successfully', async ({ page }) => {
      await page.goto('/perfil');
      
      // Navigate to password change section
      await page.click('[data-testid="change-password-tab"]');
      
      // Fill password change form
      await page.fill('[data-testid="current-password-input"]', adminUser.password);
      await page.fill('[data-testid="new-password-input"]', 'NewAdminPassword123');
      await page.fill('[data-testid="confirm-new-password-input"]', 'NewAdminPassword123');
      
      await page.click('[data-testid="change-password-button"]');
      
      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('text=Senha alterada com sucesso')).toBeVisible();
    });

    test('should validate current password when changing', async ({ page }) => {
      await page.goto('/perfil');
      await page.click('[data-testid="change-password-tab"]');
      
      // Try with wrong current password
      await page.fill('[data-testid="current-password-input"]', 'wrongpassword');
      await page.fill('[data-testid="new-password-input"]', 'NewPassword123');
      await page.fill('[data-testid="confirm-new-password-input"]', 'NewPassword123');
      
      await page.click('[data-testid="change-password-button"]');
      
      // Verify error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('text=Senha atual incorreta')).toBeVisible();
    });
  });
});
import { test, expect } from '@playwright/test';

// Test users with different roles
const users = {
  admin: {
    email: 'admin@example.com',
    password: 'AdminPassword123',
    name: 'Admin User',
    role: 'admin'
  },
  pastor: {
    email: 'pastor@example.com',
    password: 'PastorPassword123',
    name: 'Pastor User',
    role: 'pastor'
  },
  lider: {
    email: 'lider@example.com',
    password: 'LiderPassword123',
    name: 'Líder User',
    role: 'lider'
  },
  tesoureiro: {
    email: 'tesoureiro@example.com',
    password: 'TesoureiroPassword123',
    name: 'Tesoureiro User',
    role: 'tesoureiro'
  },
  voluntario: {
    email: 'voluntario@example.com',
    password: 'VoluntarioPassword123',
    name: 'Voluntário User',
    role: 'voluntario'
  },
  membro: {
    email: 'membro@example.com',
    password: 'MembroPassword123',
    name: 'Membro User',
    role: 'membro'
  }
};

test.describe('Role-Based Access Control', () => {
  
  // Helper function to login with specific user
  async function loginAs(page, userType: keyof typeof users) {
    const user = users[userType];
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/.*dashboard/);
  }

  test.describe('Admin Access Control', () => {
    test('admin should have access to all features', async ({ page }) => {
      await loginAs(page, 'admin');
      
      // Verify admin can access user management
      await page.click('[data-testid="sidebar-users"]');
      await expect(page).toHaveURL(/.*usuarios/);
      await expect(page.locator('[data-testid="user-list"]')).toBeVisible();
      
      // Verify admin can access financial management
      await page.click('[data-testid="sidebar-financeiro"]');
      await expect(page).toHaveURL(/.*financeiro/);
      await expect(page.locator('[data-testid="financial-dashboard"]')).toBeVisible();
      
      // Verify admin can access all configuration options
      await page.click('[data-testid="sidebar-configuracoes"]');
      await expect(page).toHaveURL(/.*configuracoes/);
      await expect(page.locator('[data-testid="system-settings"]')).toBeVisible();
      
      // Verify admin can create/edit/delete users
      await page.goto('/usuarios');
      await expect(page.locator('[data-testid="create-user-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="edit-user-button"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="delete-user-button"]').first()).toBeVisible();
    });

    test('admin should see admin-specific menu items', async ({ page }) => {
      await loginAs(page, 'admin');
      
      // Verify admin-specific navigation items are visible
      await expect(page.locator('[data-testid="sidebar-users"]')).toBeVisible();
      await expect(page.locator('[data-testid="sidebar-configuracoes"]')).toBeVisible();
      await expect(page.locator('[data-testid="sidebar-audit"]')).toBeVisible();
    });
  });

  test.describe('Pastor Access Control', () => {
    test('pastor should have access to pastoral features', async ({ page }) => {
      await loginAs(page, 'pastor');
      
      // Verify pastor can access people management
      await page.click('[data-testid="sidebar-pessoas"]');
      await expect(page).toHaveURL(/.*pessoas/);
      await expect(page.locator('[data-testid="people-list"]')).toBeVisible();
      
      // Verify pastor can access groups
      await page.click('[data-testid="sidebar-grupos"]');
      await expect(page).toHaveURL(/.*grupos/);
      await expect(page.locator('[data-testid="groups-list"]')).toBeVisible();
      
      // Verify pastor can access agenda
      await page.click('[data-testid="sidebar-agenda"]');
      await expect(page).toHaveURL(/.*agenda/);
      await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible();
    });

    test('pastor should not have access to admin features', async ({ page }) => {
      await loginAs(page, 'pastor');
      
      // Verify pastor cannot see user management
      await expect(page.locator('[data-testid="sidebar-users"]')).not.toBeVisible();
      
      // Verify direct access to user management is blocked
      await page.goto('/usuarios');
      await expect(page).toHaveURL(/.*access-denied/);
      await expect(page.locator('[data-testid="access-denied-message"]')).toBeVisible();
    });
  });

  test.describe('Tesoureiro Access Control', () => {
    test('tesoureiro should have access to financial features', async ({ page }) => {
      await loginAs(page, 'tesoureiro');
      
      // Verify tesoureiro can access financial management
      await page.click('[data-testid="sidebar-financeiro"]');
      await expect(page).toHaveURL(/.*financeiro/);
      await expect(page.locator('[data-testid="financial-dashboard"]')).toBeVisible();
      
      // Verify tesoureiro can create financial entries
      await expect(page.locator('[data-testid="create-transaction-button"]')).toBeVisible();
      
      // Verify tesoureiro can access reports
      await page.click('[data-testid="financial-reports-tab"]');
      await expect(page.locator('[data-testid="financial-reports"]')).toBeVisible();
    });

    test('tesoureiro should not access non-financial features', async ({ page }) => {
      await loginAs(page, 'tesoureiro');
      
      // Verify tesoureiro cannot access user management
      await expect(page.locator('[data-testid="sidebar-users"]')).not.toBeVisible();
      
      // Verify limited access to people management (read-only)
      await page.goto('/pessoas');
      await expect(page.locator('[data-testid="people-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="create-person-button"]')).not.toBeVisible();
    });
  });

  test.describe('Líder Access Control', () => {
    test('lider should have access to group management', async ({ page }) => {
      await loginAs(page, 'lider');
      
      // Verify líder can access groups
      await page.click('[data-testid="sidebar-grupos"]');
      await expect(page).toHaveURL(/.*grupos/);
      await expect(page.locator('[data-testid="groups-list"]')).toBeVisible();
      
      // Verify líder can manage their groups
      await expect(page.locator('[data-testid="my-groups-section"]')).toBeVisible();
      
      // Verify líder can access people in their groups
      await page.click('[data-testid="sidebar-pessoas"]');
      await expect(page).toHaveURL(/.*pessoas/);
      await expect(page.locator('[data-testid="people-list"]')).toBeVisible();
    });

    test('lider should have limited financial access', async ({ page }) => {
      await loginAs(page, 'lider');
      
      // Verify líder cannot access full financial management
      await expect(page.locator('[data-testid="sidebar-financeiro"]')).not.toBeVisible();
      
      // Direct access should be blocked
      await page.goto('/financeiro');
      await expect(page).toHaveURL(/.*access-denied/);
    });
  });

  test.describe('Voluntário Access Control', () => {
    test('voluntario should have limited access', async ({ page }) => {
      await loginAs(page, 'voluntario');
      
      // Verify voluntário can access basic features
      await page.click('[data-testid="sidebar-agenda"]');
      await expect(page).toHaveURL(/.*agenda/);
      await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible();
      
      // Verify voluntário can access mural
      await page.click('[data-testid="sidebar-mural"]');
      await expect(page).toHaveURL(/.*mural/);
      await expect(page.locator('[data-testid="message-board"]')).toBeVisible();
    });

    test('voluntario should not access management features', async ({ page }) => {
      await loginAs(page, 'voluntario');
      
      // Verify no access to user management
      await expect(page.locator('[data-testid="sidebar-users"]')).not.toBeVisible();
      
      // Verify no access to financial management
      await expect(page.locator('[data-testid="sidebar-financeiro"]')).not.toBeVisible();
      
      // Verify limited people access (read-only)
      await page.goto('/pessoas');
      await expect(page.locator('[data-testid="people-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="create-person-button"]')).not.toBeVisible();
    });
  });

  test.describe('Membro Access Control', () => {
    test('membro should have minimal access', async ({ page }) => {
      await loginAs(page, 'membro');
      
      // Verify membro can access their profile
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="profile-link"]');
      await expect(page).toHaveURL(/.*perfil/);
      
      // Verify membro can access mural
      await page.click('[data-testid="sidebar-mural"]');
      await expect(page).toHaveURL(/.*mural/);
      await expect(page.locator('[data-testid="message-board"]')).toBeVisible();
      
      // Verify membro can view agenda (read-only)
      await page.click('[data-testid="sidebar-agenda"]');
      await expect(page).toHaveURL(/.*agenda/);
      await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible();
      await expect(page.locator('[data-testid="create-event-button"]')).not.toBeVisible();
    });

    test('membro should not access any management features', async ({ page }) => {
      await loginAs(page, 'membro');
      
      // Verify no access to management features
      await expect(page.locator('[data-testid="sidebar-users"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="sidebar-financeiro"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="sidebar-configuracoes"]')).not.toBeVisible();
      
      // Verify direct access is blocked
      await page.goto('/usuarios');
      await expect(page).toHaveURL(/.*access-denied/);
      
      await page.goto('/financeiro');
      await expect(page).toHaveURL(/.*access-denied/);
      
      await page.goto('/configuracoes');
      await expect(page).toHaveURL(/.*access-denied/);
    });
  });

  test.describe('Cross-Role Permission Validation', () => {
    test('should prevent privilege escalation', async ({ page }) => {
      await loginAs(page, 'membro');
      
      // Try to access admin API endpoints directly
      const response = await page.request.get('/api/users');
      expect(response.status()).toBe(403);
      
      // Try to access financial API endpoints
      const finResponse = await page.request.get('/api/financeiro');
      expect(finResponse.status()).toBe(403);
    });

    test('should validate permissions on component level', async ({ page }) => {
      await loginAs(page, 'voluntario');
      
      // Navigate to a page where voluntário has read access
      await page.goto('/pessoas');
      
      // Verify action buttons are not visible
      await expect(page.locator('[data-testid="create-person-button"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="edit-person-button"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="delete-person-button"]')).not.toBeVisible();
      
      // But list should be visible
      await expect(page.locator('[data-testid="people-list"]')).toBeVisible();
    });

    test('should handle role changes dynamically', async ({ page }) => {
      await loginAs(page, 'admin');
      
      // Admin changes a user's role
      await page.goto('/usuarios');
      await page.click('[data-testid="edit-user-button"]').first();
      
      // Change role from membro to líder
      await page.selectOption('[data-testid="user-role-select"]', 'lider');
      await page.click('[data-testid="save-user-button"]');
      
      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      
      // The user should see updated permissions on next login
      // (This would require the changed user to login again to test fully)
    });
  });

  test.describe('Access Denied Handling', () => {
    test('should show appropriate access denied page', async ({ page }) => {
      await loginAs(page, 'membro');
      
      // Try to access restricted page
      await page.goto('/usuarios');
      
      // Verify access denied page
      await expect(page).toHaveURL(/.*access-denied/);
      await expect(page.locator('[data-testid="access-denied-title"]')).toBeVisible();
      await expect(page.locator('text=Acesso Negado')).toBeVisible();
      await expect(page.locator('text=Você não tem permissão para acessar esta página')).toBeVisible();
      
      // Verify back to dashboard link
      await expect(page.locator('[data-testid="back-to-dashboard-link"]')).toBeVisible();
      await page.click('[data-testid="back-to-dashboard-link"]');
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should redirect unauthorized API requests', async ({ page }) => {
      await loginAs(page, 'membro');
      
      // Try to make unauthorized API request
      const response = await page.request.post('/api/users', {
        data: {
          name: 'Test User',
          email: 'test@example.com',
          role: 'admin'
        }
      });
      
      // Should return 403 Forbidden
      expect(response.status()).toBe(403);
    });
  });
});
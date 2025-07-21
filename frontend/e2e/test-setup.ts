import { test as base, expect } from '@playwright/test';

// Test data for different user roles
export const testUsers = {
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

// Helper functions for common test operations
export class TestHelpers {
  constructor(private page: any) {}

  async loginAs(userType: keyof typeof testUsers) {
    const user = testUsers[userType];
    await this.page.goto('/login');
    await this.page.fill('[data-testid="email-input"]', user.email);
    await this.page.fill('[data-testid="password-input"]', user.password);
    await this.page.click('[data-testid="login-button"]');
    await expect(this.page).toHaveURL(/.*dashboard/);
    return user;
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    await expect(this.page).toHaveURL(/.*login/);
  }

  async waitForLoadingToComplete() {
    // Wait for any loading spinners to disappear
    await this.page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden', timeout: 10000 });
  }

  async fillRegistrationForm(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    await this.page.fill('[data-testid="name-input"]', userData.name);
    await this.page.fill('[data-testid="email-input"]', userData.email);
    await this.page.fill('[data-testid="password-input"]', userData.password);
    await this.page.fill('[data-testid="confirm-password-input"]', userData.password);
    await this.page.selectOption('[data-testid="role-select"]', userData.role);
  }

  async expectSuccessMessage(message?: string) {
    await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible();
    if (message) {
      await expect(this.page.locator(`text=${message}`)).toBeVisible();
    }
  }

  async expectErrorMessage(message?: string) {
    await expect(this.page.locator('[data-testid="error-message"]')).toBeVisible();
    if (message) {
      await expect(this.page.locator(`text=${message}`)).toBeVisible();
    }
  }

  async clearBrowserData() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  async simulateNetworkError() {
    await this.page.route('**/api/**', route => {
      route.abort('failed');
    });
  }

  async restoreNetwork() {
    await this.page.unroute('**/api/**');
  }
}

// Extend the base test with our helpers
export const test = base.extend<{ helpers: TestHelpers }>({
  helpers: async ({ page }, use) => {
    const helpers = new TestHelpers(page);
    await use(helpers);
  },
});

export { expect } from '@playwright/test';
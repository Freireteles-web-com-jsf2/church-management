import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for backend to be ready
    console.log('Waiting for backend to be ready...');
    await page.goto('http://localhost:3001/api/health', { timeout: 30000 });
    
    // Wait for frontend to be ready
    console.log('Waiting for frontend to be ready...');
    await page.goto('http://localhost:5173', { timeout: 30000 });
    
    // Initialize test data if needed
    console.log('Initializing test data...');
    await initializeTestData(page);
    
    console.log('Global setup completed successfully');
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function initializeTestData(page: any) {
  // Create test users if they don't exist
  const testUsers = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'AdminPassword123',
      role: 'admin'
    },
    {
      name: 'Pastor User',
      email: 'pastor@example.com',
      password: 'PastorPassword123',
      role: 'pastor'
    },
    {
      name: 'Líder User',
      email: 'lider@example.com',
      password: 'LiderPassword123',
      role: 'lider'
    },
    {
      name: 'Tesoureiro User',
      email: 'tesoureiro@example.com',
      password: 'TesoureiroPassword123',
      role: 'tesoureiro'
    },
    {
      name: 'Voluntário User',
      email: 'voluntario@example.com',
      password: 'VoluntarioPassword123',
      role: 'voluntario'
    },
    {
      name: 'Membro User',
      email: 'membro@example.com',
      password: 'MembroPassword123',
      role: 'membro'
    }
  ];

  for (const user of testUsers) {
    try {
      // Try to create user via API
      const response = await page.request.post('http://localhost:3001/api/auth/register', {
        data: user
      });
      
      if (response.ok()) {
        console.log(`Created test user: ${user.email}`);
      } else if (response.status() === 409) {
        console.log(`Test user already exists: ${user.email}`);
      } else {
        console.warn(`Failed to create test user ${user.email}:`, response.status());
      }
    } catch (error) {
      console.warn(`Error creating test user ${user.email}:`, error);
    }
  }
}

export default globalSetup;
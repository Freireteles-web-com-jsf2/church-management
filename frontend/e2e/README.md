# End-to-End Testing Documentation

## Overview

This directory contains comprehensive end-to-end tests for the Local Authentication System using Playwright. The tests cover user journeys, role-based access control, and security features.

## Test Structure

### Test Files

- **`auth-user-journeys.spec.ts`** - Core authentication flows (login, logout, session management, profile management)
- **`role-based-access.spec.ts`** - Role-based access control testing for all user roles
- **`security-features.spec.ts`** - Security features including brute force protection, session security, and audit logging
- **`user-registration.spec.ts`** - User registration and email verification flows

### Support Files

- **`test-setup.ts`** - Test utilities, helpers, and common test data
- **`global-setup.ts`** - Global test setup for initializing test data and ensuring services are ready
- **`README.md`** - This documentation file

## Test Coverage

### User Journeys Tested

1. **User Registration and Verification**
   - Complete registration flow with validation
   - Email verification process
   - Password strength validation
   - Form UX and error handling

2. **Password Recovery and Reset**
   - Forgot password flow
   - Password reset with valid/invalid tokens
   - Email validation and error handling

3. **Login and Session Management**
   - Successful login with valid credentials
   - Invalid credential handling
   - "Remember Me" functionality
   - Session expiry and timeout
   - Logout process

4. **User Profile Management**
   - Profile viewing and editing
   - Password change functionality
   - Profile validation

### Role-Based Access Control

Tests verify proper access control for all user roles:

- **Admin** - Full system access
- **Pastor** - Pastoral features (people, groups, agenda)
- **Tesoureiro** - Financial management access
- **Líder** - Group management and limited people access
- **Voluntário** - Basic features (agenda, mural)
- **Membro** - Minimal access (profile, mural, read-only agenda)

### Security Features

1. **Brute Force Protection**
   - Account lockout after failed attempts
   - Progressive delays between attempts
   - Failed attempt reset after successful login

2. **Session Security**
   - Concurrent session detection
   - Session hijacking protection
   - Session timeout enforcement

3. **Input Validation**
   - XSS prevention
   - Email format validation
   - Password complexity requirements

4. **Security Audit Logging**
   - Security event logging
   - Failed login attempt tracking
   - Permission violation logging

5. **Data Protection**
   - Sensitive data handling
   - Data masking in forms
   - Secure data cleanup on logout

## Running Tests

### Prerequisites

1. Ensure both frontend and backend servers are configured to run
2. Database should be set up with test data
3. Email service should be configured (can be mocked for testing)

### Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests step by step
npm run test:e2e:debug

# Run specific test file
npx playwright test auth-user-journeys.spec.ts

# Run tests for specific browser
npx playwright test --project=chromium
```

### Test Data

The tests use predefined test users with different roles:

- `admin@example.com` / `AdminPassword123` (Admin)
- `pastor@example.com` / `PastorPassword123` (Pastor)
- `lider@example.com` / `LiderPassword123` (Líder)
- `tesoureiro@example.com` / `TesoureiroPassword123` (Tesoureiro)
- `voluntario@example.com` / `VoluntarioPassword123` (Voluntário)
- `membro@example.com` / `MembroPassword123` (Membro)

These users are automatically created during global setup if they don't exist.

## Test Selectors

Tests use `data-testid` attributes for reliable element selection. Key selectors include:

### Authentication Forms
- `[data-testid="email-input"]`
- `[data-testid="password-input"]`
- `[data-testid="login-button"]`
- `[data-testid="register-button"]`
- `[data-testid="forgot-password-link"]`

### Navigation
- `[data-testid="user-menu"]`
- `[data-testid="logout-button"]`
- `[data-testid="sidebar-*"]` (various sidebar items)

### Messages
- `[data-testid="success-message"]`
- `[data-testid="error-message"]`
- `[data-testid="loading-spinner"]`

### Role-Specific Elements
- `[data-testid="create-user-button"]` (Admin only)
- `[data-testid="financial-dashboard"]` (Tesoureiro/Admin)
- `[data-testid="access-denied-message"]`

## Configuration

### Playwright Configuration

The tests are configured to:
- Run against Chromium, Firefox, and WebKit
- Start both frontend (port 5173) and backend (port 3001) servers automatically
- Use HTML reporter for test results
- Retry failed tests on CI
- Collect traces on first retry for debugging

### Environment Variables

Tests can be configured with environment variables:
- `CI` - Enables CI-specific settings (retries, single worker)
- Custom base URLs can be set in `playwright.config.ts`

## Best Practices

### Writing Tests

1. **Use Page Object Model** - Utilize the `TestHelpers` class for common operations
2. **Reliable Selectors** - Always use `data-testid` attributes
3. **Wait for Elements** - Use `expect().toBeVisible()` instead of hard waits
4. **Clean State** - Each test should be independent and clean up after itself
5. **Descriptive Names** - Test names should clearly describe what is being tested

### Debugging

1. **Use UI Mode** - `npm run test:e2e:ui` for interactive debugging
2. **Headed Mode** - `npm run test:e2e:headed` to see browser actions
3. **Debug Mode** - `npm run test:e2e:debug` for step-by-step debugging
4. **Screenshots** - Playwright automatically captures screenshots on failure
5. **Traces** - View traces in Playwright's trace viewer for detailed debugging

### Maintenance

1. **Update Selectors** - Keep `data-testid` attributes in sync with UI changes
2. **Test Data** - Update test users and data as needed
3. **Browser Updates** - Regularly update Playwright to support latest browsers
4. **Performance** - Monitor test execution time and optimize slow tests

## Troubleshooting

### Common Issues

1. **Server Not Starting** - Ensure ports 3001 and 5173 are available
2. **Test Data Missing** - Check global setup logs for user creation errors
3. **Flaky Tests** - Add proper waits and use stable selectors
4. **Network Errors** - Verify backend API endpoints are accessible

### Debugging Steps

1. Check server logs for both frontend and backend
2. Verify test data exists in database
3. Run tests in headed mode to see browser interactions
4. Check Playwright HTML report for detailed failure information
5. Use browser developer tools during headed test runs

## Contributing

When adding new tests:

1. Follow existing naming conventions
2. Add appropriate `data-testid` attributes to new UI elements
3. Update this README if adding new test categories
4. Ensure tests are independent and don't rely on execution order
5. Add proper error handling and cleanup
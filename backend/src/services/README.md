# Authentication Service Documentation

## Overview

The Authentication Service provides comprehensive authentication and authorization functionality for the church management system. It includes password validation, session management, brute force protection, and security auditing.

## Features

### 🔐 Password Security
- **Strong Password Validation**: Enforces minimum 8 characters with letters, numbers, and special characters
- **Secure Hashing**: Uses bcrypt with 12 salt rounds for password storage
- **Password Verification**: Safe password comparison using bcrypt

### 🛡️ Brute Force Protection
- **Login Attempt Tracking**: Records all login attempts with IP and user agent
- **Account Lockout**: Temporarily blocks accounts after 5 failed attempts
- **IP-based Protection**: Additional protection based on IP address
- **Automatic Cleanup**: Removes old login attempts to prevent memory leaks

### 🎫 Session Management
- **JWT-based Sessions**: Secure token-based authentication
- **Flexible Expiry**: 24-hour sessions, 30-day "remember me" sessions
- **Session Refresh**: Automatic session extension on activity
- **Multi-session Support**: Track multiple active sessions per user
- **Secure Cleanup**: Automatic removal of expired sessions

### 📊 Security Auditing
- **Login History**: Track successful and failed login attempts
- **Security Events**: Monitor suspicious activities
- **IP and User Agent Tracking**: Enhanced security monitoring
- **Admin Security Dashboard**: View system-wide security events

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "userPassword123!",
  "rememberMe": false
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "nome": "User Name",
    "email": "user@example.com",
    "funcao": "membro",
    "isActive": true
  },
  "token": "jwt-token-here",
  "message": "Login realizado com sucesso"
}
```

#### POST /api/auth/logout
Logout and invalidate session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

#### GET /api/auth/validate
Validate current session and get user info.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "user-id",
    "nome": "User Name",
    "email": "user@example.com",
    "funcao": "membro"
  },
  "session": {
    "expiresAt": "2024-01-01T12:00:00Z",
    "lastActivity": "2024-01-01T11:30:00Z"
  }
}
```

#### POST /api/auth/refresh
Refresh session token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "session": {
    "expiresAt": "2024-01-01T12:00:00Z",
    "lastActivity": "2024-01-01T11:30:00Z"
  },
  "message": "Sessão renovada com sucesso"
}
```

### User Management Endpoints

#### GET /api/auth/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

#### GET /api/auth/history
Get login history for current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit`: Number of records to return (default: 50)

#### GET /api/auth/sessions
Get active sessions for current user.

**Headers:**
```
Authorization: Bearer <token>
```

### Security Endpoints

#### POST /api/auth/validate-password
Validate password strength.

**Request:**
```json
{
  "password": "testPassword123!"
}
```

**Response:**
```json
{
  "valid": true,
  "errors": []
}
```

#### GET /api/auth/security-events
Get security events (admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `limit`: Number of records to return (default: 100)

## Middleware

### Authentication Middleware
```typescript
import { authenticate } from '../middleware/auth';

// Protect route
app.get('/protected-route', authenticate, (req, res) => {
  // req.user contains authenticated user
  // req.session contains session data
});
```

### Authorization Middleware
```typescript
import { authorize, requireAdmin, requirePastor } from '../middleware/auth';

// Role-based protection
app.get('/admin-only', authenticate, requireAdmin, handler);
app.get('/pastor-or-admin', authenticate, requirePastor, handler);

// Custom roles
app.get('/custom-roles', authenticate, authorize(['admin', 'custom-role']), handler);
```

### Rate Limiting
```typescript
import { rateLimitAuth } from '../middleware/auth';

// Apply rate limiting to login endpoint
app.post('/login', rateLimitAuth(5, 15 * 60 * 1000), handler);
```

## Security Features

### Password Requirements
- Minimum 8 characters
- At least one letter (a-z, A-Z)
- At least one number (0-9)
- At least one special character (!@#$%^&*(),.?":{}|<>)

### Session Security
- JWT tokens with secure signing
- Configurable expiration times
- IP address and user agent tracking
- Automatic cleanup of expired sessions

### Brute Force Protection
- Maximum 5 failed attempts per email
- Maximum 10 failed attempts per IP
- 15-minute lockout period
- Automatic attempt cleanup

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HTTPS only)

## Environment Variables

```env
# JWT Secret (required)
JWT_SECRET=your-super-secret-jwt-key

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Database URL
DATABASE_URL=file:./dev.db
```

## Error Codes

### Authentication Errors
- `NO_TOKEN`: No authentication token provided
- `INVALID_TOKEN`: Token is invalid or expired
- `USER_NOT_FOUND`: User account not found
- `ACCOUNT_INACTIVE`: User account is deactivated
- `AUTHENTICATION_FAILED`: Login credentials are invalid
- `TOO_MANY_ATTEMPTS`: Account temporarily locked due to failed attempts

### Authorization Errors
- `NOT_AUTHENTICATED`: User not authenticated
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `ACCESS_DENIED`: Access to resource denied

### Validation Errors
- `MISSING_CREDENTIALS`: Email or password not provided
- `MISSING_PASSWORD`: Password not provided for validation
- `WEAK_PASSWORD`: Password doesn't meet security requirements

## Usage Examples

### Basic Authentication
```typescript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123!',
    rememberMe: true
  })
});

const { token, user } = await response.json();

// Use token for authenticated requests
const protectedResponse = await fetch('/api/protected-endpoint', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Password Validation
```typescript
const validation = await fetch('/api/auth/validate-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'newPassword123!' })
});

const { valid, errors } = await validation.json();
if (!valid) {
  console.log('Password errors:', errors);
}
```

## Testing

Run the authentication service tests:

```bash
# Validate dependencies
node validate-auth.js

# Run TypeScript compilation check
npx tsc --noEmit --skipLibCheck src/services/AuthService.ts
```

## Security Considerations

1. **Always use HTTPS in production**
2. **Set strong JWT_SECRET environment variable**
3. **Regularly rotate JWT secrets**
4. **Monitor security events and failed login attempts**
5. **Implement proper logging and alerting**
6. **Keep dependencies updated**
7. **Use secure session storage (Redis) in production**
8. **Implement proper CORS policies**
9. **Add CSP headers for additional security**
10. **Regular security audits and penetration testing**

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, Facebook)
- [ ] Password reset via email
- [ ] Account verification via email
- [ ] Advanced session management (device tracking)
- [ ] Security notifications
- [ ] Audit log export
- [ ] Advanced rate limiting with Redis
- [ ] Geolocation-based security
- [ ] Biometric authentication support
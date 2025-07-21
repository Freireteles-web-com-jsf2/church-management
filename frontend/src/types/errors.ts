// Authentication error types and interfaces

export enum AuthErrorType {
  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  PASSWORD_REQUIREMENTS_NOT_MET = 'PASSWORD_REQUIREMENTS_NOT_MET',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  OPERATION_FAILED = 'OPERATION_FAILED'
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  details?: any;
  timestamp: Date;
  retryable?: boolean;
  userMessage?: string;
}

export interface NetworkError extends AuthError {
  type: AuthErrorType.NETWORK_ERROR | AuthErrorType.CONNECTION_TIMEOUT | AuthErrorType.SERVER_ERROR | AuthErrorType.SERVICE_UNAVAILABLE;
  statusCode?: number;
  retryAfter?: number;
  severity: ErrorSeverity;
  context?: ErrorContext;
}

export interface ValidationError extends AuthError {
  type: AuthErrorType.VALIDATION_ERROR | AuthErrorType.PASSWORD_REQUIREMENTS_NOT_MET;
  field?: string;
  validationErrors?: string[];
  severity: ErrorSeverity;
  context?: ErrorContext;
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error context for better debugging
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, any>;
}

// Complete error interface with context
export interface DetailedError extends AuthError {
  severity: ErrorSeverity;
  context?: ErrorContext;
  stack?: string;
  correlationId?: string;
}
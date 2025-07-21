// Comprehensive error handling utilities

import type { AuthError, NetworkError, ValidationError, DetailedError, ErrorContext } from '../types/errors';
import { AuthErrorType, ErrorSeverity } from '../types/errors';
import { translateError } from './errorTranslations';

// Error classification and mapping
export class ErrorHandler {
  private static errorTypeMap: Record<string, AuthErrorType> = {
    // Authentication errors
    'Usuário não encontrado': AuthErrorType.INVALID_CREDENTIALS,
    'Senha incorreta': AuthErrorType.INVALID_CREDENTIALS,
    'Credenciais inválidas': AuthErrorType.INVALID_CREDENTIALS,
    'Conta bloqueada': AuthErrorType.ACCOUNT_LOCKED,
    'Conta inativa': AuthErrorType.ACCOUNT_INACTIVE,
    'Sessão expirada': AuthErrorType.SESSION_EXPIRED,
    'Token inválido': AuthErrorType.INVALID_TOKEN,
    'Token expirado': AuthErrorType.TOKEN_EXPIRED,
    'Muitas tentativas': AuthErrorType.TOO_MANY_ATTEMPTS,
    'Email não verificado': AuthErrorType.EMAIL_NOT_VERIFIED,
    'Permissão insuficiente': AuthErrorType.INSUFFICIENT_PERMISSIONS,
    'Senha inválida': AuthErrorType.PASSWORD_REQUIREMENTS_NOT_MET,
    
    // Network errors
    'Network request failed': AuthErrorType.NETWORK_ERROR,
    'Connection timeout': AuthErrorType.CONNECTION_TIMEOUT,
    'Server error': AuthErrorType.SERVER_ERROR,
    'Service unavailable': AuthErrorType.SERVICE_UNAVAILABLE,
    
    // Validation errors
    'Email inválido': AuthErrorType.INVALID_EMAIL,
    'Dados inválidos': AuthErrorType.VALIDATION_ERROR,
  };

  private static severityMap: Record<AuthErrorType, ErrorSeverity> = {
    [AuthErrorType.INVALID_CREDENTIALS]: ErrorSeverity.MEDIUM,
    [AuthErrorType.ACCOUNT_LOCKED]: ErrorSeverity.HIGH,
    [AuthErrorType.ACCOUNT_INACTIVE]: ErrorSeverity.HIGH,
    [AuthErrorType.SESSION_EXPIRED]: ErrorSeverity.MEDIUM,
    [AuthErrorType.INSUFFICIENT_PERMISSIONS]: ErrorSeverity.MEDIUM,
    [AuthErrorType.PASSWORD_REQUIREMENTS_NOT_MET]: ErrorSeverity.LOW,
    [AuthErrorType.EMAIL_NOT_VERIFIED]: ErrorSeverity.MEDIUM,
    [AuthErrorType.TOO_MANY_ATTEMPTS]: ErrorSeverity.HIGH,
    [AuthErrorType.NETWORK_ERROR]: ErrorSeverity.MEDIUM,
    [AuthErrorType.CONNECTION_TIMEOUT]: ErrorSeverity.MEDIUM,
    [AuthErrorType.SERVER_ERROR]: ErrorSeverity.HIGH,
    [AuthErrorType.SERVICE_UNAVAILABLE]: ErrorSeverity.HIGH,
    [AuthErrorType.VALIDATION_ERROR]: ErrorSeverity.LOW,
    [AuthErrorType.INVALID_EMAIL]: ErrorSeverity.LOW,
    [AuthErrorType.INVALID_TOKEN]: ErrorSeverity.MEDIUM,
    [AuthErrorType.TOKEN_EXPIRED]: ErrorSeverity.MEDIUM,
    [AuthErrorType.UNKNOWN_ERROR]: ErrorSeverity.MEDIUM,
    [AuthErrorType.OPERATION_FAILED]: ErrorSeverity.MEDIUM,
  };

  private static retryableErrors: Set<AuthErrorType> = new Set([
    AuthErrorType.NETWORK_ERROR,
    AuthErrorType.CONNECTION_TIMEOUT,
    AuthErrorType.SERVER_ERROR,
    AuthErrorType.SERVICE_UNAVAILABLE,
  ]);

  /**
   * Create a standardized AuthError from any error input
   */
  static createAuthError(
    error: unknown,
    context?: ErrorContext,
    correlationId?: string
  ): DetailedError {
    let authError: AuthError;

    if (error instanceof Error) {
      const errorType = this.classifyError(error.message);
      authError = {
        type: errorType,
        message: error.message,
        details: error,
        timestamp: new Date(),
        retryable: this.retryableErrors.has(errorType),
        userMessage: translateError(error.message),
      };
    } else if (typeof error === 'string') {
      const errorType = this.classifyError(error);
      authError = {
        type: errorType,
        message: error,
        timestamp: new Date(),
        retryable: this.retryableErrors.has(errorType),
        userMessage: translateError(error),
      };
    } else {
      authError = {
        type: AuthErrorType.UNKNOWN_ERROR,
        message: 'Erro desconhecido',
        details: error,
        timestamp: new Date(),
        retryable: false,
        userMessage: 'Ocorreu um erro inesperado. Tente novamente.',
      };
    }

    const detailedError: DetailedError = {
      ...authError,
      severity: this.severityMap[authError.type] || ErrorSeverity.MEDIUM,
      context,
      correlationId,
    };

    // Add stack trace if available
    if (error instanceof Error && error.stack) {
      detailedError.stack = error.stack;
    }

    return detailedError;
  }

  /**
   * Classify error message to determine error type
   */
  private static classifyError(message: string): AuthErrorType {
    const lowerMessage = message.toLowerCase();

    // Check for exact matches first
    for (const [key, type] of Object.entries(this.errorTypeMap)) {
      if (lowerMessage.includes(key.toLowerCase())) {
        return type;
      }
    }

    // Check for network-related errors
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return AuthErrorType.NETWORK_ERROR;
    }

    if (lowerMessage.includes('timeout')) {
      return AuthErrorType.CONNECTION_TIMEOUT;
    }

    if (lowerMessage.includes('server') || lowerMessage.includes('500')) {
      return AuthErrorType.SERVER_ERROR;
    }

    if (lowerMessage.includes('unavailable') || lowerMessage.includes('503')) {
      return AuthErrorType.SERVICE_UNAVAILABLE;
    }

    // Default to unknown error
    return AuthErrorType.UNKNOWN_ERROR;
  }

  /**
   * Create a network-specific error
   */
  static createNetworkError(
    message: string,
    statusCode?: number,
    retryAfter?: number,
    context?: ErrorContext
  ): NetworkError {
    let errorType: AuthErrorType;

    if (statusCode) {
      if (statusCode >= 500) {
        errorType = AuthErrorType.SERVER_ERROR;
      } else if (statusCode === 503) {
        errorType = AuthErrorType.SERVICE_UNAVAILABLE;
      } else {
        errorType = AuthErrorType.NETWORK_ERROR;
      }
    } else {
      errorType = AuthErrorType.NETWORK_ERROR;
    }

    return {
      type: errorType,
      message,
      timestamp: new Date(),
      retryable: true,
      userMessage: translateError(message),
      statusCode,
      retryAfter,
      severity: this.severityMap[errorType],
      context,
    };
  }

  /**
   * Create a validation-specific error
   */
  static createValidationError(
    message: string,
    field?: string,
    validationErrors?: string[],
    context?: ErrorContext
  ): ValidationError {
    return {
      type: AuthErrorType.VALIDATION_ERROR,
      message,
      timestamp: new Date(),
      retryable: false,
      userMessage: translateError(message),
      field,
      validationErrors,
      severity: ErrorSeverity.LOW,
      context,
    };
  }

  /**
   * Log error for debugging and monitoring
   */
  static logError(error: DetailedError): void {
    const logData = {
      type: error.type,
      message: error.message,
      severity: error.severity,
      timestamp: error.timestamp,
      context: error.context,
      correlationId: error.correlationId,
    };

    // Log based on severity
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('[CRITICAL ERROR]', logData);
        break;
      case ErrorSeverity.HIGH:
        console.error('[HIGH ERROR]', logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('[MEDIUM ERROR]', logData);
        break;
      case ErrorSeverity.LOW:
        console.info('[LOW ERROR]', logData);
        break;
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(error);
    }
  }

  /**
   * Send error to monitoring service (placeholder)
   */
  private static sendToMonitoring(error: DetailedError): void {
    // In a real application, this would send to services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom monitoring endpoint
    
    // For now, just log that we would send it
    console.log('[MONITORING] Would send error to monitoring service:', {
      type: error.type,
      severity: error.severity,
      correlationId: error.correlationId,
    });
  }

  /**
   * Check if an error is retryable
   */
  static isRetryable(error: AuthError): boolean {
    return error.retryable === true;
  }

  /**
   * Get user-friendly message for error
   */
  static getUserMessage(error: AuthError): string {
    return error.userMessage || translateError(error.message);
  }

  /**
   * Generate correlation ID for error tracking
   */
  static generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
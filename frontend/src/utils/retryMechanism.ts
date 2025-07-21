// Retry mechanisms for network errors and failed operations

import type { AuthError, NetworkError } from '../types/errors';
import { AuthErrorType } from '../types/errors';
import { ErrorHandler } from './errorHandler';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: AuthError) => boolean;
  onRetry?: (attempt: number, error: AuthError) => void;
  onMaxAttemptsReached?: (error: AuthError) => void;
}

export interface RetryState {
  attempt: number;
  lastError: AuthError | null;
  isRetrying: boolean;
  nextRetryAt: Date | null;
}

export class RetryMechanism {
  private static defaultOptions: Required<RetryOptions> = {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffFactor: 2,
    retryCondition: (error: AuthError) => ErrorHandler.isRetryable(error),
    onRetry: () => {},
    onMaxAttemptsReached: () => {},
  };

  /**
   * Execute a function with retry logic
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const config = { ...this.defaultOptions, ...options };
    let lastError: AuthError | null = null;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const authError = ErrorHandler.createAuthError(
          error,
          { action: 'retry_operation', additionalData: { attempt } }
        );

        lastError = authError;

        // Check if we should retry
        if (attempt === config.maxAttempts || !config.retryCondition(authError)) {
          if (attempt === config.maxAttempts) {
            config.onMaxAttemptsReached(authError);
          }
          throw authError;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
          config.maxDelay
        );

        // Add jitter to prevent thundering herd
        const jitteredDelay = delay + Math.random() * 1000;

        // Call retry callback
        config.onRetry(attempt, authError);

        // Wait before retrying
        await this.delay(jitteredDelay);
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError || new Error('Retry mechanism failed unexpectedly');
  }

  /**
   * Create a retry wrapper for a function
   */
  static createRetryWrapper<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options: RetryOptions = {}
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      return this.withRetry(() => fn(...args), options);
    };
  }

  /**
   * Delay execution for specified milliseconds
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if error should trigger a retry based on type and conditions
   */
  static shouldRetry(error: AuthError, attempt: number, maxAttempts: number): boolean {
    // Don't retry if max attempts reached
    if (attempt >= maxAttempts) {
      return false;
    }

    // Check if error is retryable
    if (!ErrorHandler.isRetryable(error)) {
      return false;
    }

    // Special handling for network errors
    if (error.type === AuthErrorType.NETWORK_ERROR || 
        error.type === AuthErrorType.CONNECTION_TIMEOUT) {
      return true;
    }

    // Check for server errors (5xx)
    if (error.type === AuthErrorType.SERVER_ERROR) {
      const networkError = error as NetworkError;
      return !networkError.statusCode || networkError.statusCode >= 500;
    }

    // Service unavailable should be retried
    if (error.type === AuthErrorType.SERVICE_UNAVAILABLE) {
      return true;
    }

    return false;
  }

  /**
   * Calculate next retry delay with exponential backoff
   */
  static calculateDelay(
    attempt: number,
    baseDelay: number = 1000,
    backoffFactor: number = 2,
    maxDelay: number = 30000,
    jitter: boolean = true
  ): number {
    const exponentialDelay = baseDelay * Math.pow(backoffFactor, attempt - 1);
    const cappedDelay = Math.min(exponentialDelay, maxDelay);
    
    if (jitter) {
      // Add random jitter (±25% of the delay)
      const jitterAmount = cappedDelay * 0.25;
      return cappedDelay + (Math.random() - 0.5) * 2 * jitterAmount;
    }
    
    return cappedDelay;
  }

  /**
   * Create a retry state manager for UI components
   */
  static createRetryState(): {
    state: RetryState;
    retry: (operation: () => Promise<void>, options?: RetryOptions) => Promise<void>;
    reset: () => void;
  } {
    let state: RetryState = {
      attempt: 0,
      lastError: null,
      isRetrying: false,
      nextRetryAt: null,
    };

    const retry = async (
      operation: () => Promise<void>,
      options: RetryOptions = {}
    ): Promise<void> => {
      const config = { ...this.defaultOptions, ...options };
      
      state.isRetrying = true;
      state.attempt = 0;
      state.lastError = null;
      state.nextRetryAt = null;

      try {
        await this.withRetry(operation, {
          ...config,
          onRetry: (attempt, error) => {
            state.attempt = attempt;
            state.lastError = error;
            state.nextRetryAt = new Date(
              Date.now() + this.calculateDelay(attempt + 1)
            );
            config.onRetry(attempt, error);
          },
        });
      } finally {
        state.isRetrying = false;
        state.nextRetryAt = null;
      }
    };

    const reset = () => {
      state = {
        attempt: 0,
        lastError: null,
        isRetrying: false,
        nextRetryAt: null,
      };
    };

    return { state, retry, reset };
  }
}

// Specialized retry configurations for different scenarios
export const RetryConfigs = {
  // For authentication operations
  auth: {
    maxAttempts: 2,
    baseDelay: 1000,
    backoffFactor: 1.5,
    retryCondition: (error: AuthError) => 
      error.type === AuthErrorType.NETWORK_ERROR ||
      error.type === AuthErrorType.CONNECTION_TIMEOUT,
  },

  // For API calls
  api: {
    maxAttempts: 3,
    baseDelay: 1000,
    backoffFactor: 2,
    maxDelay: 10000,
  },

  // For critical operations
  critical: {
    maxAttempts: 5,
    baseDelay: 500,
    backoffFactor: 1.5,
    maxDelay: 15000,
  },

  // For background operations
  background: {
    maxAttempts: 10,
    baseDelay: 2000,
    backoffFactor: 1.2,
    maxDelay: 60000,
  },
} as const;
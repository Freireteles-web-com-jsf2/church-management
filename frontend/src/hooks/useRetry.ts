import { useCallback } from 'react';

export function useRetry<T>(fn: () => Promise<T>, options?: { retries?: number; delay?: number }) {
  const { retries = 3, delay = 1000 } = options || {};

  const retry = useCallback(async () => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await fn();
      } catch (error) {
        attempt++;
        if (attempt >= retries) throw error;
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }, [fn, retries, delay]);

  return retry;
} 
/**
 * YYC3-Claude Test Setup
 * Global test configuration and utilities
 */

import { beforeEach, afterEach, vi } from 'vitest';

// Set environment variables at module load time (before any tests run)
process.env.NODE_ENV = 'test';
process.env.YYC3_ENV = 'testing';
process.env.YYC3_TEST = 'true';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
};

// Test environment setup
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();

  // Ensure environment variables are set before each test
  process.env.NODE_ENV = 'test';
  process.env.YYC3_ENV = 'testing';
  process.env.YYC3_TEST = 'true';
});

afterEach(() => {
  // Cleanup after each test
  vi.restoreAllMocks();
});

// Global test utilities
declare module 'vitest' {
  export interface TestContext {
    /**
     * Custom test utilities
     */
    utils: {
      /**
       * Wait for a specified number of milliseconds
       */
      wait: (ms: number) => Promise<void>;
      /**
       * Retry a function until it returns true or max attempts reached
       */
      retry: <T>(
        fn: () => T | Promise<T>,
        maxAttempts?: number,
        delay?: number,
      ) => Promise<T>;
    };
  }
}

export const utils = {
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  retry: async <T>(
    fn: () => T | Promise<T>,
    maxAttempts = 3,
    delay = 100,
  ): Promise<T> => {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxAttempts) {
          await utils.wait(delay);
        }
      }
    }

    throw lastError;
  },
};

// Type assertions
declare global {
  const expect: typeof import('vitest').expect;
  const describe: typeof import('vitest').describe;
  const it: typeof import('vitest').it;
  const test: typeof import('vitest').test;
  const vi: typeof import('vitest').vi;
}

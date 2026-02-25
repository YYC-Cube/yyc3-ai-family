import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test Environment
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    include: ['test/unit/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: [
      'node_modules/',
      'dist/',
      'build/',
      '.next/',
      'test/e2e/**',
      '*.config.ts',
      '*.md',
      'automation-scripts/',
      'claude-prompts-mcp/',
      'zai-coding-plugins/',
      'Ralph-Loop/',
    ],

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '.next/',
        'test/',
        '*.config.ts',
        '*.md',
        'automation-scripts/',
        'claude-prompts-mcp/',
        'zai-coding-plugins/',
        'Ralph-Loop/',
      ],
      thresholds: {
        statements: 60,
        branches: 60,
        functions: 60,
        lines: 60,
      },
    },

    // Reporting
    reporters: ['default', 'html'],
    outputFile: './test-results/unit-test-results.html',

    // Watch Mode
    watch: false,

    // Isolation
    isolate: true,

    // Pool
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },

    // Timeout
    testTimeout: 10000,
    hookTimeout: 10000,

    // Benchmark
    benchmark: {
      include: ['**/*.bench.ts'],
    },
  },

  // Path Aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './test'),
    },
  },

  // Define
  define: {
    __TEST__: 'true',
  },

  // Environment variables
  env: {
    NODE_ENV: 'test',
    YYC3_ENV: 'testing',
    YYC3_TEST: 'true',
  },
});

/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Integration tests configuration - REAL DATABASE & REDIS
const integrationConfig = {
  displayName: 'integration',
  testEnvironment: 'node',

  // Load test environment variables - MOVED to setupFilesAfterEnv due to Next.js wrapper override
  setupFilesAfterEnv: [
    '<rootDir>/jest.env.integration.js',      // FIRST: Environment loading
    '<rootDir>/jest.setup.integration.js',
    '<rootDir>/test-utils/integration-test-setup.js'
  ],

  // TypeScript transformation with ts-jest (no babel needed)
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
    '^.+\\.(js|jsx|mjs)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // Module path mapping for '@/' aliases - NO MOCKS for integration tests
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@env$': '<rootDir>/src/env/index.ts',
    '^@/env$': '<rootDir>/src/env/index.ts',
  },

  // Transform ignored node_modules
  transformIgnorePatterns: ['node_modules/(?!(@t3-oss|msw|@mswjs)/)'],

  // Module resolution
  moduleDirectories: ['node_modules', '<rootDir>/'],

  // Integration test patterns - ONLY integration tests
  testMatch: [
    '<rootDir>/src/__tests__/integration/**/*.test.(ts|tsx|js)',
    '<rootDir>/src/**/__tests__/**/*-integration.test.(ts|tsx|js)',
    '<rootDir>/src/**/?(*.)(integration.test|integration.spec).(ts|tsx|js)',
  ],

  // CRITICAL: DO NOT ignore integration tests
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__/setup.ts',
    // ONLY ignore unit tests in integration run
    '<rootDir>/src/__tests__/*-unit.test.ts',
    '<rootDir>/src/__tests__/unit/',
  ],

  // Coverage configuration for integration tests
  collectCoverageFrom: [
    'src/app/api/**/*.{js,jsx,ts,tsx}',
    'src/lib/**/*.{js,jsx,ts,tsx}',
    'src/middleware.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/types/**',
  ],

  // Integration test specific timeouts and settings
  testTimeout: 30000, // 30 seconds for database operations
  
  // Retry mechanism for potentially flaky integration tests
  testRetries: process.env.CI ? 1 : 0, // Only 1 retry in CI

  // Coverage thresholds for integration tests (focused on API coverage)
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 50,
      lines: 60,
      statements: 60,
    },
    'src/app/api/': {
      branches: 60,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },

  // Professional reporting for integration tests
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit-integration.xml',
        suiteName: 'İ-EP.APP Integration Tests',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
        addFileAttribute: true,
        includeConsoleOutput: true,
      },
    ],
  ],

  // Global test environment setup
  globalSetup: '<rootDir>/test-utils/integration-global-setup.js',
  globalTeardown: '<rootDir>/test-utils/integration-global-teardown.js',

  // Test environment options
  testEnvironmentOptions: {
    customExportConditions: [''],
  },

  // Cache configuration for integration tests
  cacheDirectory: '<rootDir>/.jest-cache-integration',
  clearMocks: true,
  restoreMocks: true,
  
  // Verbose output for better debugging
  verbose: process.env.CI ? false : true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Performance optimization for integration tests
  maxWorkers: process.env.CI ? 2 : 1, // Single worker to avoid DB conflicts
  workerIdleMemoryLimit: '512MB',
};

module.exports = createJestConfig(integrationConfig);
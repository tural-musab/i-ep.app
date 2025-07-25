/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Component tests configuration (jsdom environment)
const componentConfig = {
  displayName: 'components',
  testEnvironment: 'jsdom',

  // ES modules transformation support
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.(mjs|ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
    '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // Module path mapping for '@/' aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Handle ES modules that Jest cannot parse
    '^@t3-oss/env-nextjs$': '<rootDir>/src/__mocks__/env-mock.ts',
    // Mock Sentry for tests
    '^@sentry/nextjs$': '<rootDir>/src/__mocks__/sentry.ts',
    // Mock NextAuth for tests
    '^next-auth$': '<rootDir>/src/__mocks__/next-auth.ts',
    '^next-auth/(.*)$': '<rootDir>/src/__mocks__/next-auth.ts',
    // Mock NextAuth providers
    '^next-auth/providers/credentials$': '<rootDir>/src/__mocks__/next-auth-providers.ts',
    // Mock auth route to prevent next-auth loading
    '^@/app/api/auth/\\[\\.\\.\\.nextauth\\]/route$': '<rootDir>/src/__mocks__/next-auth.ts',
    // Mock audit log to prevent auth imports
    '^@/lib/audit/audit-log$': '<rootDir>/src/__mocks__/audit-log.ts',
  },

  // Transform ignored node_modules (enhanced for .mjs support)
  transformIgnorePatterns: ['node_modules/(?!(@t3-oss|msw|@mswjs)/)'],

  // Module resolution
  moduleDirectories: ['node_modules', '<rootDir>/'],

  // Setup files for component tests (jsdom environment)
  setupFiles: ['<rootDir>/jest.env.js', '<rootDir>/jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test environment options
  testEnvironmentOptions: {
    customExportConditions: [''],
  },

  // Increase timeout for security tests
  testTimeout: 10000,

  // Test patterns for component tests
  testMatch: [
    '<rootDir>/src/**/__tests__/components/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/?(*.)(component.test|component.spec).(ts|tsx|js)',
  ],

  // Only ignore standard directories for component tests
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/types/**',
    '!src/app/api/auth/[...nextauth]/route.ts',
    '!src/instrumentation*.ts',
  ],

  // Coverage thresholds for component tests
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 45,
      lines: 55,
      statements: 55,
    },
  },

  // Coverage report formats with JUnit support
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // JUnit reporter for CI/CD
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit-components.xml',
        suiteName: 'Component Tests',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
  ],
};

module.exports = createJestConfig(componentConfig);

/* eslint-disable @typescript-eslint/no-require-imports */
const unitConfig = require('./jest.config.unit.js');
const componentConfig = require('./jest.config.components.js');
const integrationConfig = require('./jest.config.integration.js');

// Multi-project configuration that uses separate config files
const multiProjectConfig = {
  projects: [unitConfig, componentConfig, integrationConfig],

  // Global settings for all projects
  testTimeout: 10000,
  // testRetries not supported in Jest 29.7, needs Jest 30+
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // JUnit reporter for CI/CD
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit.xml',
        suiteName: 'Jest Multi-Project Tests',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
  ],
};

module.exports = multiProjectConfig;

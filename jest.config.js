const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Next.js uygulamasının yolu - package.json'un bulunduğu klasör
  dir: './',
});

// Jest için özel yapılandırma
/** @type {import('jest').Config} */
const customJestConfig = {
  // Modül dosya uzantıları
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Test ortamı
  testEnvironment: 'jsdom',
  
  // Test için klasör ve dosya kalıpları
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // Göz ardı edilecek klasörler
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/cypress/',
  ],
  
  // Modül adı eşlemeleri
  moduleNameMapper: {
    // Dosya tiplerini mock et
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js',
    
    // Path alias'ları
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Test ortamını hazırlama
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Coverage yapılandırması
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/types/**/*',
    '!**/node_modules/**',
  ],
  
  // Dönüşüm yapılandırması
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
};

// Next.js'in Jest yapılandırması
module.exports = createJestConfig(customJestConfig); 
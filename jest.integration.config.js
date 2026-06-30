module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/integration'],
  testMatch: ['**/?(*.)+(integration).[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupIntegrationTests.ts'],
  testTimeout: 30000, // 30 segundos para pruebas de integración
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30
    }
  }
};
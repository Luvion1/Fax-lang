module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'compiler/**/*.{js,ts}',
    '!compiler/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  testMatch: [
    '**/tests/**/*.test.(js|ts)',
    '**/?(*.)+(spec|test).(js|ts)',
  ],
};
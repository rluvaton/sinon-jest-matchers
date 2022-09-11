module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  restoreMocks: true,
};

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  // This is required as we test and generate our snapshots in Mac
  // we need to convert ansi (escape codes) from the output for it to work in linux too
  snapshotSerializers: ['jest-snapshot-serializer-ansi'],
  restoreMocks: true,
};

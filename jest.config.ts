const config = {
  globalSetup: './jestSetup.ts',
  moduleDirectories: ['node_modules', 'src'],
  setupFilesAfterEnv: [
    '@testing-library/jest-dom',
    '<rootDir>/src/setupTests.ts',
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test))\\.(js|tsx?)?$',
  moduleFileExtensions: ['js', 'jsx', 'json', 'node', 'ts', 'tsx'],
  testTimeout: 100000,
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
  },
}

module.exports = config

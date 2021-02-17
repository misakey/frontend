module.exports = {
  verbose: true,
  moduleDirectories: ['node_modules', 'src'],
  modulePathIgnorePatterns: ['<rootDir>/src/packages/[^/]+/build/'],
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  moduleNameMapper: {
    '^@misakey/([^/]+)/(.*)': 'packages/$1/src/$2',
  },
  setupFiles: [
    './scripts/jest/setup/fetch.js',
    './scripts/jest/setup/env.js',
  ],
};

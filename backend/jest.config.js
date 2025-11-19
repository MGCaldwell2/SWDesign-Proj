/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!jest.config.js'
  ],
  transform: {},
  extensionsToTreatAsEsm: ['.js']
};
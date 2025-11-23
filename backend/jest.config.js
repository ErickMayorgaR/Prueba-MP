module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        esModuleInterop: true,
        module: 'commonjs',
        target: 'ES2020',
        strict: false,
        skipLibCheck: true,
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: false,
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};
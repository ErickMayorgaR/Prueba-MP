import 'reflect-metadata';

process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.NODE_ENV = 'test';

jest.mock('../src/config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
    initialize: jest.fn().mockResolvedValue(true),
    isInitialized: true,
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});
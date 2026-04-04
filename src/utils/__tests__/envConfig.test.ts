import { validateEnvironment, getApiBaseUrl } from '../envConfig';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateEnvironment', () => {
    it('should pass validation with required env vars', () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';
      expect(() => validateEnvironment()).not.toThrow();
    });

    it('should throw error when required env var is missing', () => {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
      expect(() => validateEnvironment()).toThrow('Missing required environment variables');
    });
  });

  describe('getApiBaseUrl', () => {
    it('should return configured API URL', () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = 'https://custom-api.com';
      expect(getApiBaseUrl()).toBe('https://custom-api.com');
    });
  });
});

import { api } from '../api';

describe('API Client', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('request', () => {
    it('should make a GET request successfully', async () => {
      const mockResponse = { word: 'test', meaning: 'a procedure' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.wordOfDay();
      expect(result.word).toBe('test');
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const errorMessage = 'Not found';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: errorMessage }),
      });

      await expect(api.wordOfDay()).rejects.toThrow(errorMessage);
    });

    it('should include Content-Type header', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await api.wordOfDay();
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].headers['Content-Type']).toBe('application/json');
    });
  });

  describe('wordOfDay', () => {
    it('should fetch word of the day', async () => {
      const mockData = { word: 'ephemeral', meaning: 'lasting a short time', date: '2026-04-04' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.wordOfDay();
      expect(result).toEqual(mockData);
    });
  });

  describe('define', () => {
    it('should fetch definition for a word', async () => {
      const mockData = {
        term: 'serendipity',
        result: { word: 'serendipity', meaning: 'the occurrence of events by chance' },
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.define('serendipity');
      expect(result.term).toBe('serendipity');
    });
  });

  describe('authentication', () => {
    it('should login with credentials', async () => {
      const mockData = {
        token: 'jwt-token',
        user: { id: '1', username: 'testuser', email: 'test@example.com' },
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.login('test@example.com', 'password123');
      expect(result.token).toBe('jwt-token');
    });
  });
});

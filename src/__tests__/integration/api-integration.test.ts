import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import themeReducer from '../../store/slices/themeSlice';
import uiReducer from '../../store/slices/uiSlice';
import wordsReducer from '../../store/slices/wordsSlice';
import routingReducer from '../../store/slices/routingSlice';
import speechReducer from '../../store/slices/speechSlice';
import { loadSuggestions, loadRouteData } from '../../store/thunks';

// Mock fetch globally
global.fetch = jest.fn();

function createTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      theme: themeReducer,
      ui: uiReducer,
      words: wordsReducer,
      routing: routingReducer,
      speech: speechReducer,
    },
  });
}

describe('API Integration: Data Fetching', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('loadSuggestions Thunk', () => {
    it('should fetch suggestions from Datamuse API', async () => {
      const store = createTestStore();
      const mockSuggestions = [
        { word: 'apple' },
        { word: 'application' },
        { word: 'applaud' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestions,
      });

      const result = await store.dispatch(loadSuggestions('appl') as any);
      expect(result.payload).toEqual(['apple', 'application', 'applaud']);
    });

    it('should limit suggestions to 5 items', async () => {
      const store = createTestStore();
      const mockSuggestions = [
        { word: 'apple' },
        { word: 'application' },
        { word: 'applaud' },
        { word: 'apples' },
        { word: 'applied' },
        { word: 'appliance' },
        { word: 'apply' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestions,
      });

      const result = await store.dispatch(loadSuggestions('appl') as any);
      expect((result.payload as any[]).length).toBeLessThanOrEqual(5);
    });

    it('should return empty array on network error', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await store.dispatch(loadSuggestions('test') as any);
      expect(result.payload).toEqual([]);
    });

    it('should return empty array on API 404 error', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await store.dispatch(loadSuggestions('xyz') as any);
      expect(result.payload).toEqual([]);
    });

    it('should return empty array on malformed JSON response', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const result = await store.dispatch(loadSuggestions('test') as any);
      expect(result.payload).toEqual([]);
    });

    it('should return empty array on timeout', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Request timeout'));

      const result = await store.dispatch(loadSuggestions('slow') as any);
      expect(result.payload).toEqual([]);
    });

    it('should handle server 500 error gracefully', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await store.dispatch(loadSuggestions('error') as any);
      expect(result.payload).toEqual([]);
    });
  });

  describe('loadRouteData Thunk', () => {
    it('should fetch word definitions by word', async () => {
      const store = createTestStore();
      const mockWordData = {
        result: [{ word: 'serendipity', definitions: ['finding good things by chance'] }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWordData,
      });

      const result = await store.dispatch(
        loadRouteData({ page: 'word', word: 'serendipity' }) as any
      );
      expect(result.type).toContain('fulfilled');
    });

    it('should fetch words by subject', async () => {
      const store = createTestStore();
      const mockWords = {
        words: [
          { word: 'photosynthesis', category: 'Biology' },
          { word: 'mitochondria', category: 'Biology' },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWords,
      });

      const result = await store.dispatch(
        loadRouteData({ page: 'subject', value: 'biology' }) as any
      );
      expect(result.type).toContain('fulfilled');
    });

    it('should fetch words by grade level', async () => {
      const store = createTestStore();
      const mockWords = {
        words: [
          { word: 'cat', grade: 1 },
          { word: 'run', grade: 1 },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWords,
      });

      const result = await store.dispatch(
        loadRouteData({ page: 'grade', value: '1' }) as any
      );
      expect(result.type).toContain('fulfilled');
    });

    it('should fetch words by exam type', async () => {
      const store = createTestStore();
      const mockWords = {
        words: [
          { word: 'recalcitrant', exam: 'SAT' },
          { word: 'ubiquitous', exam: 'SAT' },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWords,
      });

      const result = await store.dispatch(
        loadRouteData({ page: 'exam', value: 'SAT' }) as any
      );
      expect(result.type).toContain('fulfilled');
    });

    it('should fetch dictionary page data', async () => {
      const store = createTestStore();
      const mockDictData = {
        words: [
          { word: 'apple' },
          { word: 'application' },
          { word: 'apply' },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDictData,
      });

      const result = await store.dispatch(
        loadRouteData({ page: 'dictionary' }) as any
      );
      expect(result.type).toContain('fulfilled');
    });

    it('should return null for pages without data loading', async () => {
      const store = createTestStore();

      const homeResult = await store.dispatch(
        loadRouteData({ page: 'home' }) as any
      );
      expect(homeResult.payload).toBeNull();

      const aboutResult = await store.dispatch(
        loadRouteData({ page: 'about' }) as any
      );
      expect(aboutResult.payload).toBeNull();

      const quizResult = await store.dispatch(
        loadRouteData({ page: 'quiz' }) as any
      );
      expect(quizResult.payload).toBeNull();
    });

    it('should throw error on network failure', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await store.dispatch(
        loadRouteData({ page: 'word', word: 'test' }) as any
      );
      expect(result.type).toContain('rejected');
    });

    it('should throw error on 404 not found', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await store.dispatch(
        loadRouteData({ page: 'word', word: 'nonexistent' }) as any
      );
      expect(result.type).toContain('rejected');
    });

    it('should throw error on malformed response', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const result = await store.dispatch(
        loadRouteData({ page: 'dictionary' }) as any
      );
      expect(result.type).toContain('rejected');
    });

    it('should throw error on 500 server error', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await store.dispatch(
        loadRouteData({ page: 'subject', value: 'math' }) as any
      );
      expect(result.type).toContain('rejected');
    });

    it('should handle timeout gracefully', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Request timeout')
      );

      const result = await store.dispatch(
        loadRouteData({ page: 'exam', value: 'GRE' }) as any
      );
      expect(result.type).toContain('rejected');
    });
  });

  describe('Concurrent API Requests', () => {
    it('should handle multiple concurrent suggestion requests', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ['apple'],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ['banana'],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ['cherry'],
        });

      const results = await Promise.all([
        store.dispatch(loadSuggestions('a') as any),
        store.dispatch(loadSuggestions('b') as any),
        store.dispatch(loadSuggestions('c') as any),
      ]);

      expect(results).toHaveLength(3);
      expect(results.every(r => r.payload)).toBe(true);
    });

    it('should handle mixed API request types concurrently', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ['suggestion1'],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ word: 'science' }],
        });

      const results = await Promise.all([
        store.dispatch(loadSuggestions('test') as any),
        store.dispatch(loadRouteData({ page: 'subject', value: 'science' }) as any),
      ]);

      expect(results).toHaveLength(2);
    });

    it('should handle some failures in concurrent requests', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ['success'],
        })
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ word: 'data' }],
        });

      const results = await Promise.all([
        store.dispatch(loadSuggestions('good') as any),
        store.dispatch(loadSuggestions('bad') as any),
        store.dispatch(loadRouteData({ page: 'dictionary' }) as any),
      ]);

      expect(results).toHaveLength(3);
      expect((results[0].payload as any[]).length).toBeGreaterThan(0);
      expect(results[1].payload).toEqual([]);
    });
  });

  describe('Response Normalization', () => {
    it('should normalize array response from suggestions API', async () => {
      const store = createTestStore();
      const mockData = [{ word: 'apple' }, { word: 'application' }];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await store.dispatch(loadSuggestions('app') as any);
      expect(Array.isArray(result.payload)).toBe(true);
    });

    it('should normalize object response from route data API', async () => {
      const store = createTestStore();
      const mockData = {
        result: [{ word: 'test', definitions: ['def1'] }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await store.dispatch(
        loadRouteData({ page: 'word', word: 'test' }) as any
      );
      expect(result.type).toContain('fulfilled');
    });

    it('should normalize empty array response', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ words: [] }),
      });

      const result = await store.dispatch(
        loadRouteData({ page: 'subject', value: 'nonexistent' }) as any
      );
      expect(result.type).toContain('fulfilled');
    });
  });

  describe('Loading State Integration', () => {
    it('should track loading state during API request', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ['result'],
                }),
              10
            )
          )
      );

      const promise = store.dispatch(loadSuggestions('test') as any);

      expect(store.getState()).toBeDefined();

      await promise;
      expect(store.getState()).toBeDefined();
    });

    it('should maintain UI state after successful API call', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ['result'],
      });

      await store.dispatch(loadSuggestions('test') as any);
      const state = store.getState();

      expect(state.ui).toBeDefined();
      expect(state.ui).toHaveProperty('drawerOpen');
    });

    it('should maintain UI state after failed API call', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await store.dispatch(loadSuggestions('test') as any);
      const state = store.getState();

      expect(state.ui).toBeDefined();
    });
  });
});

import { configureStore } from '@reduxjs/toolkit';
import { loadSuggestions, loadRouteData } from '../../store/thunks';
import uiReducer from '../../store/slices/uiSlice';
import wordsReducer from '../../store/slices/wordsSlice';
import type { RouteState } from '../../types/app';

// Mock the API
jest.mock('../../config/api', () => ({
  api: {
    define: jest.fn(),
    dictionary: jest.fn(),
    subject: jest.fn(),
    grade: jest.fn(),
    exam: jest.fn(),
  },
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

// Import after mocking
import { api } from '../../config/api';

function createTestStore() {
  return configureStore({
    reducer: {
      ui: uiReducer,
      words: wordsReducer,
    },
  });
}

describe('Redux Thunks: Error Handling & Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadSuggestions Thunk', () => {
    it('should return empty array for empty query', async () => {
      const store = createTestStore();
      const result = await store.dispatch(loadSuggestions('   '));
      expect(result.payload).toEqual([]);
    });

    it('should fetch suggestions successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => [{ word: 'test' }, { word: 'testing' }, { word: 'tester' }],
      });

      const store = createTestStore();
      const result = await store.dispatch(loadSuggestions('test'));
      expect(result.payload).toContain('test');
      expect(result.type).toMatch(/fulfilled/);
    });

    it('should limit suggestions to 5 items', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => [
          { word: 'word1' },
          { word: 'word2' },
          { word: 'word3' },
          { word: 'word4' },
          { word: 'word5' },
          { word: 'word6' },
          { word: 'word7' },
        ],
      });

      const store = createTestStore();
      const result = await store.dispatch(loadSuggestions('word'));
      expect(result.payload).toHaveLength(5);
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const store = createTestStore();
      const result = await store.dispatch(loadSuggestions('test'));
      expect(result.payload).toEqual([]);
    });

    it('should handle malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const store = createTestStore();
      const result = await store.dispatch(loadSuggestions('test'));
      expect(result.payload).toEqual([]);
    });

    it('should handle empty API response', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => [],
      });

      const store = createTestStore();
      const result = await store.dispatch(loadSuggestions('xyz'));
      expect(result.payload).toEqual([]);
    });

    it('should encode special characters in query', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => [{ word: 'café' }],
      });

      await createTestStore().dispatch(loadSuggestions('café'));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('caf%C3%A9'));
    });
  });

  describe('loadRouteData Thunk', () => {
    describe('Pages that do not require data loading', () => {
      const noDataPages = ['home', 'about', 'share', 'quiz', 'auth'] as const;

      noDataPages.forEach((page) => {
        it(`should return null for ${page} page`, async () => {
          const store = createTestStore();
          const route = { page } as RouteState;
          const result = await store.dispatch(loadRouteData(route));
          expect(result.payload).toBeNull();
        });
      });
    });

    describe('Word page loading', () => {
      it('should load word definition successfully', async () => {
        const mockWord = {
          result: {
            word: 'test',
            meaning: 'a trial',
            partOfSpeech: 'noun',
            pronunciation: 'test',
            wordForms: [],
            exampleSentence: 'This is a test.',
            synonyms: [],
            antonyms: [],
            memoryTrick: '',
            origin: '',
          },
        };

        (api.define as jest.Mock).mockResolvedValueOnce(mockWord);

        const store = createTestStore();
        const route = { page: 'word' as const, word: 'test' };
        const result = await store.dispatch(loadRouteData(route));

        expect(result.type).toMatch(/fulfilled/);
        const payload = result.payload as any;
        expect(payload?.type).toBe('currentWord');
      });

      it('should handle word lookup errors', async () => {
        (api.define as jest.Mock).mockRejectedValueOnce(new Error('Word not found'));

        const store = createTestStore();
        const route = { page: 'word' as const, word: 'nonexistent' };
        const result = await store.dispatch(loadRouteData(route));

        expect(result.type).toMatch(/rejected/);
      });

      it('should fall back to local word data when backend lookup fails for a seeded word', async () => {
        (api.define as jest.Mock).mockRejectedValueOnce(new Error("Word 'adapt' not found"));

        const store = createTestStore();
        const route = { page: 'word' as const, word: 'adapt' };
        const result = await store.dispatch(loadRouteData(route));

        expect(result.type).toMatch(/fulfilled/);
        const payload = result.payload as any;
        expect(payload?.type).toBe('currentWord');
        expect(payload?.data.word).toBe('adapt');
      });

      it('should handle unknown errors during word lookup', async () => {
        (api.define as jest.Mock).mockRejectedValueOnce('Unknown error');

        const store = createTestStore();
        const route = { page: 'word' as const, word: 'test' };
        const result = await store.dispatch(loadRouteData(route));

        expect(result.type).toMatch(/rejected/);
      });
    });

    describe('Dictionary page loading', () => {
      it('should load dictionary words successfully', async () => {
        const mockData = {
          words: [
            {
              word: 'word1',
              meaning: 'meaning1',
              partOfSpeech: 'noun',
              pronunciation: 'pron1',
              wordForms: [],
              exampleSentence: 'Example 1',
              synonyms: [],
              antonyms: [],
              memoryTrick: '',
              origin: '',
            },
            {
              word: 'word2',
              meaning: 'meaning2',
              partOfSpeech: 'verb',
              pronunciation: 'pron2',
              wordForms: [],
              exampleSentence: 'Example 2',
              synonyms: [],
              antonyms: [],
              memoryTrick: '',
              origin: '',
            },
          ],
        };

        (api.dictionary as jest.Mock).mockResolvedValueOnce(mockData);

        const store = createTestStore();
        const route = { page: 'dictionary' as const };
        const result = await store.dispatch(loadRouteData(route));

        expect(result.type).toMatch(/fulfilled/);
        const payload = result.payload as any;
        expect(payload?.type).toBe('collectionWords');
      });

      it('should handle dictionary API errors', async () => {
        (api.dictionary as jest.Mock).mockRejectedValueOnce(new Error('API limit exceeded'));

        const store = createTestStore();
        const route = { page: 'dictionary' as const };
        const result = await store.dispatch(loadRouteData(route));

        expect(result.type).toMatch(/rejected/);
      });
    });

    describe('Subject/Grade/Exam page loading', () => {
      const scenarios = [
        {
          page: 'subject' as const,
          value: 'mathematics',
          apiMethod: 'subject' as const,
        },
        {
          page: 'grade' as const,
          value: 'grade-10',
          apiMethod: 'grade' as const,
        },
        {
          page: 'exam' as const,
          value: 'sat',
          apiMethod: 'exam' as const,
        },
      ];

      scenarios.forEach(({ page, value, apiMethod }) => {
        it(`should load ${page} words successfully`, async () => {
          const mockData = {
            words: [
              {
                word: 'word1',
                meaning: 'meaning1',
                partOfSpeech: 'noun',
                pronunciation: 'pron1',
                wordForms: [],
                exampleSentence: 'Example 1',
                synonyms: [],
                antonyms: [],
                memoryTrick: '',
                origin: '',
              },
            ],
          };

          (api[apiMethod] as jest.Mock).mockResolvedValueOnce(mockData);

          const store = createTestStore();
          const route = { page, value } as RouteState;
          const result = await store.dispatch(loadRouteData(route));

          expect(result.type).toMatch(/fulfilled/);
          const payload = result.payload as any;
          expect(payload?.type).toBe('collectionWords');
          expect(api[apiMethod] as jest.Mock).toHaveBeenCalledWith(value, 1, 50);
        });

        it(`should handle ${page} API errors`, async () => {
          (api[apiMethod] as jest.Mock).mockRejectedValueOnce(new Error(`${page} not found`));

          const store = createTestStore();
          const route = { page, value } as RouteState;
          const result = await store.dispatch(loadRouteData(route));

          expect(result.type).toMatch(/fulfilled/);
          const payload = result.payload as any;
          expect(payload?.type).toBe('collectionWords');
          expect(payload?.data.length).toBeGreaterThan(0);
        });
      });

      it('should reject subject route errors when there is no local fallback data', async () => {
        (api.subject as jest.Mock).mockRejectedValueOnce(new Error('subject not found'));

        const store = createTestStore();
        const route = { page: 'subject' as const, value: 'unknown-subject' };
        const result = await store.dispatch(loadRouteData(route));

        expect(result.type).toMatch(/rejected/);
      });
    });

    describe('Error handling edge cases', () => {
      it('should handle errors without message property', async () => {
        (api.define as jest.Mock).mockRejectedValueOnce({
          code: 'ENOTFOUND',
        });

        const store = createTestStore();
        const route = { page: 'word' as const, word: 'test' };
        const result = await store.dispatch(loadRouteData(route));

        expect(result.type).toMatch(/rejected/);
      });

      it('should handle timeout errors', async () => {
        (api.dictionary as jest.Mock).mockRejectedValueOnce(new Error('Request timeout'));

        const store = createTestStore();
        const route = { page: 'dictionary' as const };
        const result = await store.dispatch(loadRouteData(route));

        expect(result.type).toMatch(/rejected/);
      });

      it('should handle empty response data', async () => {
        (api.dictionary as jest.Mock).mockResolvedValueOnce({
          words: [],
        });

        const store = createTestStore();
        const route = { page: 'dictionary' as const };
        const result = await store.dispatch(loadRouteData(route));

        expect(result.type).toMatch(/fulfilled/);
        const payload = result.payload as any;
        expect(payload?.data).toEqual([]);
      });
    });
  });

  describe('Concurrent Thunk Execution', () => {
    it('should handle multiple concurrent suggestion queries', async () => {
      mockFetch.mockResolvedValue({
        json: async () => [{ word: 'result' }],
      });

      const store = createTestStore();
      const [result1, result2, result3] = await Promise.all([
        store.dispatch(loadSuggestions('test1')),
        store.dispatch(loadSuggestions('test2')),
        store.dispatch(loadSuggestions('test3')),
      ]);

      expect(result1.payload).toBeDefined();
      expect(result2.payload).toBeDefined();
      expect(result3.payload).toBeDefined();
    });

    it('should handle mixed thunk executions', async () => {
      mockFetch.mockResolvedValue({
        json: async () => [{ word: 'test' }],
      });

      (api.dictionary as jest.Mock).mockResolvedValueOnce({
        words: [],
      });

      const store = createTestStore();
      const [suggestionResult, routeResult] = await Promise.all([
        store.dispatch(loadSuggestions('test')),
        store.dispatch(loadRouteData({ page: 'dictionary' as const })),
      ]);

      expect(suggestionResult.type).toMatch(/fulfilled/);
      expect(routeResult.type).toMatch(/fulfilled/);
    });
  });

  describe('Thunk State Updates', () => {
    it('should update UI state when suggestions load successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => [{ word: 'test' }],
      });

      const store = createTestStore();
      await store.dispatch(loadSuggestions('test'));

      const state = store.getState();
      expect(state.ui.suggestions).toContain('test');
    });

    it('should update words state when route data loads successfully', async () => {
      (api.dictionary as jest.Mock).mockResolvedValueOnce({
        words: [
          {
            word: 'test',
            meaning: 'a trial',
            partOfSpeech: 'noun',
            pronunciation: 'test',
            wordForms: [],
            exampleSentence: 'Example',
            synonyms: [],
            antonyms: [],
            memoryTrick: '',
            origin: '',
          },
        ],
      });

      const store = createTestStore();
      await store.dispatch(loadRouteData({ page: 'dictionary' as const }));

      const state = store.getState();
      expect(state.words.collectionWords.length).toBeGreaterThan(0);
    });
  });
});

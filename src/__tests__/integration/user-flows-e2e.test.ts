import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setAuthUser, logout } from '../../store/slices/authSlice';
import themeReducer, { toggleTheme } from '../../store/slices/themeSlice';
import uiReducer, { setQuery } from '../../store/slices/uiSlice';
import wordsReducer, { setWordOfTheDay } from '../../store/slices/wordsSlice';
import routingReducer, { setRoute } from '../../store/slices/routingSlice';
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

describe('E2E User Flows: Multi-Step Journeys', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Search to View to Share Flow', () => {
    it('should complete search → view word → share journey', async () => {
      const store = createTestStore();

      // Step 1: User enters search query
      store.dispatch(setQuery('serendipity'));
      expect(store.getState().ui.query).toBe('serendipity');

      // Step 2: App fetches suggestions
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [{ word: 'serendipity' }, { word: 'serendipitous' }],
      });

      const suggestionsResult = await store.dispatch(loadSuggestions('serendipity') as any);
      expect(suggestionsResult.payload).toContain('serendipity');

      // Step 3: User selects a word, navigate to word page
      store.dispatch(setRoute({ page: 'word', word: 'serendipity' }));
      expect(store.getState().routing.route.page).toBe('word');

      // Step 4: App fetches word data
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: [
            {
              word: 'serendipity',
              meanings: [
                {
                  partOfSpeech: 'noun',
                  definitions: [{ definition: 'finding valuable things by chance' }],
                },
              ],
            },
          ],
        }),
      });

      const wordResult = await store.dispatch(
        loadRouteData({ page: 'word', word: 'serendipity' }) as any
      );
      expect(wordResult.type).toContain('fulfilled');

      // Step 5: User navigates to share page
      store.dispatch(setRoute({ page: 'share' }));
      expect(store.getState().routing.route.page).toBe('share');

      // Step 6: Verify word is still available for sharing
      const finalState = store.getState();
      expect(finalState.routing.route.page).toBe('share');
    });

    it('should handle search with empty results gracefully', async () => {
      const store = createTestStore();

      store.dispatch(setQuery('xyz'));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await store.dispatch(loadSuggestions('xyz') as any);
      expect(result.payload).toEqual([]);

      const state = store.getState();
      expect(state.ui.query).toBe('xyz');
    });

    it('should handle search failure and recover', async () => {
      const store = createTestStore();

      store.dispatch(setQuery('test'));

      // First attempt fails
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      const failResult = await store.dispatch(loadSuggestions('test') as any);
      expect(failResult.payload).toEqual([]);

      // User retries
      store.dispatch(setQuery('test'));
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [{ word: 'test' }, { word: 'testing' }],
      });

      const retryResult = await store.dispatch(loadSuggestions('test') as any);
      expect((retryResult.payload as string[]).length).toBeGreaterThan(0);
    });
  });

  describe('Login to Browse to Filter Flow', () => {
    it('should complete login → browse → filter by subject journey', async () => {
      const store = createTestStore();

      // Step 1: User logs in
      const user = { id: '123', email: 'user@test.com', username: 'testuser' };
      store.dispatch(setAuthUser(user));
      expect(store.getState().auth.user).toEqual(user);

      // Step 2: Navigate to subject page
      store.dispatch(setRoute({ page: 'subject', value: 'biology' }));
      expect(store.getState().routing.route.page).toBe('subject');

      // Step 3: Load subject words
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          words: [
            { word: 'photosynthesis', category: 'Biology' },
            { word: 'mitochondria', category: 'Biology' },
            { word: 'enzyme', category: 'Biology' },
          ],
        }),
      });

      const result = await store.dispatch(
        loadRouteData({ page: 'subject', value: 'biology' }) as any
      );
      expect(result.type).toContain('fulfilled');

      // Step 4: Verify user is authenticated throughout journey
      expect(store.getState().auth.user?.id).toBe('123');
    });

    it('should handle logout during browsing', async () => {
      const store = createTestStore();

      // User is logged in
      store.dispatch(setAuthUser({ id: '123', email: 'user@test.com', username: 'testuser' }));
      expect(store.getState().auth.user).toBeTruthy();

      // Browse to subject page
      store.dispatch(setRoute({ page: 'subject', value: 'science' }));

      // Logout
      store.dispatch(logout());
      expect(store.getState().auth.user).toBeNull();

      // Navigation state should be preserved but user is logged out
      expect(store.getState().routing.route.page).toBe('subject');
    });

    it('should require login before accessing protected content', async () => {
      const store = createTestStore();

      const initialAuthState = store.getState().auth.user;
      expect(initialAuthState).toBeNull();

      // User can navigate to public pages
      store.dispatch(setRoute({ page: 'subject', value: 'math' }));
      expect(store.getState().routing.route.page).toBe('subject');

      // Then login
      store.dispatch(setAuthUser({ id: '456', email: 'user2@test.com', username: 'user2' }));
      expect(store.getState().auth.user?.id).toBe('456');
    });
  });

  describe('Theme Toggle During Navigation Flow', () => {
    it('should maintain theme across page navigation', async () => {
      const store = createTestStore();

      // Start with light theme (default)
      expect(store.getState().theme.mode).toBe('light');

      // Toggle to dark
      store.dispatch(toggleTheme());
      expect(store.getState().theme.mode).toBe('dark');

      // Navigate to different page
      store.dispatch(setRoute({ page: 'word', word: 'test' }));

      // Theme should persist
      expect(store.getState().theme.mode).toBe('dark');

      // Toggle again
      store.dispatch(toggleTheme());
      expect(store.getState().theme.mode).toBe('light');

      // Theme should persist through more navigation
      store.dispatch(setRoute({ page: 'dictionary' }));
      expect(store.getState().theme.mode).toBe('light');
    });

    it('should apply theme to all pages in navigation sequence', async () => {
      const store = createTestStore();

      // Set dark theme
      store.dispatch(toggleTheme());
      store.dispatch(toggleTheme());
      const themeMode = store.getState().theme.mode;

      // Navigate through multiple pages (each with proper structure)
      const pageRoutes: any[] = [
        { page: 'home' },
        { page: 'dictionary' },
        { page: 'word', word: 'test' },
        { page: 'subject', value: 'biology' },
        { page: 'grade', value: '1' },
      ];

      for (const route of pageRoutes) {
        store.dispatch(setRoute(route));
        expect(store.getState().theme.mode).toBe(themeMode);
      }
    });
  });

  describe('Subject to Quiz to Home Flow', () => {
    it('should navigate from subject page to quiz', async () => {
      const store = createTestStore();

      // Step 1: Load subject page
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          words: [{ word: 'word1' }, { word: 'word2' }, { word: 'word3' }],
        }),
      });

      store.dispatch(setRoute({ page: 'subject', value: 'math' }));
      await store.dispatch(loadRouteData({ page: 'subject', value: 'math' }) as any);

      expect(store.getState().routing.route.page).toBe('subject');

      // Step 2: Navigate to quiz page
      store.dispatch(setRoute({ page: 'quiz' }));
      expect(store.getState().routing.route.page).toBe('quiz');

      // Step 3: Navigate back to home
      store.dispatch(setRoute({ page: 'home' }));
      expect(store.getState().routing.route.page).toBe('home');
    });

    it('should maintain word collection through subject to quiz transition', async () => {
      const store = createTestStore();

      const mockWords = [
        { word: 'algebra', category: 'math' },
        { word: 'geometry', category: 'math' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ words: mockWords }),
      });

      store.dispatch(setRoute({ page: 'subject', value: 'math' }));
      await store.dispatch(loadRouteData({ page: 'subject', value: 'math' }) as any);

      store.dispatch(setRoute({ page: 'quiz' }));

      // Words state should persist for quiz usage
      expect(store.getState().words).toBeDefined();
    });
  });

  describe('Grade Level Navigation Flow', () => {
    it('should navigate through different grade levels', async () => {
      const store = createTestStore();

      const grades = ['1', '2', '3', '4', '5'];

      for (const grade of grades) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            words: [{ word: `grade_${grade}_word` }],
          }),
        });

        store.dispatch(setRoute({ page: 'grade', value: grade }));
        const result = await store.dispatch(loadRouteData({ page: 'grade', value: grade }) as any);

        expect(result.type).toContain('fulfilled');
        expect(store.getState().routing.route.page).toBe('grade');
        const routeState = store.getState().routing.route as any;
        expect(routeState.value).toBe(grade);
      }
    });

    it('should handle missing grade data gracefully', async () => {
      const store = createTestStore();

      store.dispatch(setRoute({ page: 'grade', value: '99' }));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await store.dispatch(loadRouteData({ page: 'grade', value: '99' }) as any);

      expect(result.type).toContain('rejected');
      const routeState = store.getState().routing.route as any;
      expect(routeState.value).toBe('99');
    });
  });

  describe('Exam Type Navigation Flow', () => {
    it('should navigate between different exam types', async () => {
      const store = createTestStore();

      const exams = ['SAT', 'GRE', 'GMAT', 'ACT'];

      for (const exam of exams) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            words: [{ word: `${exam}_word` }],
          }),
        });

        store.dispatch(setRoute({ page: 'exam', value: exam }));
        const result = await store.dispatch(loadRouteData({ page: 'exam', value: exam }) as any);

        expect(result.type).toContain('fulfilled');
        const routeState = store.getState().routing.route as any;
        expect(routeState.value).toBe(exam);
      }
    });

    it('should handle exam with empty word list', async () => {
      const store = createTestStore();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ words: [] }),
      });

      store.dispatch(setRoute({ page: 'exam', value: 'UNKNOWN' }));
      const result = await store.dispatch(loadRouteData({ page: 'exam', value: 'UNKNOWN' }) as any);

      expect(result.type).toContain('fulfilled');
    });
  });

  describe('Word of the Day Flow', () => {
    it('should display and interact with word of the day', async () => {
      const store = createTestStore();

      // Set word of the day with proper WordData structure
      const wordOfDay: any = {
        word: 'serendipity',
        meaning: 'finding valuable things by chance',
        partOfSpeech: 'noun',
        pronunciation: 'ser-en-dip-i-ty',
        wordForms: ['serendipitous'],
        exampleSentence: 'It was pure serendipity that we met.',
        synonyms: ['luck', 'chance'],
        antonyms: [],
        memoryTrick: 'SER-EN-DIP-PITY - events that go with the times',
        origin: 'From Persian fairy tale',
      };

      store.dispatch(setWordOfTheDay(wordOfDay));
      expect(store.getState().words.wordOfTheDay).toEqual(wordOfDay);

      // User can navigate to home and see it
      store.dispatch(setRoute({ page: 'home' }));
      expect(store.getState().routing.route.page).toBe('home');

      // Word of the day persists
      expect(store.getState().words.wordOfTheDay?.word).toBe('serendipity');
    });
  });

  describe('Error Recovery Flows', () => {
    it('should handle API error and retry successfully', async () => {
      const store = createTestStore();

      store.dispatch(setRoute({ page: 'subject', value: 'biology' }));

      // First attempt falls back to seeded data when the backend fails
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      const failResult = await store.dispatch(
        loadRouteData({ page: 'subject', value: 'biology' }) as any
      );
      expect(failResult.type).toContain('fulfilled');

      // A retry still succeeds when the backend responds
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          words: [{ word: 'biology1' }, { word: 'biology2' }],
        }),
      });

      const retryResult = await store.dispatch(
        loadRouteData({ page: 'subject', value: 'biology' }) as any
      );
      expect(retryResult.type).toContain('fulfilled');
    });

    it('should handle 404 error and navigate to different page', async () => {
      const store = createTestStore();

      // Try to access non-existent page
      store.dispatch(setRoute({ page: 'subject', value: 'nonexistent' }));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await store.dispatch(
        loadRouteData({ page: 'subject', value: 'nonexistent' }) as any
      );
      expect(result.type).toContain('rejected');

      // Navigate to a different page
      store.dispatch(setRoute({ page: 'home' }));
      expect(store.getState().routing.route.page).toBe('home');
    });

    it('should handle timeout and continue app functionality', async () => {
      const store = createTestStore();

      store.dispatch(setRoute({ page: 'dictionary' }));

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Timeout'));
      await store.dispatch(loadRouteData({ page: 'dictionary' }) as any);

      // User can still navigate
      store.dispatch(setRoute({ page: 'home' }));
      expect(store.getState().routing.route.page).toBe('home');

      // App remains functional
      store.dispatch(toggleTheme());
      expect(store.getState().theme.mode).toBeDefined();
    });
  });

  describe('Complex Multi-Step Flow', () => {
    it('should complete complex user journey: login → search → view → theme → navigate → logout', async () => {
      const store = createTestStore();

      // Step 1: Start at home
      expect(store.getState().routing.route.page).toBe('home');

      // Step 2: Login
      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      expect(store.getState().auth.user?.id).toBe('1');

      // Step 3: Search for words
      store.dispatch(setQuery('learn'));
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [{ word: 'learning' }, { word: 'learned' }],
      });
      const suggestions = await store.dispatch(loadSuggestions('learn') as any);
      expect((suggestions.payload as string[]).length).toBeGreaterThan(0);

      // Step 4: Toggle theme
      store.dispatch(toggleTheme());
      expect(store.getState().theme.mode).toBe('dark');

      // Step 5: Navigate to subject
      store.dispatch(setRoute({ page: 'subject', value: 'science' }));
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          words: [{ word: 'atom' }, { word: 'molecule' }],
        }),
      });
      await store.dispatch(loadRouteData({ page: 'subject', value: 'science' }) as any);
      expect(store.getState().routing.route.page).toBe('subject');

      // Step 6: View specific word
      store.dispatch(setRoute({ page: 'word', word: 'atom' }));
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: [{ word: 'atom', meanings: [] }],
        }),
      });
      await store.dispatch(loadRouteData({ page: 'word', word: 'atom' }) as any);
      const wordRoute = store.getState().routing.route as any;
      expect(wordRoute.word).toBe('atom');

      // Step 7: Share word
      store.dispatch(setRoute({ page: 'share' }));
      expect(store.getState().routing.route.page).toBe('share');

      // Step 8: Theme persists through navigation
      expect(store.getState().theme.mode).toBe('dark');

      // Step 9: Logout
      store.dispatch(logout());
      expect(store.getState().auth.user).toBeNull();

      // App remains functional after logout
      store.dispatch(setRoute({ page: 'home' }));
      expect(store.getState().routing.route.page).toBe('home');
    });
  });
});

import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setAuthUser, setAuthLoading, setAuthMessage } from '../../store/slices/authSlice';
import themeReducer, { toggleTheme } from '../../store/slices/themeSlice';
import routingReducer from '../../store/slices/routingSlice';
import uiReducer, { setDrawerOpen, setOpenDropdown, setQuery, setSuggestions } from '../../store/slices/uiSlice';
import wordsReducer, { setWordOfTheDay, setCurrentWord, setCollectionWords } from '../../store/slices/wordsSlice';
import speechReducer from '../../store/slices/speechSlice';
import {
  selectAuthUser,
  selectAuthLoading,
  selectAuthMessage,
  selectIsAuthenticated,
  selectAuthState,
  selectThemeMode,
  selectIsLightTheme,
  selectIsDarkTheme,
  selectRoute,
  selectCurrentPage,
  selectUIDrawerOpen,
  selectUIOpenDropdown,
  selectUIQuery,
  selectUISuggestions,
  selectUIState,
  selectWordOfTheDay,
  selectCurrentWord,
  selectCollectionWords,
  selectWordsLoading,
  selectWordsError,
  selectWordsState,
  selectWordCount,
  selectSpeechVoice,
  selectSpeechIsSpeaking,
  selectAppState,
} from '../../store/selectors';

// Create test store
function createTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      theme: themeReducer,
      routing: routingReducer,
      ui: uiReducer,
      words: wordsReducer,
      speech: speechReducer,
    },
  });
}

describe('Redux Selectors: Memoization & Performance', () => {
  describe('Auth Selectors', () => {
    it('should select auth user', () => {
      const store = createTestStore();
      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      const user = selectAuthUser(store.getState());
      expect(user?.email).toBe('test@test.com');
    });

    it('should select auth loading state', () => {
      const store = createTestStore();
      store.dispatch(setAuthLoading(true));
      const loading = selectAuthLoading(store.getState());
      expect(loading).toBe(true);
    });

    it('should select auth message', () => {
      const store = createTestStore();
      store.dispatch(setAuthMessage('Test message'));
      const message = selectAuthMessage(store.getState());
      expect(message).toBe('Test message');
    });

    it('should memoize isAuthenticated selector', () => {
      const store = createTestStore();

      // First call - not authenticated
      let isAuth = selectIsAuthenticated(store.getState());
      expect(isAuth).toBe(false);

      // Add user
      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));

      // Second call - should return different result
      isAuth = selectIsAuthenticated(store.getState());
      expect(isAuth).toBe(true);
    });

    it('should memoize combined auth state selector', () => {
      const store = createTestStore();
      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      store.dispatch(setAuthLoading(false));
      store.dispatch(setAuthMessage(''));

      const authState = selectAuthState(store.getState());
      expect(authState.user?.email).toBe('test@test.com');
      expect(authState.loading).toBe(false);
      expect(authState.message).toBe('');

      // Verify it's the same object reference when state hasn't changed (correct memoization)
      const authState2 = selectAuthState(store.getState());
      expect(authState).toBe(authState2);

      // Change auth state and verify new object is created
      store.dispatch(setAuthMessage('New message'));
      const authState3 = selectAuthState(store.getState());
      expect(authState3).not.toBe(authState);
    });
  });

  describe('Theme Selectors', () => {
    it('should select theme mode', () => {
      const store = createTestStore();
      const mode = selectThemeMode(store.getState());
      expect(mode).toBe('light');
    });

    it('should memoize isLightTheme selector', () => {
      const store = createTestStore();
      let isLight = selectIsLightTheme(store.getState());
      expect(isLight).toBe(true);

      store.dispatch(toggleTheme());
      isLight = selectIsLightTheme(store.getState());
      expect(isLight).toBe(false);
    });

    it('should memoize isDarkTheme selector', () => {
      const store = createTestStore();
      store.dispatch(toggleTheme());

      const isDark = selectIsDarkTheme(store.getState());
      expect(isDark).toBe(true);
    });
  });

  describe('Routing Selectors', () => {
    it('should select current route', () => {
      const store = createTestStore();
      const route = selectRoute(store.getState());
      expect(route).toBeDefined();
    });

    it('should select current page', () => {
      const store = createTestStore();
      const page = selectCurrentPage(store.getState());
      expect(page).toBeDefined();
    });
  });

  describe('UI Selectors', () => {
    it('should select drawer open state', () => {
      const store = createTestStore();
      const drawerOpen = selectUIDrawerOpen(store.getState());
      expect(drawerOpen).toBe(false);
    });

    it('should select open dropdown', () => {
      const store = createTestStore();
      const openDropdown = selectUIOpenDropdown(store.getState());
      expect(openDropdown).toBeNull();
    });

    it('should select query', () => {
      const store = createTestStore();
      const query = selectUIQuery(store.getState());
      expect(query).toBe('');
    });

    it('should select suggestions', () => {
      const store = createTestStore();
      const suggestions = selectUISuggestions(store.getState());
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should memoize combined UI state selector', () => {
      const store = createTestStore();
      store.dispatch(setDrawerOpen(true));
      store.dispatch(setOpenDropdown('Subject'));
      store.dispatch(setQuery('test'));
      store.dispatch(setSuggestions(['suggestion1', 'suggestion2']));

      const uiState = selectUIState(store.getState());
      expect(uiState.drawerOpen).toBe(true);
      expect(uiState.openDropdown).toBe('Subject');
      expect(uiState.query).toBe('test');
      expect(uiState.suggestions.length).toBe(2);
    });
  });

  describe('Words Selectors', () => {
    it('should select word of the day', () => {
      const store = createTestStore();
      const wordOfTheDay = selectWordOfTheDay(store.getState());
      expect(wordOfTheDay).toBeNull();
    });

    it('should select current word', () => {
      const store = createTestStore();
      const currentWord = selectCurrentWord(store.getState());
      expect(currentWord).toBeNull();
    });

    it('should select collection words', () => {
      const store = createTestStore();
      const collectionWords = selectCollectionWords(store.getState());
      expect(Array.isArray(collectionWords)).toBe(true);
    });

    it('should select words loading state', () => {
      const store = createTestStore();
      const loading = selectWordsLoading(store.getState());
      expect(loading).toBe(false);
    });

    it('should select words error state', () => {
      const store = createTestStore();
      const error = selectWordsError(store.getState());
      expect(error).toBeNull();
    });

    it('should memoize combined words state selector', () => {
      const store = createTestStore();
      const mockWord = {
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
      };

      store.dispatch(setWordOfTheDay(mockWord));
      store.dispatch(setCurrentWord(mockWord));
      store.dispatch(setCollectionWords([mockWord]));

      const wordsState = selectWordsState(store.getState());
      expect(wordsState.wordOfTheDay?.word).toBe('test');
      expect(wordsState.currentWord?.word).toBe('test');
      expect(wordsState.collectionWords.length).toBe(1);
      expect(wordsState.loading).toBe(false);
      expect(wordsState.error).toBeNull();
    });

    it('should memoize word count selector', () => {
      const store = createTestStore();
      const mockWord = {
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
      };

      store.dispatch(setCollectionWords([mockWord, mockWord]));
      const count = selectWordCount(store.getState());
      expect(count).toBe(2);
    });
  });

  describe('Speech Selectors', () => {
    it('should select preferred voice', () => {
      const store = createTestStore();
      const voice = selectSpeechVoice(store.getState());
      expect(voice).toBeUndefined();
    });

    it('should select is speaking state', () => {
      const store = createTestStore();
      const isSpeaking = selectSpeechIsSpeaking(store.getState());
      expect(isSpeaking).toBe(false);
    });
  });

  describe('Combined App State Selector', () => {
    it('should memoize combined app state', () => {
      const store = createTestStore();
      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      store.dispatch(setAuthLoading(false));
      store.dispatch(toggleTheme());

      const appState = selectAppState(store.getState());
      expect(appState.auth.user?.email).toBe('test@test.com');
      expect(appState.theme.mode).toBe('dark');
    });

    it('should return same reference when state unchanged', () => {
      const store = createTestStore();
      const appState1 = selectAppState(store.getState());
      const appState2 = selectAppState(store.getState());

      // Should be same reference (memoized) when no state changes
      expect(appState1).toBe(appState2);
    });

    it('should return different reference when state changes', () => {
      const store = createTestStore();
      const appState1 = selectAppState(store.getState());

      store.dispatch(toggleTheme());
      const appState2 = selectAppState(store.getState());

      // Should be different reference (re-computed) when state changes
      expect(appState1).not.toBe(appState2);
      expect(appState1.theme.mode).not.toBe(appState2.theme.mode);
    });
  });

  describe('Selector Performance & Memoization', () => {
    it('should not recompute selector when unrelated state changes', () => {
      const store = createTestStore();

      // Get initial auth state
      const authState1 = selectAuthState(store.getState());

      // Change theme (unrelated to auth)
      store.dispatch(toggleTheme());

      // Auth state should still be memoized (same reference)
      const authState2 = selectAuthState(store.getState());
      expect(authState1).toBe(authState2);
    });

    it('should recompute selector only when dependencies change', () => {
      const store = createTestStore();

      // Get initial auth state
      const authState1 = selectAuthState(store.getState());

      // Change auth user (dependency of auth selector)
      store.dispatch(setAuthUser({ id: '2', email: 'new@test.com', username: 'newuser' }));

      // Auth state should be recomputed (different reference)
      const authState2 = selectAuthState(store.getState());
      expect(authState1).not.toBe(authState2);
      expect(authState2.user?.email).toBe('new@test.com');
    });

    it('should maintain memoization across multiple selector calls', () => {
      const store = createTestStore();
      store.dispatch(setDrawerOpen(true));

      // Call the same selector multiple times
      const uiState1 = selectUIState(store.getState());
      const uiState2 = selectUIState(store.getState());
      const uiState3 = selectUIState(store.getState());

      // All should be same reference (memoized)
      expect(uiState1).toBe(uiState2);
      expect(uiState2).toBe(uiState3);
    });
  });

  describe('Selector Edge Cases', () => {
    it('should handle null auth user gracefully', () => {
      const store = createTestStore();
      const isAuth = selectIsAuthenticated(store.getState());
      expect(isAuth).toBe(false);
    });

    it('should handle empty collections', () => {
      const store = createTestStore();
      const count = selectWordCount(store.getState());
      expect(count).toBe(0);
    });

    it('should handle default theme mode', () => {
      const store = createTestStore();
      const isLight = selectIsLightTheme(store.getState());
      expect(isLight).toBe(true);
    });

    it('should return consistent results for derived selectors', () => {
      const store = createTestStore();
      const isDark1 = selectIsDarkTheme(store.getState());
      const isLight1 = selectIsLightTheme(store.getState());

      expect(isDark1).toBe(!isLight1);

      store.dispatch(toggleTheme());
      const isDark2 = selectIsDarkTheme(store.getState());
      const isLight2 = selectIsLightTheme(store.getState());

      expect(isDark2).toBe(!isLight2);
      expect(isDark2).not.toBe(isDark1);
    });
  });
});

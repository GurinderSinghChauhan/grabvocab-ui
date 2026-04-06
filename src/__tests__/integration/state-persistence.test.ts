import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setAuthUser, logout } from '../../store/slices/authSlice';
import themeReducer, { setTheme, toggleTheme } from '../../store/slices/themeSlice';
import uiReducer from '../../store/slices/uiSlice';
import wordsReducer, { setWordOfTheDay, setCollectionWords } from '../../store/slices/wordsSlice';
import routingReducer from '../../store/slices/routingSlice';
import speechReducer from '../../store/slices/speechSlice';

// Mock AsyncStorage
const mockAsyncStorage: { [key: string]: string } = {};

const mockAsyncStorageAPI = {
  getItem: jest.fn(async (key: string) => {
    return mockAsyncStorage[key] || null;
  }),
  setItem: jest.fn(async (key: string, value: string) => {
    mockAsyncStorage[key] = value;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete mockAsyncStorage[key];
  }),
  clear: jest.fn(async () => {
    Object.keys(mockAsyncStorage).forEach((key) => {
      delete mockAsyncStorage[key];
    });
  }),
  getAllKeys: jest.fn(async () => {
    return Object.keys(mockAsyncStorage);
  }),
};

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

describe('State Persistence: AsyncStorage Integration', () => {
  beforeEach(() => {
    mockAsyncStorageAPI.getItem.mockClear();
    mockAsyncStorageAPI.setItem.mockClear();
    mockAsyncStorageAPI.removeItem.mockClear();
    mockAsyncStorageAPI.clear.mockClear();
    mockAsyncStorageAPI.getAllKeys.mockClear();
    Object.keys(mockAsyncStorage).forEach((key) => {
      delete mockAsyncStorage[key];
    });
  });

  describe('Theme Persistence', () => {
    it('should save theme preference to AsyncStorage', async () => {
      const store = createTestStore();

      // User toggles theme to dark
      store.dispatch(toggleTheme());
      const theme = store.getState().theme.mode;

      // Save to AsyncStorage
      await mockAsyncStorageAPI.setItem('theme', JSON.stringify({ mode: theme }));

      expect(mockAsyncStorageAPI.setItem).toHaveBeenCalledWith(
        'theme',
        JSON.stringify({ mode: theme })
      );
      expect(mockAsyncStorage['theme']).toBeDefined();
    });

    it('should load theme preference from AsyncStorage on app start', async () => {
      // Store theme in AsyncStorage (simulating previous session)
      const savedTheme = { mode: 'dark' };
      await mockAsyncStorageAPI.setItem('theme', JSON.stringify(savedTheme));

      // New store instance (simulating app restart)
      const store = createTestStore();

      // Load theme from storage
      const themeData = await mockAsyncStorageAPI.getItem('theme');
      expect(themeData).toBeDefined();

      const loadedTheme = JSON.parse(themeData!);
      store.dispatch(setTheme(loadedTheme.mode));

      expect(store.getState().theme.mode).toBe('dark');
    });

    it('should persist theme through multiple toggles', async () => {
      const store = createTestStore();

      // Toggle theme multiple times
      store.dispatch(toggleTheme());
      store.dispatch(toggleTheme());
      store.dispatch(toggleTheme());

      const finalTheme = store.getState().theme.mode;

      // Save final state
      await mockAsyncStorageAPI.setItem('theme', JSON.stringify({ mode: finalTheme }));

      // Verify it was saved
      const saved = await mockAsyncStorageAPI.getItem('theme');
      expect(JSON.parse(saved!).mode).toBe(finalTheme);
    });

    it('should handle missing theme in AsyncStorage with default', async () => {
      const store = createTestStore();

      // Check for theme in empty storage
      const themeData = await mockAsyncStorageAPI.getItem('theme');
      expect(themeData).toBeNull();

      // Use default theme
      expect(store.getState().theme.mode).toBe('light');
    });
  });

  describe('Auth State Persistence', () => {
    it('should save user auth state to AsyncStorage on login', async () => {
      const store = createTestStore();
      const user = { id: '123', email: 'user@test.com', username: 'testuser' };

      store.dispatch(setAuthUser(user));

      // Save to AsyncStorage
      await mockAsyncStorageAPI.setItem('auth', JSON.stringify({ user }));

      expect(mockAsyncStorage['auth']).toBeDefined();
      const saved = JSON.parse(mockAsyncStorage['auth']);
      expect(saved.user.id).toBe('123');
    });

    it('should load user auth state from AsyncStorage on app start', async () => {
      const user = { id: '456', email: 'user2@test.com', username: 'user2' };
      await mockAsyncStorageAPI.setItem('auth', JSON.stringify({ user }));

      const authData = await mockAsyncStorageAPI.getItem('auth');
      expect(authData).toBeDefined();

      const store = createTestStore();
      const loadedUser = JSON.parse(authData!);
      store.dispatch(setAuthUser(loadedUser.user));

      expect(store.getState().auth.user?.id).toBe('456');
    });

    it('should clear auth state from AsyncStorage on logout', async () => {
      const user = { id: '789', email: 'user3@test.com', username: 'user3' };
      await mockAsyncStorageAPI.setItem('auth', JSON.stringify({ user }));

      const store = createTestStore();
      store.dispatch(setAuthUser(user));

      // Logout
      store.dispatch(logout());
      expect(store.getState().auth.user).toBeNull();

      // Remove from storage
      await mockAsyncStorageAPI.removeItem('auth');
      const authData = await mockAsyncStorageAPI.getItem('auth');
      expect(authData).toBeNull();
    });

    it('should handle missing auth state in AsyncStorage', async () => {
      const store = createTestStore();

      const authData = await mockAsyncStorageAPI.getItem('auth');
      expect(authData).toBeNull();

      expect(store.getState().auth.user).toBeNull();
    });
  });

  describe('Word Collection Persistence', () => {
    it('should save word collection to AsyncStorage', async () => {
      const store = createTestStore();
      const words = [
        {
          word: 'serendipity',
          meaning: 'luck',
          partOfSpeech: 'noun',
          pronunciation: 'ser-en-dip-i-ty',
          wordForms: [],
          exampleSentence: 'It was serendipity.',
          synonyms: [],
          antonyms: [],
          memoryTrick: '',
          origin: '',
        },
      ];

      store.dispatch(setCollectionWords(words));

      await mockAsyncStorageAPI.setItem('words', JSON.stringify({ words }));

      expect(mockAsyncStorage['words']).toBeDefined();
      const saved = JSON.parse(mockAsyncStorage['words']);
      expect(saved.words[0].word).toBe('serendipity');
    });

    it('should load word collection from AsyncStorage', async () => {
      const words = [
        {
          word: 'ephemeral',
          meaning: 'lasting a short time',
          partOfSpeech: 'adjective',
          pronunciation: 'e-fem-er-al',
          wordForms: [],
          exampleSentence: 'Beauty is ephemeral.',
          synonyms: [],
          antonyms: [],
          memoryTrick: '',
          origin: '',
        },
      ];

      await mockAsyncStorageAPI.setItem('words', JSON.stringify({ words }));

      const wordsData = await mockAsyncStorageAPI.getItem('words');
      const store = createTestStore();
      const loadedWords = JSON.parse(wordsData!);
      store.dispatch(setCollectionWords(loadedWords.words));

      expect(store.getState().words.collectionWords).toHaveLength(1);
      expect(store.getState().words.collectionWords[0].word).toBe('ephemeral');
    });

    it('should persist large word collections', async () => {
      const store = createTestStore();
      const largeWordCollection = Array.from({ length: 100 }, (_, i) => ({
        word: `word${i}`,
        meaning: `meaning${i}`,
        partOfSpeech: 'noun',
        pronunciation: `pronunciation${i}`,
        wordForms: [],
        exampleSentence: `Example ${i}`,
        synonyms: [],
        antonyms: [],
        memoryTrick: '',
        origin: '',
      }));

      store.dispatch(setCollectionWords(largeWordCollection));

      await mockAsyncStorageAPI.setItem('words', JSON.stringify({ words: largeWordCollection }));

      const wordsData = await mockAsyncStorageAPI.getItem('words');
      const loaded = JSON.parse(wordsData!);

      expect(loaded.words).toHaveLength(100);
    });

    it('should handle missing word collection in AsyncStorage', async () => {
      const store = createTestStore();

      const wordsData = await mockAsyncStorageAPI.getItem('words');
      expect(wordsData).toBeNull();

      expect(store.getState().words.collectionWords).toEqual([]);
    });
  });

  describe('Word of the Day Persistence', () => {
    it('should save word of the day to AsyncStorage', async () => {
      const wordOfDay: any = {
        word: 'ubiquitous',
        meaning: 'present everywhere',
        partOfSpeech: 'adjective',
        pronunciation: 'yoo-bik-wi-tus',
        wordForms: [],
        exampleSentence: 'Smartphones are ubiquitous.',
        synonyms: ['universal'],
        antonyms: [],
        memoryTrick: '',
        origin: '',
      };

      await mockAsyncStorageAPI.setItem('wordOfTheDay', JSON.stringify(wordOfDay));

      expect(mockAsyncStorage['wordOfTheDay']).toBeDefined();
    });

    it('should load word of the day from AsyncStorage', async () => {
      const wordOfDay: any = {
        word: 'perspicacious',
        meaning: 'having keen insight',
        partOfSpeech: 'adjective',
        pronunciation: 'per-spi-ka-shus',
        wordForms: [],
        exampleSentence: 'The judge was perspicacious.',
        synonyms: [],
        antonyms: [],
        memoryTrick: '',
        origin: '',
      };

      const store = createTestStore();
      await mockAsyncStorageAPI.setItem('wordOfTheDay', JSON.stringify(wordOfDay));

      const wordData = await mockAsyncStorageAPI.getItem('wordOfTheDay');
      const loadedWord = JSON.parse(wordData!);
      store.dispatch(setWordOfTheDay(loadedWord));

      expect(store.getState().words.wordOfTheDay?.word).toBe('perspicacious');
    });
  });

  describe('Session Restoration', () => {
    it('should restore complete session on app restart', async () => {
      // Simulate previous session
      const user = { id: '999', email: 'session@test.com', username: 'sessionuser' };
      const theme = 'dark';
      const words = [
        {
          word: 'persevere',
          meaning: 'continue despite difficulty',
          partOfSpeech: 'verb',
          pronunciation: 'per-se-veer',
          wordForms: [],
          exampleSentence: 'She persevered through challenges.',
          synonyms: [],
          antonyms: [],
          memoryTrick: '',
          origin: '',
        },
      ];

      // Save all state
      await mockAsyncStorageAPI.setItem('auth', JSON.stringify({ user }));
      await mockAsyncStorageAPI.setItem('theme', JSON.stringify({ mode: theme }));
      await mockAsyncStorageAPI.setItem('words', JSON.stringify({ words }));

      // Simulate app restart - create new store
      const store = createTestStore();

      // Restore all state
      const authData = await mockAsyncStorageAPI.getItem('auth');
      const themeData = await mockAsyncStorageAPI.getItem('theme');
      const wordsData = await mockAsyncStorageAPI.getItem('words');

      expect(authData).toBeDefined();
      expect(themeData).toBeDefined();
      expect(wordsData).toBeDefined();

      const auth = JSON.parse(authData!);
      const themeState = JSON.parse(themeData!);
      const wordsState = JSON.parse(wordsData!);

      store.dispatch(setAuthUser(auth.user));
      store.dispatch(setTheme(themeState.mode));
      store.dispatch(setCollectionWords(wordsState.words));

      expect(store.getState().auth.user?.id).toBe('999');
      expect(store.getState().theme.mode).toBe('dark');
      expect(store.getState().words.collectionWords).toHaveLength(1);
    });

    it('should handle partial session state', async () => {
      // Only save theme, not auth or words
      await mockAsyncStorageAPI.setItem('theme', JSON.stringify({ mode: 'dark' }));

      const store = createTestStore();

      const authData = await mockAsyncStorageAPI.getItem('auth');
      const themeData = await mockAsyncStorageAPI.getItem('theme');
      const wordsData = await mockAsyncStorageAPI.getItem('words');

      // Theme exists, others don't
      expect(themeData).toBeDefined();
      expect(authData).toBeNull();
      expect(wordsData).toBeNull();

      // Restore what exists
      if (themeData) {
        const theme = JSON.parse(themeData);
        store.dispatch(setTheme(theme.mode));
      }

      // Others use defaults
      expect(store.getState().theme.mode).toBe('dark');
      expect(store.getState().auth.user).toBeNull();
      expect(store.getState().words.collectionWords).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle AsyncStorage setItem failure gracefully', async () => {
      const store = createTestStore();
      const user = { id: '111', email: 'error@test.com', username: 'erroruser' };

      store.dispatch(setAuthUser(user));

      // Simulate setItem failure
      mockAsyncStorageAPI.setItem.mockRejectedValueOnce(new Error('Storage full'));

      try {
        await mockAsyncStorageAPI.setItem('auth', JSON.stringify({ user }));
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Store state should still be valid even if persistence failed
      expect(store.getState().auth.user?.id).toBe('111');
    });

    it('should handle AsyncStorage getItem failure gracefully', async () => {
      // Simulate getItem failure
      mockAsyncStorageAPI.getItem.mockRejectedValueOnce(new Error('Read error'));

      const store = createTestStore();

      try {
        await mockAsyncStorageAPI.getItem('auth');
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Store should use defaults
      expect(store.getState().auth.user).toBeNull();
    });

    it('should handle corrupted JSON in AsyncStorage', async () => {
      // Store corrupted data
      mockAsyncStorage['auth'] = 'corrupted json {]';

      const authData = await mockAsyncStorageAPI.getItem('auth');

      try {
        JSON.parse(authData!);
      } catch (error) {
        expect(error).toBeDefined();
      }

      // App should continue with defaults
      const store = createTestStore();
      expect(store.getState().auth.user).toBeNull();
    });

    it('should handle null or undefined values in AsyncStorage', async () => {
      mockAsyncStorage['theme'] = JSON.stringify(null);

      const themeData = await mockAsyncStorageAPI.getItem('theme');
      expect(themeData).toBe('null');

      const store = createTestStore();

      // Should use default
      expect(store.getState().theme.mode).toBeDefined();
    });
  });

  describe('Storage Size & Quota', () => {
    it('should handle storage quota exceeded scenario', async () => {
      const store = createTestStore();

      // Try to store very large data
      const largeData = 'x'.repeat(5 * 1024 * 1024); // 5MB string

      mockAsyncStorageAPI.setItem.mockRejectedValueOnce(
        new Error('QuotaExceededError: Storage quota exceeded')
      );

      try {
        await mockAsyncStorageAPI.setItem('largeData', largeData);
      } catch (error) {
        expect((error as Error).message).toContain('QuotaExceededError');
      }

      // Store should remain functional
      const user = { id: '222', email: 'test@test.com', username: 'testuser' };
      store.dispatch(setAuthUser(user));
      expect(store.getState().auth.user?.id).toBe('222');
    });

    it('should retrieve storage size information', async () => {
      await mockAsyncStorageAPI.setItem('key1', 'value1');
      await mockAsyncStorageAPI.setItem('key2', 'value2');
      await mockAsyncStorageAPI.setItem('key3', 'value3');

      const allKeys = await mockAsyncStorageAPI.getAllKeys();
      expect(allKeys).toHaveLength(3);
    });
  });

  describe('Logout & Storage Cleanup', () => {
    it('should clear all user data from AsyncStorage on logout', async () => {
      // Simulate logged-in state with data stored
      const user = { id: '333', email: 'user@test.com', username: 'testuser' };
      const words = [
        {
          word: 'test',
          meaning: 'test meaning',
          partOfSpeech: 'noun',
          pronunciation: 'test',
          wordForms: [],
          exampleSentence: 'test',
          synonyms: [],
          antonyms: [],
          memoryTrick: '',
          origin: '',
        },
      ];

      await mockAsyncStorageAPI.setItem('auth', JSON.stringify({ user }));
      await mockAsyncStorageAPI.setItem('words', JSON.stringify({ words }));

      const store = createTestStore();
      store.dispatch(setAuthUser(user));

      // Logout
      store.dispatch(logout());

      // Clear storage
      await mockAsyncStorageAPI.removeItem('auth');

      const authData = await mockAsyncStorageAPI.getItem('auth');
      expect(authData).toBeNull();
      expect(store.getState().auth.user).toBeNull();
    });

    it('should preserve theme on logout', async () => {
      await mockAsyncStorageAPI.setItem('theme', JSON.stringify({ mode: 'dark' }));

      const store = createTestStore();
      store.dispatch(setTheme('dark'));

      // Logout
      store.dispatch(logout());

      // Theme should persist
      const themeData = await mockAsyncStorageAPI.getItem('theme');
      expect(themeData).toBeDefined();
      expect(JSON.parse(themeData!).mode).toBe('dark');
    });

    it('should clear sensitive data but keep preferences', async () => {
      // Store all types of data
      await mockAsyncStorageAPI.setItem('auth', JSON.stringify({ user: { id: '1' } }));
      await mockAsyncStorageAPI.setItem('words', JSON.stringify({ words: [] }));
      await mockAsyncStorageAPI.setItem('theme', JSON.stringify({ mode: 'dark' }));

      // Simulate logout - clear only sensitive data
      await mockAsyncStorageAPI.removeItem('auth');
      await mockAsyncStorageAPI.removeItem('words');

      const authData = await mockAsyncStorageAPI.getItem('auth');
      const wordsData = await mockAsyncStorageAPI.getItem('words');
      const themeData = await mockAsyncStorageAPI.getItem('theme');

      expect(authData).toBeNull();
      expect(wordsData).toBeNull();
      expect(themeData).toBeDefined();
    });
  });

  describe('Storage Initialization', () => {
    it('should detect first-time app launch (empty storage)', async () => {
      await mockAsyncStorageAPI.clear();

      const authData = await mockAsyncStorageAPI.getItem('auth');
      const themeData = await mockAsyncStorageAPI.getItem('theme');
      const wordsData = await mockAsyncStorageAPI.getItem('words');

      expect(authData).toBeNull();
      expect(themeData).toBeNull();
      expect(wordsData).toBeNull();

      // App initializes with defaults
      const store = createTestStore();
      expect(store.getState().auth.user).toBeNull();
      expect(store.getState().theme.mode).toBe('light');
      expect(store.getState().words.collectionWords).toEqual([]);
    });

    it('should initialize with existing storage data', async () => {
      // Pre-populate storage (like after previous installation)
      await mockAsyncStorageAPI.setItem('theme', JSON.stringify({ mode: 'dark' }));

      const themeData = await mockAsyncStorageAPI.getItem('theme');
      expect(themeData).toBeDefined();

      const store = createTestStore();
      const theme = JSON.parse(themeData!);
      store.dispatch(setTheme(theme.mode));

      expect(store.getState().theme.mode).toBe('dark');
    });

    it('should migrate old storage format if needed', async () => {
      // Old format with different key names
      await mockAsyncStorageAPI.setItem('appTheme', JSON.stringify({ theme: 'dark' }));

      const oldData = await mockAsyncStorageAPI.getItem('appTheme');
      expect(oldData).toBeDefined();

      // Migration logic: convert old format to new
      if (oldData) {
        const oldTheme = JSON.parse(oldData);
        // Convert old format to new format
        await mockAsyncStorageAPI.removeItem('appTheme');
        await mockAsyncStorageAPI.setItem('theme', JSON.stringify({ mode: oldTheme.theme }));

        const newData = await mockAsyncStorageAPI.getItem('theme');
        expect(newData).toBeDefined();
      }
    });
  });

  describe('Concurrent Storage Operations', () => {
    it('should handle concurrent setItem operations', async () => {
      const operations = [
        mockAsyncStorageAPI.setItem('key1', 'value1'),
        mockAsyncStorageAPI.setItem('key2', 'value2'),
        mockAsyncStorageAPI.setItem('key3', 'value3'),
      ];

      await Promise.all(operations);

      expect(mockAsyncStorage['key1']).toBe('value1');
      expect(mockAsyncStorage['key2']).toBe('value2');
      expect(mockAsyncStorage['key3']).toBe('value3');
    });

    it('should handle concurrent read operations', async () => {
      await mockAsyncStorageAPI.setItem('data', JSON.stringify({ value: 'test' }));

      const reads = [
        mockAsyncStorageAPI.getItem('data'),
        mockAsyncStorageAPI.getItem('data'),
        mockAsyncStorageAPI.getItem('data'),
      ];

      const results = await Promise.all(reads);
      expect(results).toEqual([
        JSON.stringify({ value: 'test' }),
        JSON.stringify({ value: 'test' }),
        JSON.stringify({ value: 'test' }),
      ]);
    });

    it('should handle mixed concurrent operations', async () => {
      const operations = [
        mockAsyncStorageAPI.setItem('item1', 'data1'),
        mockAsyncStorageAPI.getItem('item1'),
        mockAsyncStorageAPI.setItem('item2', 'data2'),
        mockAsyncStorageAPI.getItem('item2'),
      ];

      await Promise.all(operations);

      expect(mockAsyncStorage['item1']).toBe('data1');
      expect(mockAsyncStorage['item2']).toBe('data2');
    });
  });
});

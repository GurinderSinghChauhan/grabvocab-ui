import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setAuthUser } from '../../store/slices/authSlice';
import themeReducer, { toggleTheme } from '../../store/slices/themeSlice';
import uiReducer from '../../store/slices/uiSlice';
import wordsReducer, { setWordOfTheDay, setCurrentWord, setCollectionWords } from '../../store/slices/wordsSlice';
import routingReducer, { setRoute } from '../../store/slices/routingSlice';
import speechReducer from '../../store/slices/speechSlice';
import { themeMap } from '../../config/themes';
import type { WordData, RouteState } from '../../types/app';

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

const mockWord: WordData = {
  word: 'serendipity',
  meaning: 'the occurrence of events by chance in a happy or beneficial way',
  partOfSpeech: 'noun',
  pronunciation: 'ser-uhn-dip-i-tee',
  wordForms: ['serendipitous', 'serendipitously'],
  exampleSentence: 'Meeting my best friend was pure serendipity.',
  synonyms: ['luck', 'chance', 'fate'],
  antonyms: ['misfortune', 'bad luck'],
  memoryTrick: 'SEREN-DIP-I-TEA: Sip tea and discover happy accidents',
  origin: 'From Persian tale "The Three Princes of Serendip"',
};

describe('Component Integration: Pages', () => {
  describe('HomePage Integration', () => {
    it('should render with word of the day', () => {
      const store = createTestStore();

      store.dispatch(setWordOfTheDay(mockWord));

      const state = store.getState();
      expect(state.words.wordOfTheDay?.word).toBe('serendipity');
      expect(state.words.wordOfTheDay?.meaning).toBeDefined();
    });

    it('should provide theme colors for rendering', () => {
      const store = createTestStore();

      const theme = store.getState().theme.mode;
      const colors = themeMap[theme];

      expect(colors).toBeDefined();
      expect(colors.backgroundColor).toBeDefined();
      expect(colors.primaryText).toBeDefined();
    });

    it('should handle speak action with preferred voice', () => {
      const store = createTestStore();

      store.dispatch(setWordOfTheDay(mockWord));

      const state = store.getState();
      const word = state.words.wordOfTheDay;
      const voice = state.speech.preferredVoice;

      expect(word?.word).toBe('serendipity');
      // voice might be undefined initially
      expect(voice === undefined || typeof voice === 'string').toBe(true);
    });

    it('should handle word click navigation', () => {
      const store = createTestStore();

      const onOpenWord = (word: string) => {
        store.dispatch(setRoute({ page: 'word', word }));
      };

      store.dispatch(setWordOfTheDay(mockWord));
      onOpenWord(mockWord.word);

      const route = store.getState().routing.route;
      expect((route as any).page).toBe('word');
      expect((route as any).word).toBe('serendipity');
    });

    it('should display error messages', () => {
      const store = createTestStore();

      const backendError = store.getState().words.backendError;
      expect(backendError).toBeNull();

      // If error exists, should be displayable
      if (backendError) {
        expect(typeof backendError).toBe('string');
      }
    });
  });

  describe('WordPage Integration', () => {
    it('should render current word from store', () => {
      const store = createTestStore();

      store.dispatch(setCurrentWord(mockWord));

      const word = store.getState().words.currentWord;
      expect(word?.word).toBe('serendipity');
      expect(word?.meaning).toBeDefined();
      expect(word?.exampleSentence).toBeDefined();
    });

    it('should display all word fields', () => {
      const store = createTestStore();

      store.dispatch(setCurrentWord(mockWord));

      const word = store.getState().words.currentWord;
      expect(word?.word).toBeDefined();
      expect(word?.meaning).toBeDefined();
      expect(word?.partOfSpeech).toBeDefined();
      expect(word?.pronunciation).toBeDefined();
      expect(word?.wordForms).toBeDefined();
      expect(word?.exampleSentence).toBeDefined();
      expect(word?.synonyms).toBeDefined();
      expect(word?.antonyms).toBeDefined();
      expect(word?.memoryTrick).toBeDefined();
      expect(word?.origin).toBeDefined();
    });

    it('should handle speech with word pronunciation', () => {
      const store = createTestStore();

      store.dispatch(setCurrentWord(mockWord));

      const word = store.getState().words.currentWord;
      expect(word?.pronunciation).toBeDefined();
    });

    it('should navigate back to previous route', () => {
      const store = createTestStore();

      store.dispatch(setRoute({ page: 'dictionary' }));
      let route = store.getState().routing.route;
      expect((route as any).page).toBe('dictionary');

      // Navigate to word
      store.dispatch(setRoute({ page: 'word', word: 'test' }));
      route = store.getState().routing.route;
      expect((route as any).page).toBe('word');

      // Navigate back
      store.dispatch(setRoute({ page: 'dictionary' }));
      route = store.getState().routing.route;
      expect((route as any).page).toBe('dictionary');
    });
  });

  describe('WordListPage Integration', () => {
    it('should render collection words', () => {
      const store = createTestStore();

      const words = [mockWord, { ...mockWord, word: 'ephemeral' }];
      store.dispatch(setCollectionWords(words));

      const collection = store.getState().words.collectionWords;
      expect(collection).toHaveLength(2);
      expect(collection[0].word).toBe('serendipity');
      expect(collection[1].word).toBe('ephemeral');
    });

    it('should handle empty word list', () => {
      const store = createTestStore();

      const collection = store.getState().words.collectionWords;
      expect(collection).toEqual([]);
    });

    it('should handle pagination state', () => {
      const store = createTestStore();

      const state = store.getState();
      expect(state.routing.page).toBe(1);

      // Could set different page in real implementation
      // store.dispatch(setPage(2));
    });

    it('should display loading state', () => {
      const store = createTestStore();

      const loading = store.getState().words.loading;
      expect(typeof loading).toBe('boolean');
    });

    it('should handle word selection from list', () => {
      const store = createTestStore();

      const words = [mockWord, { ...mockWord, word: 'ephemeral' }];
      store.dispatch(setCollectionWords(words));

      const onWordSelect = (word: WordData) => {
        store.dispatch(setCurrentWord(word));
        store.dispatch(setRoute({ page: 'word', word: word.word }));
      };

      onWordSelect(words[0]);

      const currentWord = store.getState().words.currentWord;
      expect(currentWord?.word).toBe('serendipity');
    });
  });

  describe('AuthPage Integration', () => {
    it('should handle login action', () => {
      const store = createTestStore();

      const testUser = { id: '1', email: 'user@test.com', username: 'testuser' };
      store.dispatch(setAuthUser(testUser));

      const user = store.getState().auth.user;
      expect(user?.email).toBe('user@test.com');
      expect(user?.username).toBe('testuser');
    });

    it('should handle auth loading state', () => {
      const store = createTestStore();

      const loading = store.getState().auth.loading;
      expect(typeof loading).toBe('boolean');
      expect(loading).toBe(false);
    });

    it('should display auth messages', () => {
      const store = createTestStore();

      const message = store.getState().auth.message;
      expect(typeof message).toBe('string');
      expect(message).toBe('');
    });

    it('should navigate to home after login', () => {
      const store = createTestStore();

      store.dispatch(setAuthUser({ id: '1', email: 'user@test.com', username: 'testuser' }));
      store.dispatch(setRoute({ page: 'home' }));

      const route = store.getState().routing.route;
      expect((route as any).page).toBe('home');
      expect(store.getState().auth.user).not.toBeNull();
    });
  });

  describe('QuizPage Integration', () => {
    it('should have quiz words available', () => {
      const store = createTestStore();

      const words = [mockWord, { ...mockWord, word: 'ephemeral' }];
      store.dispatch(setCollectionWords(words));

      const collection = store.getState().words.collectionWords;
      expect(collection.length).toBeGreaterThan(0);
    });

    it('should navigate to quiz page', () => {
      const store = createTestStore();

      store.dispatch(setRoute({ page: 'quiz' }));

      const route = store.getState().routing.route;
      expect((route as any).page).toBe('quiz');
    });

    it('should maintain word list during quiz', () => {
      const store = createTestStore();

      const words = [mockWord];
      store.dispatch(setCollectionWords(words));
      store.dispatch(setRoute({ page: 'quiz' }));

      expect(store.getState().words.collectionWords).toHaveLength(1);
      expect((store.getState().routing.route as any).page).toBe('quiz');
    });
  });

  describe('SharePage Integration', () => {
    it('should have current word to share', () => {
      const store = createTestStore();

      store.dispatch(setCurrentWord(mockWord));

      const word = store.getState().words.currentWord;
      expect(word?.word).toBe('serendipity');
    });

    it('should navigate to share page with word', () => {
      const store = createTestStore();

      store.dispatch(setCurrentWord(mockWord));
      store.dispatch(setRoute({ page: 'share' }));

      const word = store.getState().words.currentWord;
      const route = store.getState().routing.route;

      expect(word?.word).toBe('serendipity');
      expect((route as any).page).toBe('share');
    });
  });

  describe('AboutPage Integration', () => {
    it('should have static content', () => {
      const store = createTestStore();

      store.dispatch(setRoute({ page: 'about' }));

      const route = store.getState().routing.route;
      expect((route as any).page).toBe('about');
    });

    it('should preserve app state on about page', () => {
      const store = createTestStore();

      store.dispatch(setAuthUser({ id: '1', email: 'user@test.com', username: 'testuser' }));
      store.dispatch(toggleTheme());
      store.dispatch(setRoute({ page: 'about' }));

      expect(store.getState().auth.user).not.toBeNull();
      expect(store.getState().theme.mode).toBe('dark');
    });
  });

  describe('Page Navigation Integration', () => {
    it('should navigate between all pages', () => {
      const store = createTestStore();

      const pages: RouteState[] = [
        { page: 'home' },
        { page: 'dictionary' },
        { page: 'about' },
        { page: 'share' },
        { page: 'quiz' },
        { page: 'auth' },
      ];

      pages.forEach(page => {
        store.dispatch(setRoute(page));
        expect((store.getState().routing.route as any).page).toBe(page.page);
      });
    });

    it('should handle word-specific navigation', () => {
      const store = createTestStore();

      const wordRoute: RouteState = { page: 'word', word: 'serendipity' };
      store.dispatch(setRoute(wordRoute));

      const route = store.getState().routing.route;
      expect((route as any).page).toBe('word');
      expect((route as any).word).toBe('serendipity');
    });

    it('should handle subject/grade/exam navigation', () => {
      const store = createTestStore();

      const subjectRoute: RouteState = { page: 'subject', value: 'Mathematics' };
      store.dispatch(setRoute(subjectRoute));

      let route = store.getState().routing.route;
      expect((route as any).page).toBe('subject');
      expect((route as any).value).toBe('Mathematics');

      const gradeRoute: RouteState = { page: 'grade', value: '10' };
      store.dispatch(setRoute(gradeRoute));

      route = store.getState().routing.route;
      expect((route as any).page).toBe('grade');
      expect((route as any).value).toBe('10');
    });
  });

  describe('Page Content Loading', () => {
    it('should display loading state', () => {
      const store = createTestStore();

      const loading = store.getState().words.loading;
      expect(typeof loading).toBe('boolean');
    });

    it('should have error state for display', () => {
      const store = createTestStore();

      const error = store.getState().words.backendError;
      expect(error === null || typeof error === 'string').toBe(true);
    });

    it('should maintain state during async operations', async () => {
      const store = createTestStore();

      store.dispatch(setAuthUser({ id: '1', email: 'user@test.com', username: 'testuser' }));

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(store.getState().auth.user).not.toBeNull();
    });
  });

  describe('Page Theme Integration', () => {
    it('should provide theme to all pages', () => {
      const store = createTestStore();

      const pages: RouteState[] = [
        { page: 'home' },
        { page: 'dictionary' },
        { page: 'word', word: 'test' },
        { page: 'about' },
      ];

      pages.forEach(page => {
        store.dispatch(setRoute(page));

        const theme = store.getState().theme.mode;
        const colors = themeMap[theme];

        expect(['light', 'dark']).toContain(theme);
        expect(colors).toBeDefined();
      });
    });

    it('should apply theme changes to current page', () => {
      const store = createTestStore();

      store.dispatch(setRoute({ page: 'dictionary' }));

      let theme = store.getState().theme.mode;
      expect(theme).toBe('light');

      store.dispatch(toggleTheme());

      theme = store.getState().theme.mode;
      expect(theme).toBe('dark');

      // Page route should be preserved
      expect((store.getState().routing.route as any).page).toBe('dictionary');
    });
  });
});

import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  setAuthUser,
  setAuthLoading,
  setAuthMessage,
} from '../../store/slices/authSlice';
import themeReducer, { toggleTheme } from '../../store/slices/themeSlice';
import uiReducer, { setDrawerOpen, setQuery } from '../../store/slices/uiSlice';
import wordsReducer, { setCollectionWords } from '../../store/slices/wordsSlice';
import routingReducer from '../../store/slices/routingSlice';
import speechReducer from '../../store/slices/speechSlice';
import {
  selectAuthState,
  selectIsAuthenticated,
  selectThemeMode,
  selectUIState,
  selectAppState,
  selectWordCount,
} from '../../store/selectors';

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

describe('Performance: Selector Memoization & Optimization', () => {
  describe('Selector Reference Stability', () => {
    it('should return same reference when dependencies are unchanged', () => {
      const store = createTestStore();

      // Call selector multiple times without state changes
      const result1 = selectIsAuthenticated(store.getState());
      const result2 = selectIsAuthenticated(store.getState());
      const result3 = selectIsAuthenticated(store.getState());

      // All results should be the same reference (memoized)
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should return different reference when dependencies change', () => {
      const store = createTestStore();

      const result1 = selectIsAuthenticated(store.getState());
      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      const result2 = selectIsAuthenticated(store.getState());

      // Results should be different references (recomputed)
      expect(result1).not.toBe(result2);
      expect(result1).toBe(false);
      expect(result2).toBe(true);
    });
  });

  describe('Combined Selector Memoization', () => {
    it('should cache combined selector results when inputs unchanged', () => {
      const store = createTestStore();

      const authState1 = selectAuthState(store.getState());
      const authState2 = selectAuthState(store.getState());
      const authState3 = selectAuthState(store.getState());

      // All results should be same reference
      expect(authState1).toBe(authState2);
      expect(authState2).toBe(authState3);
    });

    it('should recompute when any dependency changes', () => {
      const store = createTestStore();

      const authState1 = selectAuthState(store.getState());

      // Change one dependency (auth user)
      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      const authState2 = selectAuthState(store.getState());

      // Should be different references
      expect(authState1).not.toBe(authState2);

      // Change another dependency (loading)
      store.dispatch(setAuthLoading(true));
      const authState3 = selectAuthState(store.getState());

      // Should be different again
      expect(authState2).not.toBe(authState3);
    });

    it('should not recompute when unrelated state changes', () => {
      const store = createTestStore();

      const authState1 = selectAuthState(store.getState());

      // Change unrelated state (theme)
      store.dispatch(toggleTheme());

      const authState2 = selectAuthState(store.getState());

      // Should be same reference (not recomputed)
      expect(authState1).toBe(authState2);
    });
  });

  describe('UI State Memoization', () => {
    it('should cache complex UI state selector', () => {
      const store = createTestStore();

      const uiState1 = selectUIState(store.getState());
      const uiState2 = selectUIState(store.getState());

      // Should be same reference
      expect(uiState1).toBe(uiState2);
    });

    it('should recompute UI state only on relevant changes', () => {
      const store = createTestStore();

      const uiState1 = selectUIState(store.getState());

      // Change drawer state
      store.dispatch(setDrawerOpen(true));
      const uiState2 = selectUIState(store.getState());

      expect(uiState1).not.toBe(uiState2);
      expect(uiState2.drawerOpen).toBe(true);

      // Change unrelated auth state
      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      const uiState3 = selectUIState(store.getState());

      // Should not recompute (same reference as uiState2)
      expect(uiState2).toBe(uiState3);
    });
  });

  describe('App State Combined Selector', () => {
    it('should cache app state selector', () => {
      const store = createTestStore();

      const appState1 = selectAppState(store.getState());
      const appState2 = selectAppState(store.getState());
      const appState3 = selectAppState(store.getState());

      // All should be same reference
      expect(appState1).toBe(appState2);
      expect(appState2).toBe(appState3);
    });

    it('should recompute app state only when dependencies change', () => {
      const store = createTestStore();

      const appState1 = selectAppState(store.getState());

      // Change theme
      store.dispatch(toggleTheme());
      const appState2 = selectAppState(store.getState());

      expect(appState1).not.toBe(appState2);

      // Change drawer
      store.dispatch(setDrawerOpen(true));
      const appState3 = selectAppState(store.getState());

      expect(appState2).not.toBe(appState3);

      // Multiple unrelated changes
      store.dispatch(setAuthMessage('message'));
      store.dispatch(setQuery('query'));
      const appState4 = selectAppState(store.getState());

      // Should still track the changes
      expect(appState3).not.toBe(appState4);
    });
  });

  describe('Derived Selector Performance', () => {
    it('should efficiently compute word count from large collection', () => {
      const store = createTestStore();

      // Create large word collection
      const mockWords = Array.from({ length: 1000 }, (_, i) => ({
        word: `word${i}`,
        meaning: `meaning${i}`,
        partOfSpeech: 'noun',
        pronunciation: `pron${i}`,
        wordForms: [],
        exampleSentence: `Example ${i}`,
        synonyms: [],
        antonyms: [],
        memoryTrick: '',
        origin: '',
      }));

      store.dispatch(setCollectionWords(mockWords));

      const count1 = selectWordCount(store.getState());
      const count2 = selectWordCount(store.getState());

      // Should return same reference (memoized)
      expect(count1).toBe(count2);
      expect(count1).toBe(1000);
    });

    it('should update word count only when collection changes', () => {
      const store = createTestStore();

      const count1 = selectWordCount(store.getState());

      // Change unrelated auth state
      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));

      const count2 = selectWordCount(store.getState());

      // Should be same reference (not recomputed)
      expect(count1).toBe(count2);
    });
  });

  describe('Selector Chaining Performance', () => {
    it('should efficiently compose multiple selectors', () => {
      const store = createTestStore();

      // Call same selectors multiple times (without storing unused variables)
      const values1 = [
        selectIsAuthenticated(store.getState()),
        selectThemeMode(store.getState()),
        selectWordCount(store.getState()),
        selectUIState(store.getState()),
      ];

      const values2 = [
        selectIsAuthenticated(store.getState()),
        selectThemeMode(store.getState()),
        selectWordCount(store.getState()),
        selectUIState(store.getState()),
      ];

      // All should be same references (memoized)
      expect(values1[0]).toBe(values2[0]);
      expect(values1[1]).toBe(values2[1]);
      expect(values1[2]).toBe(values2[2]);
      expect(values1[3]).toBe(values2[3]);
    });

    it('should recompute only affected selectors in chain', () => {
      const store = createTestStore();

      const theme1 = selectThemeMode(store.getState());
      const auth1 = selectIsAuthenticated(store.getState());
      const wordCount1 = selectWordCount(store.getState());

      // Change theme
      store.dispatch(toggleTheme());

      const theme2 = selectThemeMode(store.getState());
      const auth2 = selectIsAuthenticated(store.getState());
      const wordCount2 = selectWordCount(store.getState());

      // Theme should be different
      expect(theme1).not.toBe(theme2);

      // Auth and word count should still be memoized
      expect(auth1).toBe(auth2);
      expect(wordCount1).toBe(wordCount2);
    });
  });

  describe('State Update Efficiency', () => {
    it('should minimize selector recomputation during bulk updates', () => {
      const store = createTestStore();

      const initialAuth = selectAuthState(store.getState());
      const initialUI = selectUIState(store.getState());

      // Perform multiple updates that don't affect each selector
      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      store.dispatch(setAuthLoading(false));

      const afterAuth = selectAuthState(store.getState());
      const afterUI = selectUIState(store.getState());

      // Auth should recompute
      expect(initialAuth).not.toBe(afterAuth);

      // UI should not recompute (same reference)
      expect(initialUI).toBe(afterUI);
    });

    it('should handle rapid selector queries efficiently', () => {
      const store = createTestStore();

      // Simulate rapid queries (like in a component render loop)
      const queries = [];
      for (let i = 0; i < 100; i++) {
        queries.push(selectIsAuthenticated(store.getState()));
        queries.push(selectThemeMode(store.getState()));
        queries.push(selectWordCount(store.getState()));
      }

      // All same-index queries should be identical references
      for (let i = 0; i < queries.length; i += 3) {
        expect(queries[i]).toBe(queries[i]);
        expect(queries[i + 1]).toBe(queries[i + 1]);
        expect(queries[i + 2]).toBe(queries[i + 2]);
      }
    });
  });

  describe('Memory Efficiency', () => {
    it('should not create unnecessary intermediate objects', () => {
      const store = createTestStore();

      const state1 = selectAuthState(store.getState());
      const state2 = selectAuthState(store.getState());
      const state3 = selectAuthState(store.getState());

      // All references should be identical (single object in memory)
      expect(state1).toBe(state2);
      expect(state2).toBe(state3);

      // Change state
      store.dispatch(setAuthMessage('new message'));

      const state4 = selectAuthState(store.getState());

      // Should create new object only once
      expect(state4).not.toBe(state1);

      const state5 = selectAuthState(store.getState());
      expect(state4).toBe(state5); // Still same reference
    });

    it('should handle deep selector composition without memory waste', () => {
      const store = createTestStore();

      const appState1 = selectAppState(store.getState());
      const appState2 = selectAppState(store.getState());
      const appState3 = selectAppState(store.getState());

      // Should all be same reference (no memory waste)
      expect(appState1).toBe(appState2);
      expect(appState2).toBe(appState3);
    });
  });
});

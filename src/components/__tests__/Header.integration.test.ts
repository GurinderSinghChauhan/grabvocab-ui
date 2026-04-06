import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setAuthUser, logout } from '../../store/slices/authSlice';
import themeReducer, { toggleTheme } from '../../store/slices/themeSlice';
import uiReducer, { setOpenDropdown, setQuery, setSuggestions, toggleDrawer } from '../../store/slices/uiSlice';
import wordsReducer, { setWordOfTheDay } from '../../store/slices/wordsSlice';
import routingReducer, { setRoute } from '../../store/slices/routingSlice';
import speechReducer from '../../store/slices/speechSlice';
import {
  selectAuthUser,
  selectThemeMode,
  selectUIOpenDropdown,
  selectUIQuery,
  selectUISuggestions,
} from '../../store/selectors';
import { themeMap } from '../../config/themes';
import type { ThemeMode } from '../../types/app';

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

describe('Component Integration: Header', () => {
  describe('Theme Integration', () => {
    it('should provide correct colors based on theme mode', () => {
      const store = createTestStore();

      const initialTheme = selectThemeMode(store.getState());
      expect(initialTheme).toBe('light');

      // Get colors for light theme
      const lightColors = themeMap.light;
      expect(lightColors).toBeDefined();
      expect(lightColors.headerColor).toBeDefined();
      expect(lightColors.backgroundColor).toBeDefined();
      expect(lightColors.primaryText).toBeDefined();

      // Toggle theme
      store.dispatch(toggleTheme());
      const darkTheme = selectThemeMode(store.getState());
      expect(darkTheme).toBe('dark');

      // Get colors for dark theme
      const darkColors = themeMap.dark;
      expect(darkColors).toBeDefined();
      expect(darkColors.headerColor).toBeDefined();
      expect(darkColors.primaryText).toBeDefined();

      // Verify themes are different objects with different color sets
      expect(lightColors).not.toBe(darkColors);
    });

    it('should track theme changes for header re-renders', () => {
      const store = createTestStore();
      const themes: ThemeMode[] = [];

      // Record theme before dispatch
      themes.push(selectThemeMode(store.getState()));

      // Dispatch toggle
      store.dispatch(toggleTheme());
      themes.push(selectThemeMode(store.getState()));

      // Dispatch toggle again
      store.dispatch(toggleTheme());
      themes.push(selectThemeMode(store.getState()));

      expect(themes).toEqual(['light', 'dark', 'light']);
    });
  });

  describe('Auth Status Integration', () => {
    it('should render logged out state when no user', () => {
      const store = createTestStore();
      const user = selectAuthUser(store.getState());
      expect(user).toBeNull();
    });

    it('should render logged in state with user data', () => {
      const store = createTestStore();

      const testUser = { id: '1', email: 'user@test.com', username: 'testuser' };
      store.dispatch(setAuthUser(testUser));

      const user = selectAuthUser(store.getState());
      expect(user?.email).toBe('user@test.com');
      expect(user?.username).toBe('testuser');
    });

    it('should handle logout clearing auth state', () => {
      const store = createTestStore();

      store.dispatch(setAuthUser({ id: '1', email: 'user@test.com', username: 'testuser' }));
      let user = selectAuthUser(store.getState());
      expect(user).not.toBeNull();

      store.dispatch(logout());
      user = selectAuthUser(store.getState());
      expect(user).toBeNull();
    });
  });

  describe('Search Integration', () => {
    it('should track search query state', () => {
      const store = createTestStore();

      const initialQuery = selectUIQuery(store.getState());
      expect(initialQuery).toBe('');

      store.dispatch(setQuery('test'));
      const query = selectUIQuery(store.getState());
      expect(query).toBe('test');
    });

    it('should track suggestions from API response', () => {
      const store = createTestStore();

      const initialSuggestions = selectUISuggestions(store.getState());
      expect(initialSuggestions).toEqual([]);

      const mockSuggestions = ['test', 'testing', 'tested'];
      store.dispatch(setSuggestions(mockSuggestions));

      const suggestions = selectUISuggestions(store.getState());
      expect(suggestions).toEqual(mockSuggestions);
    });

    it('should maintain query and suggestions separately', () => {
      const store = createTestStore();

      store.dispatch(setQuery('vocab'));
      store.dispatch(setSuggestions(['vocabulary', 'vocal', 'vocalize']));

      const query = selectUIQuery(store.getState());
      const suggestions = selectUISuggestions(store.getState());

      expect(query).toBe('vocab');
      expect(suggestions.length).toBe(3);
    });
  });

  describe('Navigation Dropdown Integration', () => {
    it('should track dropdown open state', () => {
      const store = createTestStore();

      const initialDropdown = selectUIOpenDropdown(store.getState());
      expect(initialDropdown).toBeNull();

      store.dispatch(setOpenDropdown('Subject'));
      const dropdown = selectUIOpenDropdown(store.getState());
      expect(dropdown).toBe('Subject');
    });

    it('should allow switching between dropdowns', () => {
      const store = createTestStore();

      store.dispatch(setOpenDropdown('Subject'));
      let dropdown = selectUIOpenDropdown(store.getState());
      expect(dropdown).toBe('Subject');

      store.dispatch(setOpenDropdown('Grades'));
      dropdown = selectUIOpenDropdown(store.getState());
      expect(dropdown).toBe('Grades');

      store.dispatch(setOpenDropdown(null));
      dropdown = selectUIOpenDropdown(store.getState());
      expect(dropdown).toBeNull();
    });

    it('should close dropdown when selecting null', () => {
      const store = createTestStore();

      store.dispatch(setOpenDropdown('Exam'));
      let dropdown = selectUIOpenDropdown(store.getState());
      expect(dropdown).toBe('Exam');

      store.dispatch(setOpenDropdown(null));
      dropdown = selectUIOpenDropdown(store.getState());
      expect(dropdown).toBeNull();
    });
  });

  describe('Header State Composition', () => {
    it('should provide all header state in single snapshot', () => {
      const store = createTestStore();

      // Setup complete header state
      store.dispatch(setAuthUser({ id: '1', email: 'user@test.com', username: 'testuser' }));
      store.dispatch(toggleTheme());
      store.dispatch(setQuery('vocab'));
      store.dispatch(setSuggestions(['vocabulary', 'vocal']));
      store.dispatch(setOpenDropdown('Subject'));

      const state = store.getState();

      // Verify all components have correct state
      expect(state.auth.user?.email).toBe('user@test.com');
      expect(state.theme.mode).toBe('dark');
      expect(state.ui.query).toBe('vocab');
      expect(state.ui.suggestions).toHaveLength(2);
      expect(state.ui.openDropdown).toBe('Subject');
    });

    it('should not have side effects between selections', () => {
      const store = createTestStore();

      const user = { id: '1', email: 'user@test.com', username: 'testuser' };
      store.dispatch(setAuthUser(user));

      // These actions should not affect auth state
      store.dispatch(toggleTheme());
      store.dispatch(setQuery('search'));
      store.dispatch(setSuggestions(['a', 'b']));

      const authUser = selectAuthUser(store.getState());
      expect(authUser?.email).toBe(user.email);
    });
  });

  describe('Header Action Handlers', () => {
    it('should handle theme toggle through Redux', () => {
      const store = createTestStore();

      const onToggleTheme = () => {
        store.dispatch(toggleTheme());
      };

      expect(selectThemeMode(store.getState())).toBe('light');

      onToggleTheme();
      expect(selectThemeMode(store.getState())).toBe('dark');

      onToggleTheme();
      expect(selectThemeMode(store.getState())).toBe('light');
    });

    it('should handle search query update through Redux', () => {
      const store = createTestStore();

      const updateQuery = (value: string) => {
        store.dispatch(setQuery(value));
      };

      updateQuery('test');
      expect(selectUIQuery(store.getState())).toBe('test');

      updateQuery('');
      expect(selectUIQuery(store.getState())).toBe('');
    });

    it('should handle suggestion press through Redux', () => {
      const store = createTestStore();

      store.dispatch(setSuggestions(['test', 'testing', 'tested']));

      const onSuggestionPress = (word: string) => {
        store.dispatch(setQuery(word));
      };

      onSuggestionPress('testing');
      expect(selectUIQuery(store.getState())).toBe('testing');
    });

    it('should handle dropdown selection through Redux', () => {
      const store = createTestStore();

      const onDropdownSelect = (group: string, value: string) => {
        store.dispatch(setOpenDropdown(group as any));
        // Typically also dispatch route change
        store.dispatch(setRoute({ page: group.toLowerCase() as any, value }));
      };

      onDropdownSelect('Subject', 'Mathematics');
      expect(selectUIOpenDropdown(store.getState())).toBe('Subject');
    });
  });

  describe('Header Logo Navigation', () => {
    it('should handle home button press through Redux', () => {
      const store = createTestStore();

      const onHome = () => {
        store.dispatch(setRoute({ page: 'home' }));
      };

      onHome();

      const route = store.getState().routing.route;
      expect(route.page).toBe('home');
    });

    it('should preserve other state when navigating home', () => {
      const store = createTestStore();

      store.dispatch(setAuthUser({ id: '1', email: 'user@test.com', username: 'testuser' }));
      store.dispatch(toggleTheme());

      const onHome = () => {
        store.dispatch(setRoute({ page: 'home' }));
      };

      onHome();

      // Auth and theme should be preserved
      expect(selectAuthUser(store.getState())).not.toBeNull();
      expect(selectThemeMode(store.getState())).toBe('dark');
    });
  });

  describe('Mobile Header (Drawer) Integration', () => {
    it('should track drawer open state', () => {
      const store = createTestStore();

      let drawerOpen = store.getState().ui.drawerOpen;
      expect(drawerOpen).toBe(false);

      store.dispatch(toggleDrawer());
      drawerOpen = store.getState().ui.drawerOpen;
      expect(drawerOpen).toBe(true);

      store.dispatch(toggleDrawer());
      drawerOpen = store.getState().ui.drawerOpen;
      expect(drawerOpen).toBe(false);
    });

    it('should close drawer on navigation', () => {
      const store = createTestStore();

      store.dispatch(toggleDrawer());
      expect(store.getState().ui.drawerOpen).toBe(true);

      const onNavigation = () => {
        store.dispatch(setRoute({ page: 'home' }));
        // Typically also closes drawer
        if (store.getState().ui.drawerOpen) {
          store.dispatch(toggleDrawer());
        }
      };

      onNavigation();
      expect(store.getState().ui.drawerOpen).toBe(false);
    });
  });

  describe('Header Performance', () => {
    it('should not re-render unnecessarily with unrelated state changes', () => {
      const store = createTestStore();

      store.dispatch(setAuthUser({ id: '1', email: 'user@test.com', username: 'testuser' }));
      const authState1 = selectAuthUser(store.getState());

      // Change unrelated state (word data)
      store.dispatch(setWordOfTheDay({
        word: 'serendipity',
        meaning: 'lucky occurrence',
        partOfSpeech: 'noun',
        pronunciation: 'ser-uh-nip-i-tee',
        wordForms: [],
        exampleSentence: 'It was a happy serendipity.',
        synonyms: ['luck'],
        antonyms: [],
        memoryTrick: '',
        origin: 'Persian',
      }));

      const authState2 = selectAuthUser(store.getState());

      // Auth selector should return same reference (memoized)
      expect(authState1).toBe(authState2);
    });

    it('should efficiently handle rapid state updates', () => {
      const store = createTestStore();

      // Simulate rapid user interactions
      for (let i = 0; i < 10; i++) {
        store.dispatch(setQuery(`query${i}`));
      }

      expect(selectUIQuery(store.getState())).toBe('query9');
    });
  });

  describe('Header State Validation', () => {
    it('should maintain valid header state structure', () => {
      const store = createTestStore();

      store.dispatch(setAuthUser({ id: '1', email: 'user@test.com', username: 'testuser' }));
      store.dispatch(toggleTheme());
      store.dispatch(setQuery('test'));
      store.dispatch(setSuggestions(['a', 'b']));
      store.dispatch(setOpenDropdown('Subject'));

      const state = store.getState();

      // Auth
      expect(typeof state.auth.user?.id).toBe('string');
      expect(typeof state.auth.user?.email).toBe('string');
      expect(typeof state.auth.loading).toBe('boolean');

      // Theme
      expect(['light', 'dark']).toContain(state.theme.mode);

      // UI
      expect(typeof state.ui.query).toBe('string');
      expect(Array.isArray(state.ui.suggestions)).toBe(true);
      expect([null, 'Subject', 'Grades', 'Exam']).toContain(state.ui.openDropdown);
    });
  });
});

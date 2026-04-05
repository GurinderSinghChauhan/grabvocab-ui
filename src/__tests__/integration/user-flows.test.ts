import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setAuthUser, setAuthLoading, setAuthMessage, clearAuthMessage, logout } from '../../store/slices/authSlice';
import themeReducer, { toggleTheme } from '../../store/slices/themeSlice';

type RootState = {
  auth: ReturnType<typeof authReducer>;
  theme: ReturnType<typeof themeReducer>;
};

// Factory function to create fresh store for each test
function createFreshStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      theme: themeReducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['FLUSH', 'REHYDRATE', 'PAUSE', 'PERSIST', 'PURGE', 'REGISTER'],
          ignoredPaths: ['auth.voice'],
        },
      }),
  });
}

describe('User Flows: Complex Interaction Patterns', () => {
  describe('Authentication Flow with Theme Preference', () => {
    it('should maintain user theme preference through login/logout cycle', () => {
      const store = createFreshStore();

      // User sets dark theme before login
      store.dispatch(toggleTheme());
      let state = store.getState() as RootState;
      expect(state.theme.mode).toBe('dark');

      // User logs in
      store.dispatch(setAuthUser({ id: '1', email: 'user@test.com', username: 'testuser' }));
      state = store.getState() as RootState;
      expect(state.auth.user?.email).toBe('user@test.com');
      expect(state.theme.mode).toBe('dark'); // Theme should persist

      // User logs out
      store.dispatch(logout());
      state = store.getState() as RootState;
      expect(state.auth.user).toBeNull();
      expect(state.theme.mode).toBe('dark'); // Theme still persists
    });
  });

  describe('Loading State Management', () => {
    it('should properly handle loading transitions during auth operations', () => {
      const store = createFreshStore();

      // Start loading
      store.dispatch(setAuthLoading(true));
      let state = store.getState() as RootState;
      expect(state.auth.loading).toBe(true);

      // Simulate auth completion
      store.dispatch(setAuthUser({ id: '1', email: 'user@test.com', username: 'testuser' }));
      store.dispatch(setAuthLoading(false));
      state = store.getState() as RootState;
      expect(state.auth.loading).toBe(false);
      expect(state.auth.user).not.toBeNull();
    });
  });

  describe('Error Message Lifecycle', () => {
    it('should display and clear error messages correctly', () => {
      const store = createFreshStore();

      // Set error message
      store.dispatch(setAuthMessage('Invalid credentials'));
      let state = store.getState() as RootState;
      expect(state.auth.message).toBe('Invalid credentials');

      // Clear message on new login
      store.dispatch(setAuthUser({ id: '1', email: 'user@test.com', username: 'testuser' }));
      state = store.getState() as RootState;
      expect(state.auth.message).toBe('Invalid credentials');

      // Explicitly clear message
      store.dispatch(clearAuthMessage());
      state = store.getState() as RootState;
      expect(state.auth.message).toBe('');
    });
  });

  describe('Rapid State Changes', () => {
    it('should handle multiple rapid state dispatches correctly', () => {
      const store = createFreshStore();

      // Rapid theme toggles
      store.dispatch(toggleTheme());
      store.dispatch(toggleTheme());
      store.dispatch(toggleTheme());

      let state = store.getState() as RootState;
      expect(state.theme.mode).toBe('dark');

      // Rapid auth operations
      store.dispatch(setAuthLoading(true));
      store.dispatch(setAuthUser({ id: '1', email: 'user@test.com', username: 'testuser' }));
      store.dispatch(setAuthLoading(false));

      state = store.getState() as RootState;
      expect(state.auth.loading).toBe(false);
      expect(state.auth.user?.email).toBe('user@test.com');
    });
  });

  describe('State Isolation Between Tests', () => {
    it('should have fresh auth state in first test', () => {
      const store = createFreshStore();
      const state = store.getState() as RootState;
      expect(state.auth.user).toBeNull();
      expect(state.auth.loading).toBe(false);
    });

    it('should have fresh auth state in second test', () => {
      const store = createFreshStore();
      const state = store.getState() as RootState;
      expect(state.auth.user).toBeNull();
      expect(state.auth.loading).toBe(false);
    });
  });

  describe('Multi-Step User Session', () => {
    it('should execute complete user session lifecycle', () => {
      const store = createFreshStore();

      // Step 1: User arrives and sets theme preference
      store.dispatch(toggleTheme());
      let state = store.getState() as RootState;
      expect(state.theme.mode).toBe('dark');

      // Step 2: User starts login process
      store.dispatch(setAuthLoading(true));
      state = store.getState() as RootState;
      expect(state.auth.loading).toBe(true);

      // Step 3: Login completes
      store.dispatch(setAuthUser({ id: '123', email: 'john@test.com', username: 'johndoe' }));
      store.dispatch(setAuthLoading(false));
      state = store.getState() as RootState;
      expect(state.auth.user?.email).toBe('john@test.com');
      expect(state.auth.loading).toBe(false);

      // Step 4: User logs out
      store.dispatch(logout());
      state = store.getState() as RootState;
      expect(state.auth.user).toBeNull();
      expect(state.auth.message).toBe('');
    });
  });
});

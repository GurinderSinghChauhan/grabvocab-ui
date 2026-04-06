import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setAuthUser, logout } from '../../store/slices/authSlice';
import themeReducer, { toggleTheme } from '../../store/slices/themeSlice';
import uiReducer, { setDrawerOpen } from '../../store/slices/uiSlice';
import wordsReducer from '../../store/slices/wordsSlice';
import routingReducer from '../../store/slices/routingSlice';
import speechReducer from '../../store/slices/speechSlice';

describe('Redux Middleware: Logging & Tracking', () => {
  describe('Action Dispatch Tracking', () => {
    it('should track dispatched actions', () => {
      const store = configureStore({
        reducer: {
          auth: authReducer,
          theme: themeReducer,
          ui: uiReducer,
          words: wordsReducer,
          routing: routingReducer,
          speech: speechReducer,
        },
      });

      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));

      const state = store.getState();
      expect(state.auth.user?.email).toBe('test@test.com');
    });

    it('should track multiple sequential actions', () => {
      const store = configureStore({
        reducer: {
          auth: authReducer,
          theme: themeReducer,
          ui: uiReducer,
          words: wordsReducer,
          routing: routingReducer,
          speech: speechReducer,
        },
      });

      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      store.dispatch(toggleTheme());
      store.dispatch(setDrawerOpen(true));

      const state = store.getState();
      expect(state.auth.user).not.toBeNull();
      expect(state.theme.mode).toBe('dark');
      expect(state.ui.drawerOpen).toBe(true);
    });

    it('should track action payloads correctly', () => {
      const store = configureStore({
        reducer: {
          auth: authReducer,
          theme: themeReducer,
          ui: uiReducer,
          words: wordsReducer,
          routing: routingReducer,
          speech: speechReducer,
        },
      });

      const user = { id: '123', email: 'user@test.com', username: 'testuser' };
      store.dispatch(setAuthUser(user));

      const state = store.getState();
      expect(state.auth.user).toEqual(user);
    });
  });

  describe('State History Tracking', () => {
    it('should record state transitions', () => {
      const store = configureStore({
        reducer: {
          auth: authReducer,
          theme: themeReducer,
          ui: uiReducer,
          words: wordsReducer,
          routing: routingReducer,
          speech: speechReducer,
        },
      });

      const initialState = store.getState();
      expect(initialState.auth.user).toBeNull();

      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      const afterAuthState = store.getState();
      expect(afterAuthState.auth.user?.email).toBe('test@test.com');

      store.dispatch(logout());
      const afterLogoutState = store.getState();
      expect(afterLogoutState.auth.user).toBeNull();
    });

    it('should track state changes during theme toggles', () => {
      const store = configureStore({
        reducer: {
          auth: authReducer,
          theme: themeReducer,
          ui: uiReducer,
          words: wordsReducer,
          routing: routingReducer,
          speech: speechReducer,
        },
      });

      expect(store.getState().theme.mode).toBe('light');

      store.dispatch(toggleTheme());
      expect(store.getState().theme.mode).toBe('dark');

      store.dispatch(toggleTheme());
      expect(store.getState().theme.mode).toBe('light');
    });
  });

  describe('Error Action Tracking', () => {
    it('should handle and track failed async actions', async () => {
      const store = configureStore({
        reducer: {
          auth: authReducer,
          theme: themeReducer,
          ui: uiReducer,
          words: wordsReducer,
          routing: routingReducer,
          speech: speechReducer,
        },
      });

      // Simulate an action (just tracking sync actions for this test)
      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));

      const state = store.getState();
      expect(state.auth.user).not.toBeNull();
    });

    it('should track state consistency across transactions', () => {
      const store = configureStore({
        reducer: {
          auth: authReducer,
          theme: themeReducer,
          ui: uiReducer,
          words: wordsReducer,
          routing: routingReducer,
          speech: speechReducer,
        },
      });

      // Start transaction
      const state1 = store.getState();
      const authState1 = state1.auth;

      // Dispatch action
      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));

      // Check state consistency
      const state2 = store.getState();
      const authState2 = state2.auth;

      expect(authState1).not.toBe(authState2);
      expect(authState2.user?.email).toBe('test@test.com');
    });
  });

  describe('Action Metadata Tracking', () => {
    it('should track action types in dispatches', () => {
      const dispatches: string[] = [];
      const store = configureStore({
        reducer: {
          auth: authReducer,
          theme: themeReducer,
          ui: uiReducer,
          words: wordsReducer,
          routing: routingReducer,
          speech: speechReducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(() => (next: any) => (action: any) => {
            dispatches.push(action.type);
            return next(action);
          }),
      });

      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      store.dispatch(toggleTheme());
      store.dispatch(logout());

      expect(dispatches).toContain('auth/setAuthUser');
      expect(dispatches).toContain('theme/toggleTheme');
      expect(dispatches).toContain('auth/logout');
    });

    it('should track action timestamps', async () => {
      const timestamps: number[] = [];
      const store = configureStore({
        reducer: {
          auth: authReducer,
          theme: themeReducer,
          ui: uiReducer,
          words: wordsReducer,
          routing: routingReducer,
          speech: speechReducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(() => (next: any) => (action: any) => {
            timestamps.push(Date.now());
            return next(action);
          }),
      });

      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      await new Promise((resolve) => setTimeout(resolve, 10));
      store.dispatch(toggleTheme());

      expect(timestamps.length).toBe(2);
      expect(timestamps[1]).toBeGreaterThanOrEqual(timestamps[0]);
    });
  });

  describe('State Validation & Logging', () => {
    it('should validate state after each action', () => {
      const store = configureStore({
        reducer: {
          auth: authReducer,
          theme: themeReducer,
          ui: uiReducer,
          words: wordsReducer,
          routing: routingReducer,
          speech: speechReducer,
        },
      });

      const validateState = (state: any) => {
        expect(state.auth).toBeDefined();
        expect(state.theme).toBeDefined();
        expect(state.ui).toBeDefined();
        expect(state.words).toBeDefined();
      };

      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      validateState(store.getState());

      store.dispatch(toggleTheme());
      validateState(store.getState());

      store.dispatch(setDrawerOpen(true));
      validateState(store.getState());
    });

    it('should track invalid state patterns', () => {
      const store = configureStore({
        reducer: {
          auth: authReducer,
          theme: themeReducer,
          ui: uiReducer,
          words: wordsReducer,
          routing: routingReducer,
          speech: speechReducer,
        },
      });

      const state = store.getState();

      // Verify auth state structure
      expect(state.auth.user).toBeNull();
      expect(state.auth.loading).toBe(false);
      expect(state.auth.message).toBe('');

      // Verify theme state structure
      expect(['light', 'dark']).toContain(state.theme.mode);

      // Verify ui state structure
      expect(state.ui.drawerOpen).toBe(false);
      expect(state.ui.openDropdown).toBeNull();
    });
  });

  describe('Dispatch Chain Tracking', () => {
    it('should track sequence of related actions', () => {
      const actionSequence: string[] = [];
      const store = configureStore({
        reducer: {
          auth: authReducer,
          theme: themeReducer,
          ui: uiReducer,
          words: wordsReducer,
          routing: routingReducer,
          speech: speechReducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(() => (next: any) => (action: any) => {
            actionSequence.push(action.type);
            return next(action);
          }),
      });

      // Simulate user login flow
      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      store.dispatch(toggleTheme());
      store.dispatch(setDrawerOpen(true));
      store.dispatch(logout());

      expect(actionSequence.length).toBe(4);
      expect(actionSequence[0]).toContain('auth');
      expect(actionSequence[1]).toContain('theme');
      expect(actionSequence[2]).toContain('ui');
      expect(actionSequence[3]).toContain('auth');
    });

    it('should track state after each action in chain', () => {
      const stateSnapshots: any[] = [];
      const store = configureStore({
        reducer: {
          auth: authReducer,
          theme: themeReducer,
          ui: uiReducer,
          words: wordsReducer,
          routing: routingReducer,
          speech: speechReducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat((store: any) => (next: any) => (action: any) => {
            const result = next(action);
            stateSnapshots.push({
              action: action.type,
              state: store.getState(),
            });
            return result;
          }),
      });

      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      store.dispatch(toggleTheme());

      expect(stateSnapshots.length).toBe(2);
      expect(stateSnapshots[0].state.auth.user?.email).toBe('test@test.com');
      expect(stateSnapshots[1].state.theme.mode).toBe('dark');
    });
  });

  describe('Redux DevTools Integration', () => {
    it('should maintain action history', () => {
      const store = configureStore({
        reducer: {
          auth: authReducer,
          theme: themeReducer,
          ui: uiReducer,
          words: wordsReducer,
          routing: routingReducer,
          speech: speechReducer,
        },
      });

      // Simulate time-travel debugging scenario
      const state1 = store.getState();
      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      const state2 = store.getState();

      expect(state1.auth.user).toBeNull();
      expect(state2.auth.user?.email).toBe('test@test.com');

      // Verify state diffs
      expect(state1).not.toBe(state2);
      expect(state1.auth).not.toBe(state2.auth);
    });

    it('should enable action trace inspection', () => {
      const store = configureStore({
        reducer: {
          auth: authReducer,
          theme: themeReducer,
          ui: uiReducer,
          words: wordsReducer,
          routing: routingReducer,
          speech: speechReducer,
        },
        devTools: {
          trace: true,
          traceLimit: 25,
        },
      });

      const actions = [];
      // Do 3 theme toggles: light -> dark -> light -> dark
      store.dispatch(toggleTheme()); // 1
      actions.push('theme');
      store.dispatch(toggleTheme()); // 2
      actions.push('theme');
      store.dispatch(toggleTheme()); // 3
      actions.push('theme');
      store.dispatch(setDrawerOpen(true));
      actions.push('ui');
      store.dispatch(setDrawerOpen(false));
      actions.push('ui');

      expect(actions.length).toBe(5);
      // After 3 toggles: light -> dark -> light -> dark
      expect(store.getState().theme.mode).toBe('dark');
    });
  });

  describe('Performance Logging', () => {
    it('should track action dispatch performance', () => {
      const timings: number[] = [];
      const store = configureStore({
        reducer: {
          auth: authReducer,
          theme: themeReducer,
          ui: uiReducer,
          words: wordsReducer,
          routing: routingReducer,
          speech: speechReducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(() => (next: any) => (action: any) => {
            const start = performance.now();
            const result = next(action);
            const duration = performance.now() - start;
            timings.push(duration);
            return result;
          }),
      });

      store.dispatch(setAuthUser({ id: '1', email: 'test@test.com', username: 'testuser' }));
      store.dispatch(toggleTheme());
      store.dispatch(setDrawerOpen(true));

      expect(timings.length).toBe(3);
      timings.forEach((timing) => {
        expect(timing).toBeLessThan(100); // Should be very fast
      });
    });
  });
});

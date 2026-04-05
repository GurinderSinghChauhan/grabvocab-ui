import { configureStore } from '@reduxjs/toolkit';
import themeReducer, { setTheme, toggleTheme } from '../../store/slices/themeSlice';
import authReducer, { setAuthUser, logout } from '../../store/slices/authSlice';
import uiReducer, { setQuery, setDrawerOpen, closeDrawer } from '../../store/slices/uiSlice';

describe('Integration: Redux State Flow', () => {
  const store = configureStore({
    reducer: {
      theme: themeReducer,
      auth: authReducer,
      ui: uiReducer,
    },
  });

  it('should handle complete user session flow', () => {
    let state = store.getState();

    // Initial state
    expect(state.auth.user).toBeNull();
    expect(state.theme.mode).toBe('light');
    expect(state.ui.drawerOpen).toBe(false);

    // User logs in
    const user = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
    };
    store.dispatch(setAuthUser(user));

    state = store.getState();
    expect(state.auth.user).toEqual(user);

    // User changes theme
    store.dispatch(toggleTheme());
    state = store.getState();
    expect(state.theme.mode).toBe('dark');

    // User opens drawer
    store.dispatch(setDrawerOpen(true));
    state = store.getState();
    expect(state.ui.drawerOpen).toBe(true);

    // User searches
    store.dispatch(setQuery('vocabulary'));
    state = store.getState();
    expect(state.ui.query).toBe('vocabulary');

    // User closes drawer
    store.dispatch(closeDrawer());
    state = store.getState();
    expect(state.ui.drawerOpen).toBe(false);

    // User logs out
    store.dispatch(logout());
    state = store.getState();
    expect(state.auth.user).toBeNull();
  });

  it('should handle theme preferences independently', () => {
    // Set theme while authenticated
    const user = {
      id: '2',
      username: 'user2',
      email: 'user2@example.com',
    };

    store.dispatch(setAuthUser(user));
    store.dispatch(setTheme('dark'));

    let state = store.getState();
    expect(state.auth.user).toEqual(user);
    expect(state.theme.mode).toBe('dark');

    // Logout shouldn't affect theme
    store.dispatch(logout());
    state = store.getState();
    expect(state.auth.user).toBeNull();
    expect(state.theme.mode).toBe('dark'); // Theme persists
  });

  it('should handle multiple UI state changes', () => {
    // Multiple rapid changes
    store.dispatch(setDrawerOpen(true));
    store.dispatch(setQuery('word1'));
    store.dispatch(toggleTheme());
    store.dispatch(setDrawerOpen(false));
    store.dispatch(setQuery('word2'));

    const state = store.getState();
    expect(state.ui.drawerOpen).toBe(false);
    expect(state.ui.query).toBe('word2');
    expect(state.theme.mode).toBe('light'); // Toggled twice, back to light
  });
});

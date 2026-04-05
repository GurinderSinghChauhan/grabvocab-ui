import { configureStore } from '@reduxjs/toolkit';
import themeReducer, { setTheme, toggleTheme } from '../slices/themeSlice';

describe('themeSlice', () => {
  const store = configureStore({
    reducer: { theme: themeReducer },
  });

  it('should have initial light theme', () => {
    const state = store.getState().theme;
    expect(state.mode).toBe('light');
  });

  it('should set theme to dark', () => {
    store.dispatch(setTheme('dark'));
    expect(store.getState().theme.mode).toBe('dark');
  });

  it('should set theme to light', () => {
    store.dispatch(setTheme('light'));
    expect(store.getState().theme.mode).toBe('light');
  });

  it('should toggle theme', () => {
    store.dispatch(setTheme('light'));
    store.dispatch(toggleTheme());
    expect(store.getState().theme.mode).toBe('dark');

    store.dispatch(toggleTheme());
    expect(store.getState().theme.mode).toBe('light');
  });
});
